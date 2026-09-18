import { useCallback, useEffect, useRef, useState } from 'react';
import { projects as snapshotProjects } from 'virtual:projects-snapshot';
import { fetchProjects } from '../lib/api';
import type { Project } from '../lib/types';
import { Lightbox } from './Lightbox';
import { WorkCard } from './WorkCard';
import styles from './WorkGrid.module.css';

type Status = 'idle' | 'loading' | 'error' | 'success';

interface WorkGridProps {
  onLoaded?: () => void;
}

/** Enough to fill the first two rows on a wide screen, so the grid never looks empty. */
const SKELETON_COUNT = 8;

export function WorkGrid({ onLoaded }: WorkGridProps) {
  const hasSnapshot = snapshotProjects.length > 0;
  const [status, setStatus] = useState<Status>(hasSnapshot ? 'success' : 'loading');
  const [projects, setProjects] = useState<Project[]>(snapshotProjects);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const cardRefs = useRef(new Map<number, HTMLElement>());

  const registerCard = useCallback((index: number, el: HTMLElement | null) => {
    if (el) cardRefs.current.set(index, el);
    else cardRefs.current.delete(index);
  }, []);

  const getOriginCard = useCallback(
    (index: number) => cardRefs.current.get(index) ?? null,
    [],
  );

  // The page entrance used to wait for this fetch, so a cache miss at the edge
  // (1-3s against the CMS) froze the whole layout in its pre-entrance pose. It
  // now runs as soon as there is something to paint -- real cards from the
  // snapshot, or skeletons -- and never depends on the network.
  useEffect(() => {
    onLoaded?.();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProjects(controller.signal)
      .then((data) => {
        setProjects(data.projects ?? []);
        setStatus('success');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        // The baked snapshot is a perfectly good fallback, so a failed refresh is
        // only worth surfacing when there is nothing on screen to keep.
        if (!hasSnapshot) setStatus('error');
      });
    return () => controller.abort();
  }, []);

  return (
    <section className={styles.section}>
      <p
        className={`${styles.annotation} ${status === 'error' ? styles.annotationHidden : ''}`}
      >
        this is what I&rsquo;ve been doing
      </p>

      <div className={styles.grid}>
        {status === 'loading' &&
          Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <div
              key={`skeleton-${i}`}
              className={styles.cardSkeleton}
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}

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
              registerRef={registerCard}
              hiddenByLightbox={activeIndex === i}
            />
          ))}
      </div>

      <Lightbox
        projects={projects}
        index={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onIndexChange={setSelectedIndex}
        getOriginCard={getOriginCard}
        onActiveIndexChange={setActiveIndex}
      />
    </section>
  );
}
