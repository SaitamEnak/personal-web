import type { CSSProperties } from 'react';
import type { Project } from '../lib/types';
import styles from './WorkGrid.module.css';

type Props = {
  project: Project;
  index?: number;
};

const STAGGER_MS = 50;

export function WorkCard({ project, index = 0 }: Props) {
  const className = `${styles.card} ${styles.cardAnimated}`;
  const style: CSSProperties = { animationDelay: `${index * STAGGER_MS}ms` };

  const img = (
    <img
      src={project.thumbnailUrl}
      alt={project.title}
      className={styles.cardImage}
      loading="lazy"
    />
  );

  if (project.url) {
    return (
      <a
        href={project.url}
        className={className}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={project.title}
      >
        {img}
      </a>
    );
  }

  return (
    <div className={className} style={style} aria-label={project.title}>
      {img}
    </div>
  );
}
