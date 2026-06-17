import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkGrid } from './components/WorkGrid';
import { Footer } from './components/Footer';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Hero />
        <WorkGrid />
      </main>
      <Footer />
    </div>
  );
}
