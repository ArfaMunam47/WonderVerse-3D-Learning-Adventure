/**
 * spotlight.js  (PREMIUM FEATURE — circle hover)
 * ---------------------------------------------------------------------------
 * WHY
 * A flat hover color-change feels static. A soft circular glow that follows
 * the exact cursor position inside a button/card feels tactile and premium -
 * the classic "spotlight card" effect used across modern product sites.
 *
 * HOW IT WORKS
 * - Every element with the `.spotlight` class gets a `::before` layer in CSS
 *   (see style.css) that renders `radial-gradient(circle 90px at var(--mx)
 *   var(--my), ...)`. That gradient's center position is driven by two CSS
 *   custom properties, `--mx` / `--my`, which this script updates on
 *   `pointermove` to the cursor's position *relative to that element*.
 * - Because the work is just setting two CSS variables (not repositioning
 *   DOM nodes or recalculating layout), this is cheap enough to run on every
 *   pointermove frame without hurting scroll/render performance.
 * - Uses event delegation on `document` with a single `pointermove` listener
 *   rather than attaching a listener per card, so it stays cheap even as new
 *   screens/cards are added later.
 * - Desktop-only in effect (touch devices have no persistent hover position,
 *   so the base CSS already gates the glow behind `@media (pointer: fine)`) -
 *   this script runs everywhere but is a no-op in visual terms on touch.
 * ---------------------------------------------------------------------------
 */

(function () {
  document.addEventListener("pointermove", (e) => {
    const target = e.target.closest(".spotlight");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mx", `${x}px`);
    target.style.setProperty("--my", `${y}px`);
  });
})();
