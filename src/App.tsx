import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkGrid } from './components/WorkGrid';
import styles from './App.module.css';

/** Matches the .main transform transition in App.module.css, plus a little slack. */
const ENTRANCE_MS = 750;

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);

  // The entrance transform pushes <main> half a viewport down, which extends the
  // document's scrollable area for as long as it is applied. Clipping has to
  // outlast the transform, not end the moment it starts unwinding -- otherwise
  // the page stays scrollable into empty space for the length of the animation
  // and settles a few hundred pixels down.
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => setEntranceDone(true), ENTRANCE_MS);
    return () => clearTimeout(t);
  }, [loaded]);

  return (
    <div className={`${styles.layout} ${!entranceDone ? styles.layoutLoading : ''}`}>
      <Header />
      <main className={`${styles.main} ${!loaded ? styles.mainLoading : ''}`}>
        <Hero />
        <WorkGrid onLoaded={() => setLoaded(true)} />
      </main>
    </div>
  );
}
