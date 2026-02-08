import React from 'react';
import ChecksumVisualizer from './ChecksumVisualizer';
import BellmanFordVisualizer from './BellmanFordVisualizer';

function App() {
  return (
    <div className="App">
      {/* You can add a Navbar here later */}
      {/* <ChecksumVisualizer /> */}
      <BellmanFordVisualizer /> 
    </div>
  );
}

export default App;