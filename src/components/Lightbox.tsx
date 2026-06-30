import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project } from '../lib/types';
import styles from './Lightbox.module.css';

type Props = {
  projects: Project[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
};

export function Lightbox({ projects, index, onClose, onIndexChange }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const isOpen = index !== null && projects[index] != null;
  const total = projects.length;

  const goPrev = useCallback(() => {
    if (index === null || total === 0) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (index === null || total === 0) return;
    onIndexChange((index + 1) % total);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = prevOverflow;
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || index === null) return null;
  const project = projects[index];

  return createPortal(
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} — ${index + 1} of ${total}`}
      >
        <div
          ref={dialogRef}
          className={styles.dialog}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={project.id}
            src={project.thumbnailUrl}
            alt={project.title}
            className={styles.image}
          />
        </div>
      </div>

      <button
        type="button"
        className={`${styles.iconBtn} ${styles.nav}`}
        data-side="left"
        onClick={goPrev}
        aria-label="Previous project"
      >
        <ChevronLeft size={22} strokeWidth={1.8} />
      </button>

      <button
        type="button"
        className={`${styles.iconBtn} ${styles.nav}`}
        data-side="right"
        onClick={goNext}
        aria-label="Next project"
      >
        <ChevronRight size={22} strokeWidth={1.8} />
      </button>
    </>,
    document.body,
  );
}
