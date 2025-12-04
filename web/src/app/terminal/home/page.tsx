export default function TerminalHomePage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-900/20 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Intelligence Terminal</h1>
        <p className="text-gray-400">Welcome to the GhostQuant Intelligence Terminal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Threat Map</h3>
          <p className="text-sm text-gray-400">Visualize global threat landscape</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Influence Graph</h3>
          <p className="text-sm text-gray-400">Network analysis and relationships</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">AI Timeline</h3>
          <p className="text-sm text-gray-400">Temporal event analysis</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Ring Detector</h3>
          <p className="text-sm text-gray-400">Manipulation ring detection</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Entity Explorer</h3>
          <p className="text-sm text-gray-400">Deep entity investigation</p>
        </div>
        
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">GhostMind AI</h3>
          <p className="text-sm text-gray-400">AI-powered intelligence assistant</p>
        </div>
      </div>
    </div>
  )
}
