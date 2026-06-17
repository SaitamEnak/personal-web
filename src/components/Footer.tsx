import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        you reached the end!
        <span className={styles.script}>beginning!</span>
      </div>
    </footer>
  );
}
