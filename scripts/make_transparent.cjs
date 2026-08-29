const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImageToTransparent(inputPath, outputPath) {
  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Visited array for flood fill
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Helper to check if a pixel is "background white/near-white"
  function isBgWhite(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Check luminance and color distance from pure white/light gray
    const minVal = Math.min(r, g, b);
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return minVal > 228 && maxDiff < 30;
  }

  // Helper to check soft edge
  function getBgAlpha(r, g, b) {
    const minVal = Math.min(r, g, b);
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (minVal > 245 && maxDiff < 15) return 0;
    if (minVal > 225 && maxDiff < 25) {
      // Linear ramp from 0 to 255 between 245 and 225
      return Math.round(((245 - minVal) / 20) * 255);
    }
    return 255;
  }

  // Push all outer border pixels to start flood fill
  for (let x = 0; x < width; x++) {
    if (isBgWhite(x, 0)) { queue.push(x, 0); visited[0 * width + x] = 1; }
    if (isBgWhite(x, height - 1)) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
  }
  for (let y = 0; y < height; y++) {
    if (isBgWhite(0, y)) { queue.push(0, y); visited[y * width + 0] = 1; }
    if (isBgWhite(width - 1, y)) { queue.push(width - 1, y); visited[y * width + (width - 1)] = 1; }
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos] && isBgWhite(nx, ny)) {
          visited[nPos] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Now apply alpha channel based on connected background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pPos = y * width + x;
      const idx = pPos * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (visited[pPos] === 1) {
        // Connected to outer background
        data[idx + 3] = getBgAlpha(r, g, b);
      } else {
        // Check if immediately adjacent to visited background for edge anti-aliasing
        let hasBgNeighbor = false;
        if (x > 0 && visited[pPos - 1]) hasBgNeighbor = true;
        else if (x < width - 1 && visited[pPos + 1]) hasBgNeighbor = true;
        else if (y > 0 && visited[pPos - width]) hasBgNeighbor = true;
        else if (y < height - 1 && visited[pPos + width]) hasBgNeighbor = true;

        if (hasBgNeighbor && Math.min(r, g, b) > 230) {
          data[idx + 3] = Math.round(((248 - Math.min(r, g, b)) / 25) * 255);
        } else {
          data[idx + 3] = 255;
        }
      }
    }
  }

  // Trim transparent borders and write output
  const trimmed = await sharp(data, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 5 })
    .png()
    .toBuffer();

  fs.writeFileSync(outputPath, trimmed);
  console.log(`Saved transparent image to: ${outputPath}`);
}

async function run() {
  const rootDir = process.cwd();
  const images = [
    {
      in: path.join(rootDir, 'src/assets/images/maxi_isolated_hero_1788026048853.jpg'),
      out: path.join(rootDir, 'src/assets/characters/maxi.png'),
      pub: path.join(rootDir, 'public/characters/maxi.png')
    },
    {
      in: path.join(rootDir, 'src/assets/images/maya_isolated_hero_1788026082534.jpg'),
      out: path.join(rootDir, 'src/assets/characters/maya.png'),
      pub: path.join(rootDir, 'public/characters/maya.png')
    },
    {
      in: path.join(rootDir, 'src/assets/images/bear_isolated_hero_1788026103250.jpg'),
      out: path.join(rootDir, 'src/assets/characters/lumi.png'),
      pub: path.join(rootDir, 'public/characters/lumi.png')
    }
  ];

  for (const item of images) {
    if (fs.existsSync(item.in)) {
      await processImageToTransparent(item.in, item.out);
      if (item.pub) {
        fs.copyFileSync(item.out, item.pub);
      }
    } else {
      console.warn(`Input not found: ${item.in}`);
    }
  }
}

run().catch(console.error);
