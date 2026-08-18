/**
 * cursor.js
 * ---------------------------------------------------------------------------
 * Replaces the default arrow with a small spinning sparkle that trails the
 * real pointer with a gentle spring-like lag. Desktop/mouse only - detected
 * via `(pointer: fine)` so touch devices never pay for an idle listener.
 * Each frame we lerp the sparkle's position a fraction of the way toward the
 * real mouse position, which is what creates the smooth trailing feel
 * instead of an instant snap.
 * ---------------------------------------------------------------------------
 */

(function () {
  const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (!isFinePointer) return;

  const cursorEl = document.getElementById("magic-cursor");
  if (!cursorEl) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;
  let visible = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      cursorEl.classList.add("visible");
      document.body.classList.add("custom-cursor-active");
    }
  });

  document.addEventListener("mouseleave", () => {
    visible = false;
    cursorEl.classList.remove("visible");
  });

  document.addEventListener("mousedown", () => cursorEl.classList.add("clicking"));
  document.addEventListener("mouseup", () => cursorEl.classList.remove("clicking"));

  function tick() {
    curX += (mouseX - curX) * 0.18;
    curY += (mouseY - curY) * 0.18;
    cursorEl.style.transform = `translate(${curX}px, ${curY}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
