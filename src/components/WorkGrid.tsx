import { useEffect, useState } from 'react';
import { fetchProjects } from '../lib/api';
import type { Project } from '../lib/types';
import { WorkCard } from './WorkCard';
import styles from './WorkGrid.module.css';

const SKELETON_COUNT = 20;

type Status = 'idle' | 'loading' | 'error' | 'success';

export function WorkGrid() {
  const [status, setStatus] = useState<Status>('loading');
  const [projects, setProjects] = useState<Project[]>([]);

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
      <p className={styles.annotation}>this is what I&rsquo;ve been doing</p>

      <div className={styles.grid}>
        {status === 'loading' &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={`${styles.card} ${styles.cardSkeleton}`} aria-hidden />
          ))}

        {status === 'error' && (
          <p className={styles.error}>Couldn&rsquo;t load projects right now.</p>
        )}

        {status === 'success' && projects.length === 0 && (
          <p className={styles.empty}>No projects yet — check back soon.</p>
        )}

        {status === 'success' &&
          projects.map((project) => <WorkCard key={project.id} project={project} />)}
      </div>
    </section>
  );
}
