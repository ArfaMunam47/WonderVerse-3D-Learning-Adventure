/**
 * shader-bg.js  (PREMIUM FEATURE — shader lines)
 * ---------------------------------------------------------------------------
 * WHY
 * A flat CSS gradient background reads as "webpage." A handful of slow,
 * softly glowing lines flowing behind the menu cards reads as "premium
 * product." This renders a tiny real GLSL fragment shader onto a fullscreen
 * canvas — not a CSS trick — so the lines have genuine smooth motion and
 * additive color blending that CSS gradients can't cheaply reproduce.
 *
 * HOW IT WORKS
 * - A single fullscreen triangle is drawn (the standard cheap alternative to
 *   two triangles / a quad) and every pixel's color comes from the fragment
 *   shader below.
 * - The shader sums several sine waves of varying frequency/speed/offset to
 *   produce a handful of flowing ribbon-like lines, colored by cycling
 *   through the game's own palette (sky blue -> green -> sunshine -> coral)
 *   so it never clashes with the UI on top of it.
 * - Runs at a capped, low resolution internally (see `RENDER_SCALE`) then is
 *   upscaled by the GPU — this keeps it cheap even on older tablets, since
 *   fragment shader cost scales with pixel count.
 * - Respects `prefers-reduced-motion` and the game's own "reduce motion"
 *   accessibility setting (checked via the same `body.reduced-motion` class
 *   everything else in the game uses) by simply not starting the render loop.
 * ---------------------------------------------------------------------------
 */

(function () {
  const canvas = document.getElementById("shader-bg");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) { canvas.style.display = "none"; return; }

  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) { canvas.style.display = "none"; return; } // graceful fallback: plain CSS background shows instead

  const RENDER_SCALE = 0.5; // internal render resolution multiplier (perf-friendly)

  const VERT_SRC = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const FRAG_SRC = `
    precision mediump float;
    uniform vec2 uResolution;
    uniform float uTime;

    // A handful of the game's palette colors, for tinting the flowing lines
    vec3 palette(float t) {
      vec3 c1 = vec3(0.302, 0.588, 1.0);   // sky blue
      vec3 c2 = vec3(0.420, 0.796, 0.467); // meadow green
      vec3 c3 = vec3(1.0, 0.851, 0.239);   // sunshine
      vec3 c4 = vec3(1.0, 0.561, 0.780);   // coral
      float seg = mod(t, 4.0);
      if (seg < 1.0) return mix(c1, c2, seg);
      if (seg < 2.0) return mix(c2, c3, seg - 1.0);
      if (seg < 3.0) return mix(c3, c4, seg - 2.0);
      return mix(c4, c1, seg - 3.0);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      float aspect = uResolution.x / uResolution.y;
      uv.x *= aspect;

      vec3 color = vec3(0.0);
      float glow = 0.0;

      // Layer several slow flowing sine ribbons at different heights/speeds
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 0.05 + fi * 0.015;
        float freq = 1.4 + fi * 0.6;
        float amp = 0.06 + fi * 0.015;
        float yBase = 0.15 + fi * 0.18;
        float y = yBase + sin(uv.x * freq + uTime * speed + fi * 2.0) * amp;
        float d = abs(uv.y - y);
        float line = smoothstep(0.006, 0.0, d); // thin crisp core
        float soft = smoothstep(0.05, 0.0, d) * 0.35; // soft glow halo
        float lineGlow = line + soft;
        color += palette(fi * 0.8 + uTime * 0.03) * lineGlow;
        glow += lineGlow;
      }

      float alpha = clamp(glow * 0.6, 0.0, 0.85);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) { canvas.style.display = "none"; return; }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("Shader program link error:", gl.getProgramInfoLog(program));
    canvas.style.display = "none";
    return;
  }
  gl.useProgram(program);

  // Fullscreen triangle (covers the viewport with a single triangle, cheaper
  // than a quad since there's no diagonal seam to rasterize).
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "uResolution");
  const uTime = gl.getUniformLocation(program, "uTime");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    const w = Math.floor(window.innerWidth * RENDER_SCALE);
    const h = Math.floor(window.innerHeight * RENDER_SCALE);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = { start: performance.now() };
  function render() {
    // Pause entirely once the in-game "reduce motion" setting is on, so this
    // never fights the accessibility toggle - checked every frame since the
    // setting can change live from the Settings screen.
    if (!document.body.classList.contains("reduced-motion")) {
      const t = (performance.now() - clock.start) / 1000;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    requestAnimationFrame(render);
  }
  render();
})();
