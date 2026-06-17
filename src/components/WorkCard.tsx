import { useState, type CSSProperties } from 'react';
import { useReveal } from '../hooks/useReveal';
import type { Project } from '../lib/types';
import styles from './WorkGrid.module.css';

type Props = {
  project: Project;
  index?: number;
  onSelect?: () => void;
};

const COLUMN_STAGGER_MS = 50;
const COLUMNS = 4;

export function WorkCard({ project, index = 0, onSelect }: Props) {
  const { ref, revealed } = useReveal<HTMLButtonElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -8% 0px',
  });
  const [imgLoaded, setImgLoaded] = useState(false);

  const className = `${styles.card} ${revealed ? styles.cardRevealed : ''}`;
  const style: CSSProperties = {
    transitionDelay: `${(index % COLUMNS) * COLUMN_STAGGER_MS}ms`,
  };
  const imgClassName = `${styles.cardImage} ${imgLoaded ? styles.cardImageLoaded : ''}`;

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      style={style}
      onClick={onSelect}
      aria-label={`Open ${project.title}`}
    >
      <img
        src={project.thumbnailUrl}
        alt={project.title}
        className={imgClassName}
        loading="lazy"
        decoding="async"
        onLoad={() => setImgLoaded(true)}
      />
    </button>
  );
}
