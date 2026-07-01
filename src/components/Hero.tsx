import profilePic from '../assets/profilepic.png';
import { Button } from './Button';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div
        role="img"
        aria-label="Matías Canepa"
        className={styles.avatar}
        style={{ backgroundImage: `url(${profilePic})` }}
      />
      <div className={styles.identity}>
        <h2 className={styles.name}>Matías Cánepa</h2>
        <span className={styles.role}>Product Designer</span>
      </div>
      <h1 className={styles.tagline}>
        I built my first website in Adobe Flash <br/> over 15 years ago and I haven&rsquo;t <br/>
        stopped creating since.
      </h1>
      <div className={styles.ctas}>
        <Button as="a" href="https://www.linkedin.com/in/mcanepadcv/?locale=es" target="_blank" rel="noopener noreferrer" variant="primary">
          Get in touch
        </Button>
      </div>
    </section>
  );
}
