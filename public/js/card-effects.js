/**
 * card-effects.js  (PREMIUM FEATURES — card shuffle + card spread)
 * ---------------------------------------------------------------------------
 * WHY
 * Menus that just "appear" feel like a plain webpage. Real card/tile grids
 * (the Learning Games hub, the World Map) feel far more premium if the tiles
 * arrive with a little choreography instead of popping in all at once.
 *
 * Two distinct entrance styles are offered, used in different places so they
 * each stay recognizable rather than blurring into one generic animation:
 *
 *   shuffleIn(container) — tiles start stacked at the center, slightly
 *     rotated in alternating directions (like a riffled card deck), and
 *     settle into their grid position with a short stagger. Used for the
 *     Learning Games hub, since "shuffling" reads naturally as "here's a set
 *     of games to pick from."
 *
 *   spreadOut(container) — tiles start stacked dead-center with NO rotation,
 *     scaled down, and fan straight outward to their grid position. Used for
 *     the World Map, since a clean radial "spread" reads as "here is a map
 *     unfolding" rather than a deck of cards.
 *
 * HOW IT WORKS
 * Both functions:
 *  1. Measure each child's final position (via `offsetLeft/offsetTop`
 *     relative to the container, computed from the grid layout that's
 *     already in the DOM/CSS).
 *  2. Compute a "from" vector pointing from the center of the container to
 *     each card's final position, negated - i.e. "where would this card have
 *     to start in order to travel outward into its slot".
 *  3. Set that vector (and, for shuffle, a small random rotation) as inline
 *     CSS custom properties on the card, add the animation class, and let
 *     the `@keyframes` in style.css (`shuffleIn` / `spreadOut`) do the actual
 *     motion - so the JS only computes numbers, the CSS does the animating,
 *     which keeps this fast and lets `body.reduced-motion` disable it in one
 *     place (style.css already turns off `.shuffle-card`/`.spread-card`
 *     animation under that class).
 *  4. Stagger each card's `animation-delay` by index so they don't all move
 *     in perfect unison - that stagger is what sells the "deck" feeling.
 * ---------------------------------------------------------------------------
 */

const CardEffects = {
  /**
   * Re-triggers an entrance animation on all direct children of `container`.
   * Safe to call every time a screen is opened (removes+reflows+re-adds the
   * animation classes so it replays, since browsers won't restart a CSS
   * animation on an element that still has the same class applied).
   */
  _animate(container, { rotate = false, delayStep = 0.05, distance = 1 } = {}) {
    if (!container) return;
    const cards = Array.from(container.children);
    if (cards.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;

    cards.forEach((card, i) => {
      // Force any previous animation to fully reset before replaying
      card.classList.remove("shuffle-card", "spread-card");
      void card.offsetWidth; // reflow, required to restart a CSS animation

      const cardCenterX = card.offsetLeft + card.offsetWidth / 2;
      const cardCenterY = card.offsetTop + card.offsetHeight / 2;
      // Vector from container center to this card's final slot, scaled down
      // and inverted so cards visibly travel INTO place from the center.
      const fromX = (centerX - cardCenterX) * distance;
      const fromY = (centerY - cardCenterY) * distance;

      card.style.setProperty(rotate ? "--shuffle-fromx" : "--spread-fromx", `${fromX}px`);
      card.style.setProperty(rotate ? "--shuffle-fromy" : "--spread-fromy", `${fromY}px`);
      if (rotate) {
        const rot = (i % 2 === 0 ? -1 : 1) * (8 + Math.random() * 10);
        card.style.setProperty("--shuffle-rot", `${rot}deg`);
      }
      card.style.setProperty(rotate ? "--shuffle-delay" : "--spread-delay", `${i * delayStep}s`);
      card.classList.add(rotate ? "shuffle-card" : "spread-card");
    });
  },

  shuffleIn(container) {
    this._animate(container, { rotate: true, delayStep: 0.06, distance: 0.9 });
  },

  spreadOut(container) {
    this._animate(container, { rotate: false, delayStep: 0.05, distance: 1.1 });
  }
};
