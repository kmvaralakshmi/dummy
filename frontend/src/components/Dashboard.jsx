export default function Dashboard({ stats, experiments, onViewDetails }) {
  const runningExperiments = experiments.filter(e => e.status === 'running')

  return (
    <div>
      <h2>Dashboard Overview</h2>
      
      <div className="grid grid-2">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="stat-label">Total Experiments</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="stat-label">Running Now</div>
          <div className="stat-value">{stats.running}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="stat-label">Draft</div>
          <div className="stat-value">{experiments.filter(e => e.status === 'draft').length}</div>
        </div>
      </div>

      {runningExperiments.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>🔥 Active Experiments</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Variants</th>
                <th>Started</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runningExperiments.map(exp => (
                <tr key={exp.key}>
                  <td>
                    <strong>{exp.name}</strong>
                    <br />
                    <small style={{ color: '#7f8c8d' }}>{exp.key}</small>
                  </td>
                  <td>{exp.variants.length} variants</td>
                  <td>{exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button 
                      className="primary"
                      onClick={() => onViewDetails(exp)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {experiments.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#7f8c8d' }}>No experiments yet</h3>
          <p style={{ color: '#95a5a6', marginTop: '8px' }}>Create your first A/B test to get started!</p>
        </div>
      )}
    </div>
  )
}
