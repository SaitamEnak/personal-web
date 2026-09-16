import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project } from '../lib/types';
import styles from './Lightbox.module.css';

type Props = {
  projects: Project[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  /** The grid card that owns `index` — used as the origin of the zoom. */
  getOriginCard?: (index: number) => HTMLElement | null;
  /**
   * The card the dialog is currently standing in for, or null once it has
   * fully returned to the grid. The grid hides that card so the same image is
   * never on screen twice.
   */
  onActiveIndexChange?: (index: number | null) => void;
};

const OPEN_MS = 320;
const CLOSE_MS = 240;
/** The scrim fades a touch quicker so it lands before the movement does. */
const SCRIM_MS = 160;
const SWAP_MS = 180;
const EASE_OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
/** Mirrors --radius-md / --radius-lg: WAAPI keyframes can't resolve var(). */
const CARD_RADIUS = 10;
const DIALOG_RADIUS = 16;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * FLIP pair for a container transform: the dialog starts sitting exactly on the
 * card, then grows into place. The card crops its image with `object-fit: cover`
 * while the dialog shows the whole thing, so the non-uniform scale on the dialog
 * is cancelled out on the image — on screen the image stays uniformly scaled and
 * the dialog reads as the card's frame opening up instead of a stretch.
 */
function zoomFrom(from: DOMRect, to: DOMRect) {
  const sx = from.width / to.width;
  const sy = from.height / to.height;
  const cover = Math.max(sx, sy);
  return {
    dialog: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`,
    image: `scale(${cover / sx}, ${cover / sy})`,
    // Compensate the scale so the corners read at the card's radius on screen.
    radius: `${(CARD_RADIUS / ((sx + sy) / 2)).toFixed(1)}px`,
  };
}

export function Lightbox({
  projects,
  index,
  onClose,
  onIndexChange,
  getOriginCard,
  onActiveIndexChange,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<(HTMLButtonElement | null)[]>([]);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const openedRef = useRef(false);
  const prevOpenRef = useRef<number | null>(null);
  const swapHeightRef = useRef<number | null>(null);

  /** What is on screen. Lags `index` on close so the exit can play out. */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  const isOpen = openIndex !== null && projects[openIndex] != null;
  const total = projects.length;

  const step = useCallback(
    (delta: number) => {
      if (index === null || total === 0) return;
      swapHeightRef.current = dialogRef.current?.getBoundingClientRect().height ?? null;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange],
  );

  const goPrev = useCallback(() => step(-1), [step]);
  const goNext = useCallback(() => step(1), [step]);

  const runZoom = useCallback(
    (mode: 'in' | 'out', originIndex: number, done?: () => void) => {
      const dialogEl = dialogRef.current;
      const imageEl = imageRef.current;
      if (!dialogEl || !imageEl) {
        done?.();
        return;
      }

      const originEl = getOriginCard?.(originIndex) ?? null;
      const originImg = originEl?.querySelector('img');

      // An <img> that hasn't decoded yet measures 0 tall and would wreck the
      // maths; borrow the ratio from the card's already-loaded copy.
      if ((!imageEl.complete || imageEl.naturalHeight === 0) && originImg?.naturalHeight) {
        imageEl.style.aspectRatio = `${originImg.naturalWidth} / ${originImg.naturalHeight}`;
      }

      const from = originEl?.getBoundingClientRect() ?? null;
      const to = dialogEl.getBoundingClientRect();
      const onScreen =
        from !== null &&
        from.width > 0 &&
        from.height > 0 &&
        from.bottom > 0 &&
        from.top < window.innerHeight;
      const zoom = onScreen && to.width > 0 && to.height > 0 ? zoomFrom(from, to) : null;

      const reduced = prefersReducedMotion();
      const duration = mode === 'in' ? OPEN_MS : CLOSE_MS;

      // Both directions run forwards over their own reversed keyframes, so the
      // ease-out decelerates into the destination either way — playing the open
      // in reverse would instead decelerate on departure.
      const order = <T,>(frames: T[]) => (mode === 'in' ? frames : [...frames].reverse());
      const opts: KeyframeAnimationOptions = {
        duration: reduced ? 0 : duration,
        easing: EASE_OUT,
        fill: mode === 'in' ? 'backwards' : 'forwards',
      };
      const scrimOpts: KeyframeAnimationOptions = {
        duration: reduced ? 0 : Math.min(SCRIM_MS, duration),
        easing: 'linear',
        fill: opts.fill,
      };

      const anims = [
        dialogEl.animate(
          order(
            zoom
              ? [
                  { transform: zoom.dialog, borderRadius: zoom.radius },
                  { transform: 'none', borderRadius: `${DIALOG_RADIUS}px` },
                ]
              : [{ transform: 'scale(0.96)' }, { transform: 'none' }],
          ),
          opts,
        ),
      ];

      if (zoom) {
        anims.push(
          imageEl.animate(order([{ transform: zoom.image }, { transform: 'none' }]), opts),
        );
      }

      for (const el of [backdropRef.current, ...navRef.current]) {
        if (el) anims.push(el.animate(order([{ opacity: 0 }, { opacity: 1 }]), scrimOpts));
      }

      Promise.all(anims.map((a) => a.finished))
        .catch(() => undefined)
        .then(() => done?.());
    },
    [getOriginCard],
  );

  // Keep the scroll lock above the zoom effects: the rects they measure must
  // already be free of the scrollbar shift the lock would otherwise cause.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (index !== null) setOpenIndex(index);
  }, [index]);

  // Before paint, so the card is already gone under the dialog on the way out
  // and back in place the frame the dialog lands on it on the way in.
  useLayoutEffect(() => {
    onActiveIndexChange?.(isOpen ? openIndex : null);
  }, [isOpen, openIndex, onActiveIndexChange]);

  useLayoutEffect(() => {
    if (!isOpen || openIndex === null || openedRef.current) return;
    openedRef.current = true;
    runZoom('in', openIndex);
  }, [isOpen, openIndex, runZoom]);

  useLayoutEffect(() => {
    if (index !== null || openIndex === null || closing) return;
    setClosing(true);
    runZoom('out', openIndex, () => {
      openedRef.current = false;
      setOpenIndex(null);
      setClosing(false);
    });
  }, [index, openIndex, closing, runZoom]);

  // Stepping between projects: ease the height change instead of snapping to
  // the next aspect ratio. The image itself never fades — it stays fully opaque.
  useLayoutEffect(() => {
    const prev = prevOpenRef.current;
    prevOpenRef.current = openIndex;
    const from = swapHeightRef.current;
    swapHeightRef.current = null;

    if (prev === null || openIndex === null || prev === openIndex) return;
    const dialogEl = dialogRef.current;
    const imageEl = imageRef.current;
    if (!dialogEl || !imageEl || prefersReducedMotion()) return;

    // Only worth morphing when the incoming image already knows its size.
    const to = dialogEl.getBoundingClientRect().height;
    if (imageEl.complete && from && to && Math.abs(from - to) > 1) {
      dialogEl.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: SWAP_MS,
        easing: EASE_OUT,
      });
    }
  }, [openIndex]);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      lastFocusedRef.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || openIndex === null) return null;
  const project = projects[openIndex];

  return createPortal(
    <div className={`${styles.layer} ${closing ? styles.closing : ''}`}>
      <div ref={backdropRef} className={styles.backdrop} />

      <div
        className={styles.scroller}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} — ${openIndex + 1} of ${total}`}
      >
        <div
          ref={dialogRef}
          className={styles.dialog}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={project.id}
            ref={imageRef}
            src={project.thumbnailUrl}
            alt={project.title}
            className={styles.image}
          />
        </div>
      </div>

      <button
        type="button"
        ref={(el) => {
          navRef.current[0] = el;
        }}
        className={`${styles.iconBtn} ${styles.nav}`}
        data-side="left"
        onClick={goPrev}
        aria-label="Previous project"
      >
        <ChevronLeft size={22} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        ref={(el) => {
          navRef.current[1] = el;
        }}
        className={`${styles.iconBtn} ${styles.nav}`}
        data-side="right"
        onClick={goNext}
        aria-label="Next project"
      >
        <ChevronRight size={22} strokeWidth={1.8} />
      </button>
    </div>,
    document.body,
  );
}
