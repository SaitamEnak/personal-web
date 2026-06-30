import { useEffect, useState } from 'react';
import { fetchProjects } from '../lib/api';
import { useReveal } from '../hooks/useReveal';
import type { Project } from '../lib/types';
import { Lightbox } from './Lightbox';
import { WorkCard } from './WorkCard';
import styles from './WorkGrid.module.css';

type Status = 'idle' | 'loading' | 'error' | 'success';

export function WorkGrid() {
  const [status, setStatus] = useState<Status>('loading');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { ref: annotationRef, revealed: annotationRevealed } =
    useReveal<HTMLParagraphElement>();

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetchProjects(controller.signal)
      .then((data) => {
        setProjects(data.projects ?? []);
        setStatus('success');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setStatus('error');
      });
    return () => controller.abort();
  }, []);

  return (
    <section className={styles.section}>
      <p
        ref={annotationRef}
        className={`${styles.annotation} ${annotationRevealed ? styles.annotationRevealed : ''}`}
      >
        this is what I&rsquo;ve been doing
      </p>

      <div className={styles.grid}>

        {status === 'error' && (
          <p className={styles.error}>Couldn&rsquo;t load projects right now.</p>
        )}

        {status === 'success' && projects.length === 0 && (
          <p className={styles.empty}>No projects yet — check back soon.</p>
        )}

        {status === 'success' &&
          projects.map((project, i) => (
            <WorkCard
              key={project.id}
              project={project}
              index={i}
              onSelect={() => setSelectedIndex(i)}
            />
          ))}
      </div>

      <Lightbox
        projects={projects}
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onIndexChange={setSelectedIndex}
      />
    </section>
  );
}
