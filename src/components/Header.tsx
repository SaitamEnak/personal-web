import { useEffect, useState } from 'react';
import { Button } from './Button';
import styles from './Header.module.css';

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);
}

export function Header() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | undefined;

    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => setNow(new Date()), 60_000);
    }, msToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.timestamp}>
          <span className={styles.time}>{formatTime(now)} (GMT-3)</span>{' '}
          <span className={styles.locale}>Buenos Aires, Argentina</span>
        </span>
        <div className={styles.actions}>
          <Button as="a" href="#contact" variant="primary" size="sm">
            Get in touch
          </Button>
        </div>
      </div>
    </header>
  );
}
