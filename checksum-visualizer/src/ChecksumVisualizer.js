import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle2, Terminal, Zap } from 'lucide-react';

const ChecksumVisualizer = () => {
  const [inputData, setInputData] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isCorrupted, setIsCorrupted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [receiverResult, setReceiverResult] = useState(null);

  // Logic: 8-bit Checksum calculation
  const runChecksumLogic = (data, forceError = false) => {
    let newLogs = [];
    newLogs.push(`Starting calculation for: "${data}"`);
    
    let sum = 0;
    const charCodes = data.split('').map(char => char.charCodeAt(0));
    
    newLogs.push(`ASCII Values: [${charCodes.join(', ')}]`);

    charCodes.forEach((code, i) => {
      sum += code;
      newLogs.push(`Step ${i + 1}: Adding ${code} (Sum: ${sum})`);
    });

    // Handle Carry
    while (sum >> 8) {
      const carry = sum >> 8;
      newLogs.push(`Carry detected: ${carry}. Adding back to sum...`);
      sum = (sum & 0xFF) + carry;
    }
    
    const senderChecksum = (~sum & 0xFF);
    newLogs.push(`One's Complement: ${senderChecksum.toString(16).toUpperCase()} (Checksum)`);

    // Receiver Side
    let transmittedChecksum = forceError ? (senderChecksum ^ 0xFF) : senderChecksum;
    let receiverSum = sum + transmittedChecksum;
    
    // Final check logic
    while (receiverSum >> 8) {
        receiverSum = (receiverSum & 0xFF) + (receiverSum >> 8);
    }
    const finalCheck = (~receiverSum & 0xFF);

    return { senderChecksum, finalCheck, logs: newLogs };
  };

  const handleTransmit = async () => {
    setIsTransmitting(true);
    setReceiverResult(null);
    
    // Calculate Checksum on Frontend (Sender Side)
    const result = runChecksumLogic(inputData, isCorrupted);
    setLogs(["Initialising connection...", ...result.logs]);

    try {
        // Send data to the Node.js Backend
        const response = await fetch('http://localhost:5000/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: inputData,
                checksum: result.senderChecksum.toString(16)
            })
        });

        const apiData = await response.json();

        // Simulate network delay for the animation
        setTimeout(() => {
            setIsTransmitting(false);
            setReceiverResult(apiData.valid ? 'SUCCESS' : 'ERROR');
            setLogs(prev => [...prev, `Server Response: ${apiData.status}`]);
        }, 2000);

    } catch (error) {
        setLogs(prev => [...prev, "Error: Could not connect to Backend server."]);
        setIsTransmitting(false);
    }
};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Network Checksum Visualizer</h1>
        <p className="text-slate-400">Perform error detection using One's Complement logic</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SENDER PANEL */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Send size={20} />
            <h2 className="text-xl font-semibold">Sender Node</h2>
          </div>
          
          <input 
            type="text" 
            placeholder="Enter data to send..."
            className="w-full bg-slate-950 border border-slate-600 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />

          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={handleTransmit}
              disabled={!inputData || isTransmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 px-6 py-2 rounded-lg font-medium transition-all"
            >
              {isTransmitting ? 'Transmitting...' : 'Transmit Data'}
            </button>

            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input 
                type="checkbox" 
                checked={isCorrupted}
                onChange={() => setIsCorrupted(!isCorrupted)}
                className="w-4 h-4 rounded"
              />
              Inject Noise (Corrupt Bit)
            </label>
          </div>

          {/* TRANSIT ANIMATION */}
          <div className="relative h-2 bg-slate-950 rounded-full overflow-hidden">
            {isTransmitting && (
              <div className="absolute top-0 h-full bg-blue-400 animate-slide-right w-1/4 shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
            )}
          </div>
        </section>

        {/* RECEIVER PANEL */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Zap size={20} />
            <h2 className="text-xl font-semibold">Receiver Node</h2>
          </div>

          <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
            {!receiverResult && !isTransmitting && <p className="text-slate-500 italic">Waiting for data...</p>}
            {isTransmitting && <p className="text-blue-400 animate-pulse">Incoming Packet...</p>}
            {receiverResult === 'SUCCESS' && (
              <div className="text-emerald-400 flex flex-col items-center">
                <CheckCircle2 size={40} />
                <span className="font-bold mt-2">Data Verified (No Errors)</span>
              </div>
            )}
            {receiverResult === 'ERROR' && (
              <div className="text-red-400 flex flex-col items-center">
                <AlertCircle size={40} />
                <span className="font-bold mt-2">Checksum Mismatch (Corrupted)</span>
              </div>
            )}
          </div>
        </section>

        {/* DEVELOPER CONSOLE */}
        <section className="lg:col-span-2 bg-black p-6 rounded-xl border border-slate-800 font-mono text-sm shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
            <Terminal size={16} />
            <h3>Process Logs / Step-by-Step Logic</h3>
          </div>
          <div className="h-64 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="text-emerald-500 opacity-90">
                <span className="text-slate-600 mr-2">[{i}]</span> {log}
              </div>
            ))}
            {logs.length === 0 && <span className="text-slate-700 italic">No activity detected.</span>}
          </div>
        </section>
      </main>

      {/* Required CSS for the packet animation */}
      <style>{`
        @keyframes slide-right {
          0% { left: -25%; }
          100% { left: 100%; }
        }
        .animate-slide-right {
          animation: slide-right 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default ChecksumVisualizer;