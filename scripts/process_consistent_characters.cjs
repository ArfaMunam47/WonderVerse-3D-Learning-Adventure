const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cleanCutout(inputPath, outputPath, targetW = 896, targetH = 1200) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const mask = new Uint8Array(width * height);

  function isPureBg(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const dr = 255 - r;
    const dg = 255 - g;
    const db = 255 - b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return dist < 65 && maxDiff < 25;
  }

  const queue = [];
  for (let x = 0; x < width; x++) {
    queue.push(x, 0); mask[0 * width + x] = 1;
    queue.push(x, height - 1); mask[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y); mask[y * width + 0] = 1;
    queue.push(width - 1, y); mask[y * width + (width - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (mask[nPos] === 0 && isPureBg(nx, ny)) {
          mask[nPos] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pPos = y * width + x;
      const idx = pPos * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (mask[pPos] === 1) {
        data[idx + 3] = 0;
      } else {
        let hasBgNeighbor = false;
        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (mask[ny * width + nx] === 1) {
              hasBgNeighbor = true;
              break;
            }
          }
        }

        if (hasBgNeighbor) {
          const dr = 255 - r;
          const dg = 255 - g;
          const db = 255 - b;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          if (dist < 40) {
            data[idx + 3] = Math.max(0, Math.min(255, Math.round(dist * 6.0)));
          } else {
            data[idx + 3] = 255;
          }
        } else {
          data[idx + 3] = 255;
        }
      }
    }
  }

  const rawBuffer = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
  
  // Trim and scale to fit target dimensions
  const trimmed = await sharp(rawBuffer).trim().toBuffer({ resolveWithObject: true });
  const resized = await sharp(trimmed.data)
    .resize({
      width: 780,
      height: 980,
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer({ resolveWithObject: true });

  const left = Math.round((targetW - resized.info.width) / 2);
  const top = Math.round(targetH - resized.info.height - 70);

  await sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized.data, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log('Saved:', outputPath);
}

async function run() {
  fs.copyFileSync('src/assets/characters/hero_child_idle.png', 'src/assets/characters/hero_girl_sage.png');
  fs.copyFileSync('src/assets/characters/hero_child_idle.png', 'public/characters/hero_girl_sage.png');
  
  await cleanCutout('src/assets/images/hero_girl_blossom_1788205447473.jpg', 'src/assets/characters/hero_girl_blossom.png');
  await cleanCutout('src/assets/images/hero_girl_sunny_1788205461324.jpg', 'src/assets/characters/hero_girl_sunny.png');
  await cleanCutout('src/assets/images/hero_girl_lavender_1788205475784.jpg', 'src/assets/characters/hero_girl_lavender.png');

  fs.copyFileSync('src/assets/characters/hero_girl_blossom.png', 'public/characters/hero_girl_blossom.png');
  fs.copyFileSync('src/assets/characters/hero_girl_sunny.png', 'public/characters/hero_girl_sunny.png');
  fs.copyFileSync('src/assets/characters/hero_girl_lavender.png', 'public/characters/hero_girl_lavender.png');

  // Replace legacy character files so everything across the app is strictly the same character
  fs.copyFileSync('src/assets/characters/hero_girl_sage.png', 'src/assets/characters/maxi.png');
  fs.copyFileSync('src/assets/characters/hero_girl_blossom.png', 'src/assets/characters/maya.png');
  fs.copyFileSync('src/assets/characters/hero_girl_sunny.png', 'src/assets/characters/bolt.png');
  fs.copyFileSync('src/assets/characters/hero_girl_lavender.png', 'src/assets/characters/jojo.png');

  fs.copyFileSync('src/assets/characters/hero_girl_sage.png', 'public/characters/maxi.png');
  fs.copyFileSync('src/assets/characters/hero_girl_blossom.png', 'public/characters/maya.png');
  fs.copyFileSync('src/assets/characters/hero_girl_sunny.png', 'public/characters/bolt.png');
  fs.copyFileSync('src/assets/characters/hero_girl_lavender.png', 'public/characters/jojo.png');
  console.log('All character variations successfully generated and synchronized!');
}

run();
