export default function ExperimentList({ experiments, onViewDetails, onStart, onPause, onComplete, onDelete }) {
  const getStatusBadge = (status) => {
    return <span className={`badge ${status}`}>{status}</span>
  }

  return (
    <div>
      <h2>All Experiments</h2>
      
      {experiments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#7f8c8d' }}>No experiments found</h3>
          <p style={{ color: '#95a5a6', marginTop: '8px' }}>Create your first experiment to begin testing!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {experiments.map(exp => (
            <div key={exp.key} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ marginBottom: '4px' }}>{exp.name}</h3>
                  <code style={{ fontSize: '12px', color: '#7f8c8d' }}>{exp.key}</code>
                </div>
                {getStatusBadge(exp.status)}
              </div>
              
              {exp.description && (
                <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '12px' }}>
                  {exp.description}
                </p>
              )}
              
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '14px' }}>Variants ({exp.variants.length}):</strong>
                <div style={{ marginTop: '8px' }}>
                  {exp.variants.map(v => (
                    <div key={v.key} style={{ fontSize: '13px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{v.name}</span>
                      <span style={{ color: '#7f8c8d' }}>{v.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="primary" 
                  onClick={() => onViewDetails(exp)}
                  style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                >
                  📊 Details
                </button>
                
                {exp.status === 'draft' && (
                  <button 
                    className="success" 
                    onClick={() => onStart(exp.key)}
                    style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                  >
                    ▶️ Start
                  </button>
                )}
                
                {exp.status === 'running' && (
                  <>
                    <button 
                      className="warning" 
                      onClick={() => onPause(exp.key)}
                      style={{ fontSize: '13px', padding: '8px' }}
                    >
                      ⏸️ Pause
                    </button>
                    <button 
                      className="success" 
                      onClick={() => onComplete(exp.key)}
                      style={{ fontSize: '13px', padding: '8px' }}
                    >
                      ✅ Complete
                    </button>
                  </>
                )}
                
                {exp.status === 'paused' && (
                  <button 
                    className="success" 
                    onClick={() => onStart(exp.key)}
                    style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                  >
                    ▶️ Resume
                  </button>
                )}
                
                <button 
                  className="danger" 
                  onClick={() => onDelete(exp.key)}
                  style={{ fontSize: '13px', padding: '8px' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
