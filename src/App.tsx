import { useState } from 'react';
import type { OpeningLine } from './types/opening';
import OpeningSelect from './pages/OpeningSelect/OpeningSelect';
import Train from './pages/Train/Train';
import styles from './App.module.css';

const App = () => {
  const [opening, setOpening] = useState<OpeningLine | null>(null);

  return (
    <div className={styles.app}>
      {opening === null ? (
        <OpeningSelect onSelect={setOpening} />
      ) : (
        <Train opening={opening} onBack={() => setOpening(null)} />
      )}
    </div>
  );
};

export default App;
