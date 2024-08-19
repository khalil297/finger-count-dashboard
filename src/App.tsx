import React, { useState } from 'react';
import HandTracker from './HandTracker';
import FingerChart from './FingerChart';

const App: React.FC = () => {
  const [fingerCounts, setFingerCounts] = useState<number[]>([]);

  const handleFingerCountChange = (count: number) => {
    setFingerCounts(prevCounts => [
      ...prevCounts.slice(-9), // Keep only the last 10 data points
      count
    ]);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Hand Number Detection</h1>
      <HandTracker onFingerCountChange={handleFingerCountChange} />
      <FingerChart data={fingerCounts} />
    </div>
  );
};

export default App;
