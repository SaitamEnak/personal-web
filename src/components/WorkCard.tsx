import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { useReveal } from '../hooks/useReveal';
import { entranceDelay } from '../lib/entrance';
import type { Project } from '../lib/types';
import styles from './WorkGrid.module.css';

type Props = {
  project: Project;
  index?: number;
  onSelect?: () => void;
  /** Lets the grid keep a handle on the card so the lightbox can zoom from it. */
  registerRef?: (index: number, el: HTMLElement | null) => void;
  /** True while the lightbox is showing this very image. */
  hiddenByLightbox?: boolean;
};

const COLUMN_STAGGER_MS = 50;
const COLUMNS = 4;

export function WorkCard({ project, index = 0, onSelect, registerRef, hiddenByLightbox }: Props) {
  const { ref, revealed } = useReveal<HTMLButtonElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -8% 0px',
  });
  const [imgLoaded, setImgLoaded] = useState(false);

  const setRefs = useCallback(
    (el: HTMLButtonElement | null) => {
      ref.current = el;
      registerRef?.(index, el);
    },
    [ref, registerRef, index],
  );

  // The card reveals on scroll alone. Gating it on imgLoaded too meant a slow
  // thumbnail left a hole in the grid; now the card's own gradient stands in as
  // the placeholder and only the image itself fades in when it arrives.
  const className = `${styles.card} ${revealed ? styles.cardRevealed : ''} ${
    hiddenByLightbox ? styles.cardHidden : ''
  }`;
  // Frozen the moment the card reveals. During the entrance <main> is still
  // sliding up, so cards cross into view out of order and far too early -- the
  // entrance floor holds them until the hero and the annotation have had their
  // turn. Once the entrance is over it is just the column stagger.
  const delayRef = useRef<number | null>(null);
  if (revealed && delayRef.current === null) {
    delayRef.current = entranceDelay() + (index % COLUMNS) * COLUMN_STAGGER_MS;
  }
  const style: CSSProperties = {
    transitionDelay: `${delayRef.current ?? 0}ms`,
  };

  return (
    <button
      ref={setRefs}
      type="button"
      className={className}
      style={style}
      onClick={onSelect}
      aria-label={`Open ${project.title}`}
    >
      <img
        src={project.thumbnailUrl}
        alt={project.title}
        className={`${styles.cardImage} ${imgLoaded ? styles.cardImageLoaded : ''}`}
        // The first row is above the fold on every breakpoint, so lazy-loading it
        // only delays the first thing the visitor actually sees.
        loading={index < COLUMNS ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setImgLoaded(true)}
      />
    </button>
  );
}
