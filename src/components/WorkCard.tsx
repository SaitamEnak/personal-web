import type { Project } from '../lib/types';
import styles from './WorkGrid.module.css';

type Props = { project: Project };

export function WorkCard({ project }: Props) {
  const card = (
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
        className={styles.card}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={project.title}
      >
        {card}
      </a>
    );
  }

  return (
    <div className={styles.card} aria-label={project.title}>
      {card}
    </div>
  );
}
