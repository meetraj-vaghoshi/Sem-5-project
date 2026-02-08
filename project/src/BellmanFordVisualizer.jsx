import React, { useState } from 'react';

const BellmanFordVisualizer = () => {
  const [edges, setEdges] = useState([{ from: 'A', to: 'B', weight: 5 }]);
  const [sourceNode, setSourceNode] = useState('A');
  const [results, setResults] = useState(null);

  const addEdge = () => {
    setEdges([...edges, { from: '', to: '', weight: 0 }]);
  };

  const updateEdge = (index, field, value) => {
    const newEdges = [...edges];
    newEdges[index][field] = field === 'weight' ? (value === "" ? "" : parseInt(value)) : value.toUpperCase();
    setEdges(newEdges);
  };

  const removeEdge = (index) => {
    setEdges(edges.filter((_, i) => i !== index));
  };

  const calculate = async () => {
    const filteredEdges = edges.filter(e => e.from.trim() !== '' && e.to.trim() !== '');
    
    try {
      const response = await fetch('http://localhost:5001/api/bellman-ford', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edges: filteredEdges, source: sourceNode.toUpperCase() })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      alert("Backend not running! Start daa_server.js first.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Bellman-Ford / Distance Vector Implementation
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Simulate routing updates using the Bellman-Ford equation: D<sub>xy</sub> = min&#123;D<sub>xy</sub>, (c<sub>xz</sub> + D<sub>zy</sub>)&#125;</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CONFIGURATION PANEL */}
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="bg-blue-500 w-2 h-6 rounded-full"></span>
                Network Topology
              </h2>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-400">Source Node:</label>
                <input 
                  className="bg-slate-900 border border-slate-600 rounded px-3 py-1 w-16 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  value={sourceNode}
                  onChange={(e) => setSourceNode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {edges.map((edge, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700">
                  <input 
                    placeholder="From"
                    className="bg-slate-900 border border-slate-700 p-2 w-full rounded-lg text-center font-mono"
                    value={edge.from}
                    onChange={(e) => updateEdge(index, 'from', e.target.value)}
                  />
                  <span className="text-slate-500">↔</span>
                  <input 
                    placeholder="To"
                    className="bg-slate-900 border border-slate-700 p-2 w-full rounded-lg text-center font-mono"
                    value={edge.to}
                    onChange={(e) => updateEdge(index, 'to', e.target.value)}
                  />
                  <input 
                    type="number"
                    placeholder="Cost"
                    className="bg-slate-900 border border-slate-700 p-2 w-24 rounded-lg text-center font-mono text-yellow-400"
                    value={edge.weight}
                    onChange={(e) => updateEdge(index, 'weight', e.target.value)}
                  />
                  <button onClick={() => removeEdge(index)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg">✕</button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button onClick={addEdge} className="flex-1 border border-dashed border-slate-600 hover:border-blue-500 hover:text-blue-400 py-3 rounded-xl">
                + Add Connection
              </button>
              <button onClick={calculate} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg">
                Update Routing Table
              </button>
            </div>
          </div>

          {/* FINAL RESULTS PANEL */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-400">
              <span className="bg-emerald-500 w-2 h-6 rounded-full"></span>
              Final Costs
            </h2>
            {results ? (
              <div className="space-y-4">
                {results.hasNegativeCycle && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-xs">
                    ⚠️ Negative Cycle Detected! Costs will count to infinity.
                  </div>
                )}
                <div className="space-y-2">
                  {Object.entries(results.distances).map(([node, data]) => (
                    <div key={node} className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                      <span className="text-slate-400 font-bold">Node {node}</span>
                      <span className="font-mono text-emerald-400 text-lg">
                        {data.dist === Infinity ? '∞' : (
                          <span>{data.dist}<sub className="text-xs ml-1 text-emerald-600">{data.parent || ''}</sub></span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10 italic">Awaiting simulation...</div>
            )}
          </div>
        </div>

        {/* DISTANCE VECTOR TABLE */}
        <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600 flex justify-between items-center">
            <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <span className="bg-yellow-500 w-2 h-6 rounded-full"></span>
              Step-by-Step Distance Table
            </h2>
          </div>

          <div className="overflow-x-auto">
            {results ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="p-4 border-b border-slate-700 text-slate-400 font-mono text-xs uppercase">Iter</th>
                    {results.nodes.map(node => (
                      <th key={node} className="p-4 border-b border-slate-700 text-center font-bold text-blue-400 uppercase tracking-widest text-sm">
                        Node {node}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.iterationSnapshots.map((snapshot, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors border-b border-slate-700/50">
                      <td className="p-4 font-mono text-slate-500 bg-slate-900/20 text-center w-20">{idx}</td>
                      {results.nodes.map(node => {
                        const cell = snapshot.dists[node];
                        const prevCell = idx > 0 ? results.iterationSnapshots[idx - 1].dists[node] : null;
                        const isUpdated = idx > 0 && cell.dist !== prevCell?.dist;
                        const isSource = node === sourceNode.toUpperCase();

                        return (
                          <td key={node} className="p-4 text-center">
                            <span className={`inline-block min-w-[3.5rem] px-3 py-1 rounded-lg font-mono text-base transition-all duration-300 ${
                              isSource && cell.dist === 0 ? 'text-yellow-500 font-extrabold border border-yellow-500/30 bg-yellow-500/5' : 
                              isUpdated ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg' : 
                              'text-slate-400'
                            }`}>
                              {cell.dist === Infinity ? '∞' : (
                                <span className="flex items-center justify-center">
                                  {cell.dist}
                                  <sub className="text-[10px] opacity-70 ml-0.5">{cell.parent || ''}</sub>
                                </span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Table will generate after calculation.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BellmanFordVisualizer;