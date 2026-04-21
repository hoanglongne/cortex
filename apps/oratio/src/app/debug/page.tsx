"use client";

import { useState, useEffect } from "react";
import { getQueueStatus, debugResetAndJoin, debugForceMatch, checkMatchStatus, debugAnalyzeMatchmaking } from "@/actions/matchmaking";
import { useSupabaseAuth } from "@/hooks/useSupabase";

export default function DebugPage() {
  const { user } = useSupabaseAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queueStatus, setQueueStatus] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchStatus, setMatchStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analysis, setAnalysis] = useState<any>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const refreshStatus = async () => {
    try {
      const qStatus = await getQueueStatus();
      setQueueStatus(qStatus);
      
      const mStatus = await checkMatchStatus();
      setMatchStatus(mStatus);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog(`Error refreshing status: ${msg}`);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    setLoading(true);
    addLog("Resetting and joining queue...");
    try {
      const res = await debugResetAndJoin();
      addLog(res.message);
      if (res.success) refreshStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceMatch = async () => {
    setLoading(true);
    addLog("Attempting to force match...");
    try {
      const res = await debugForceMatch();
      addLog(res.message);
      if (res.logs) {
        res.logs.forEach(l => addLog(`SERVER: ${l}`));
      }
      
      if (res.success && res.roomId) {
      addLog(`Match created! Room ID: ${res.roomId}`);
      addLog("Redirecting to room in 3 seconds...");
      setTimeout(() => {
        window.location.href = `/room/${res.roomId}`;
      }, 3000);
    }
    
    refreshStatus();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    addLog(`Error: ${msg}`);
  } finally {
    setLoading(false);
  }
};

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    addLog("Analyzing matchmaking logic...");
    try {
      const res = await debugAnalyzeMatchmaking();
      setAnalysis(res);
      res.logs.forEach(l => addLog(`ANALYSIS: ${l}`));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      addLog(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Matchmaking Debugger</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Info */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <div className="space-y-1">
            <p><strong>ID:</strong> {user?.id || "Not logged in"}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>

        {/* Current Match Status */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">My Match Status</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-auto h-32">
            {JSON.stringify(matchStatus, null, 2)}
          </pre>
          {matchStatus?.roomId && (
            <div className="mt-2">
              <a href={`/room/${matchStatus.roomId}`} className="block w-full text-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Join Active Match
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Queue Status */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Global Queue Status</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-gray-500 text-sm">Waiting Users</div>
            <div className="text-3xl font-bold text-blue-600">{queueStatus?.waitingCount ?? "-"}</div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="text-gray-500 text-sm">Total Entries</div>
            <div className="text-3xl font-bold text-gray-700">{queueStatus?.totalCount ?? "-"}</div>
          </div>
        </div>

        <h3 className="font-medium mb-2">Recent Queue Entries:</h3>
        <div className="bg-white rounded border overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Band</th>
                <th className="p-2 text-left">Target</th>
                <th className="p-2 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {queueStatus?.recentEntries?.map((entry: any) => (
                <tr key={entry.userId} className="border-t">
                  <td className="p-2 font-mono text-xs">{entry.profileName} ({entry.userId.slice(0, 4)}...)</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === 'waiting' ? 'bg-green-100 text-green-800' : 
                      entry.status === 'matched' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-2">{entry.profileBand}</td>
                  <td className="p-2">{entry.bandMin}-{entry.bandMax}</td>
                  <td className="p-2 text-gray-500">{new Date(entry.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {!queueStatus?.recentEntries?.length && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h2 className="text-xl font-semibold mb-2 text-purple-800">Match Analysis</h2>
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {analysis.candidates.map((c: any, i: number) => (
              <div key={i} className={`p-3 rounded border ${c.compatible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-bold">{c.compatible ? "✅ Compatible" : "❌ Not Compatible"}</div>
                <div className="text-sm">User: {c.userId}</div>
                <div className="text-sm">Reason: {c.reason}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Them: Band {c.theirBand} (Wants {c.theyWant[0]}-{c.theyWant[1]}) <br/>
                  Me: (Wants {c.weWant[0]}-{c.weWant[1]})
                </div>
              </div>
            ))}
            {analysis.candidates.length === 0 && (
              <div className="text-gray-500">No other waiting users found to analyze.</div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handleReset}
          disabled={loading || !user}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Reset Me & Join Queue
        </button>
        <button
          onClick={handleForceMatch}
          disabled={loading || !user}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Force Match (Admin)
        </button>
        <button
          onClick={handleAnalyze}
          disabled={loading || !user}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Analyze Why No Match
        </button>
        <button
          onClick={refreshStatus}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* Logs */}
      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-auto">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
        {logs.length === 0 && <div className="text-gray-500">Ready...</div>}
      </div>
    </div>
  );
}
