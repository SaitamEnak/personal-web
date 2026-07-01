import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkGrid } from './components/WorkGrid';
import { Footer } from './components/Footer';
import styles from './App.module.css';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`${styles.layout} ${!loaded ? styles.layoutLoading : ''}`}>
      <Header />
      <main className={`${styles.main} ${!loaded ? styles.mainLoading : ''}`}>
        <Hero />
        <WorkGrid onLoaded={() => setLoaded(true)} />
      </main>
      <Footer />
    </div>
  );
}
