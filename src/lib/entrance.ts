/**
 * Shared clock for the page entrance, so the first screen resolves in reading
 * order: hero, then the annotation, then the grid.
 *
 * The hero and the annotation ride on CSS animation delays (Hero.module.css and
 * WorkGrid.module.css). The cards can't: they reveal through an
 * IntersectionObserver, and while <main> is still sliding up they cross into the
 * viewport at whatever moment the slide happens to carry them there. Measuring
 * against this origin lets a card that reveals early wait out the rest of the
 * entrance instead of landing on screen ahead of the hero.
 */

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** Module eval — a frame or two before the first paint, close enough. */
const ENTRANCE_START = now();

/** The last hero item starts at 0.5s and the annotation at 0.7s; cards follow. */
const CARDS_START_MS = 950;

/** Extra wait for a card revealing mid-entrance; 0 once the entrance is over. */
export function entranceDelay(): number {
  return Math.max(0, CARDS_START_MS - (now() - ENTRANCE_START));
}
