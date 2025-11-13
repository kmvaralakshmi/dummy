import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api'

export default function ExperimentDetails({ experiment, onStart, onPause, onComplete, onDelete, onBack }) {
  const [results, setResults] = useState(null)
  const [participants, setParticipants] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [experiment.key])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [resultsRes, participantsRes] = await Promise.all([
        analyticsAPI.getResults(experiment.key),
        analyticsAPI.getParticipants(experiment.key)
      ])
      setResults(resultsRes.data)
      setParticipants(participantsRes.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    return <span className={`badge ${status}`}>{status}</span>
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '16px', background: '#ecf0f1', color: '#2c3e50' }}>
        ← Back to Experiments
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ marginBottom: '8px' }}>{experiment.name}</h2>
            <code style={{ color: '#7f8c8d' }}>{experiment.key}</code>
          </div>
          {getStatusBadge(experiment.status)}
        </div>

        {experiment.description && (
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>{experiment.description}</p>
        )}

        <div className="grid grid-2" style={{ marginBottom: '20px' }}>
          <div>
            <strong>Created:</strong> {new Date(experiment.createdAt).toLocaleString()}
          </div>
          {experiment.startDate && (
            <div>
              <strong>Started:</strong> {new Date(experiment.startDate).toLocaleString()}
            </div>
          )}
          {experiment.endDate && (
            <div>
              <strong>Ended:</strong> {new Date(experiment.endDate).toLocaleString()}
            </div>
          )}
          <div>
            <strong>Variants:</strong> {experiment.variants.length}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
          {experiment.status === 'draft' && (
            <button className="success" onClick={() => onStart(experiment.key)}>
              ▶️ Start Experiment
            </button>
          )}
          {experiment.status === 'running' && (
            <>
              <button className="warning" onClick={() => onPause(experiment.key)}>
                ⏸️ Pause
              </button>
              <button className="success" onClick={() => onComplete(experiment.key)}>
                ✅ Complete
              </button>
            </>
          )}
          {experiment.status === 'paused' && (
            <button className="success" onClick={() => onStart(experiment.key)}>
              ▶️ Resume
            </button>
          )}
          <button className="danger" onClick={() => onDelete(experiment.key)}>
            🗑️ Delete
          </button>
          <button onClick={loadAnalytics} style={{ marginLeft: 'auto', background: '#ecf0f1', color: '#2c3e50' }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : (
        <>
          {participants && (
            <div className="card">
              <h3>Participants</h3>
              <div className="grid grid-2">
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{participants.total}</div>
                </div>
                {participants.byVariant.map(v => {
                  const variant = experiment.variants.find(ev => ev.key === v.variantKey)
                  return (
                    <div key={v.variantKey} className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                      <div className="stat-label">{variant?.name || v.variantKey}</div>
                      <div className="stat-value">{v.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {results && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Results & Statistics</h3>
                {results.winner && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px' }}>🏆</div>
                    <div style={{ fontSize: '14px', color: '#27ae60', fontWeight: 'bold' }}>
                      Winner: {results.variantStats.find(v => v.variantKey === results.winner)?.variantName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      {results.confidence}% confidence
                    </div>
                  </div>
                )}
              </div>

              {results.variantStats.length === 0 ? (
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>
                  No data yet. Start tracking events to see results.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Variant</th>
                      <th>Impressions</th>
                      <th>Clicks</th>
                      <th>Conversions</th>
                      <th>CTR</th>
                      <th>Conv. Rate</th>
                      <th>Unique Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.variantStats.map(stat => (
                      <tr key={stat.variantKey} style={{ 
                        background: stat.variantKey === results.winner ? '#d4edda' : 'transparent' 
                      }}>
                        <td>
                          <strong>{stat.variantName}</strong>
                          {stat.variantKey === results.winner && (
                            <span style={{ marginLeft: '8px' }}>🏆</span>
                          )}
                        </td>
                        <td>{stat.impressions}</td>
                        <td>{stat.clicks}</td>
                        <td>{stat.conversions}</td>
                        <td>{stat.clickThroughRate}%</td>
                        <td>
                          <strong style={{ color: '#27ae60' }}>{stat.conversionRate}%</strong>
                        </td>
                        <td>{stat.uniqueUsers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!results.winner && results.variantStats.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '6px', fontSize: '14px', color: '#856404' }}>
                  ℹ️ No statistically significant winner yet. Need at least 100 impressions per variant with 95%+ confidence.
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3>Variant Configuration</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key</th>
                  <th>Weight</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {experiment.variants.map(v => (
                  <tr key={v.key}>
                    <td><strong>{v.name}</strong></td>
                    <td><code>{v.key}</code></td>
                    <td>{v.weight}%</td>
                    <td style={{ color: '#7f8c8d' }}>{v.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
