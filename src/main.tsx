import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';

// StrictMode is off because metal-fx does not survive its dev-only double
// mount. The library shares one WebGL context across every instance and tears
// it down when the last one unmounts (`x.instances.size === 0 && xr()`, which
// calls `loseContext()` and nulls the engine). StrictMode unmounts both metal
// buttons at once, so the count hits zero, the context dies, and the remount
// never gets it back: the ring canvas stays mounted, visible and permanently
// blank. Production never double-mounts, so this only ever bit us in dev.
createRoot(document.getElementById('root')!).render(<App />);
