import { useReveal } from '../hooks/useReveal';
import styles from './Footer.module.css';

export function Footer() {
  const { ref, revealed } = useReveal<HTMLDivElement>({ threshold: 0.4 });

  return (
    <footer className={styles.footer}>
      <div
        ref={ref}
        className={`${styles.inner} ${revealed ? styles.innerRevealed : ''}`}
      >
        you reached the end!
        <span className={styles.script}>beginning!</span>
      </div>
    </footer>
  );
}
