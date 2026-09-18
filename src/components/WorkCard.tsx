import { useCallback, useState, type CSSProperties } from 'react';
import { useReveal } from '../hooks/useReveal';
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
  const style: CSSProperties = {
    transitionDelay: `${(index % COLUMNS) * COLUMN_STAGGER_MS}ms`,
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
