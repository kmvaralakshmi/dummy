import { useState } from 'react'
import { trackingAPI } from '../api'

export default function TestSimulator({ experiments }) {
  const [selectedExperiment, setSelectedExperiment] = useState('')
  const [userId, setUserId] = useState('')
  const [assignment, setAssignment] = useState(null)
  const [trackingResult, setTrackingResult] = useState(null)
  const [error, setError] = useState('')

  const handleAssign = async () => {
    if (!selectedExperiment || !userId) {
      setError('Please select an experiment and enter a user ID')
      return
    }

    try {
      setError('')
      const response = await trackingAPI.assign(selectedExperiment, userId)
      setAssignment(response.data)
      setTrackingResult(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign variant')
      setAssignment(null)
    }
  }

  const handleTrackEvent = async (eventType) => {
    if (!assignment) {
      setError('Please assign a variant first')
      return
    }

    try {
      setError('')
      const response = await trackingAPI.track({
        experimentKey: selectedExperiment,
        variantKey: assignment.variantKey,
        userId: userId,
        eventType: eventType
      })
      setTrackingResult(`✅ ${eventType} event tracked successfully!`)
      setTimeout(() => setTrackingResult(null), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to track event')
    }
  }

  const generateRandomUserId = () => {
    setUserId(`user_${Math.random().toString(36).substr(2, 9)}`)
  }

  return (
    <div>
      <h2>🎯 Test Simulator</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        Simulate user interactions with your experiments to generate test data
      </p>

      {experiments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3 style={{ color: '#7f8c8d' }}>No running experiments</h3>
          <p style={{ color: '#95a5a6', marginTop: '8px' }}>Start an experiment first to use the simulator</p>
        </div>
      ) : (
        <div className="grid grid-2">
          <div className="card">
            <h3>1. Assign User to Variant</h3>

            {error && <div className="error-message">{error}</div>}
            {trackingResult && <div className="success-message">{trackingResult}</div>}

            <div className="form-group">
              <label>Select Experiment</label>
              <select 
                value={selectedExperiment} 
                onChange={(e) => {
                  setSelectedExperiment(e.target.value)
                  setAssignment(null)
                }}
              >
                <option value="">-- Choose an experiment --</option>
                {experiments.map(exp => (
                  <option key={exp.key} value={exp.key}>{exp.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>User ID</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g., user_123"
                  style={{ flex: 1 }}
                />
                <button 
                  onClick={generateRandomUserId}
                  style={{ background: '#ecf0f1', color: '#2c3e50' }}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <button 
              className="primary" 
              onClick={handleAssign}
              disabled={!selectedExperiment || !userId}
              style={{ width: '100%' }}
            >
              Assign Variant
            </button>

            {assignment && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#d4edda', borderRadius: '6px' }}>
                <h4 style={{ marginBottom: '8px', color: '#155724' }}>✅ Assignment Successful</h4>
                <div style={{ fontSize: '14px', color: '#155724' }}>
                  <div><strong>Variant:</strong> {assignment.variantKey}</div>
                  <div><strong>Experiment:</strong> {assignment.experimentKey}</div>
                  <div><strong>New Assignment:</strong> {assignment.isNewAssignment ? 'Yes' : 'No (existing)'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3>2. Track Events</h3>
            
            {!assignment ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#7f8c8d' }}>
                <p>Assign a user to a variant first to track events</p>
              </div>
            ) : (
              <>
                <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '16px' }}>
                  Simulate user interactions for <strong>{userId}</strong> in variant <strong>{assignment.variantKey}</strong>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={() => handleTrackEvent('impression')}
                    style={{ background: '#3498db', color: 'white' }}
                  >
                    👁️ Track Impression
                  </button>
                  
                  <button 
                    onClick={() => handleTrackEvent('click')}
                    style={{ background: '#f39c12', color: 'white' }}
                  >
                    👆 Track Click
                  </button>
                  
                  <button 
                    onClick={() => handleTrackEvent('conversion')}
                    style={{ background: '#27ae60', color: 'white' }}
                  >
                    💰 Track Conversion
                  </button>
                </div>

                <div style={{ marginTop: '20px', padding: '12px', background: '#fff3cd', borderRadius: '6px', fontSize: '13px', color: '#856404' }}>
                  💡 <strong>Tip:</strong> Track multiple events for different users to generate meaningful statistics
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Quick Batch Testing</h3>
        <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '16px' }}>
          Generate sample data for testing your experiment
        </p>
        
        <button 
          className="primary"
          onClick={async () => {
            if (!selectedExperiment) {
              setError('Please select an experiment first')
              return
            }

            try {
              setError('')
              for (let i = 0; i < 10; i++) {
                const testUserId = `test_user_${i}_${Date.now()}`
                const assignRes = await trackingAPI.assign(selectedExperiment, testUserId)
                
                // Track impression
                await trackingAPI.track({
                  experimentKey: selectedExperiment,
                  variantKey: assignRes.data.variantKey,
                  userId: testUserId,
                  eventType: 'impression'
                })
                
                // 70% chance of click
                if (Math.random() > 0.3) {
                  await trackingAPI.track({
                    experimentKey: selectedExperiment,
                    variantKey: assignRes.data.variantKey,
                    userId: testUserId,
                    eventType: 'click'
                  })
                }
                
                // 20% chance of conversion
                if (Math.random() > 0.8) {
                  await trackingAPI.track({
                    experimentKey: selectedExperiment,
                    variantKey: assignRes.data.variantKey,
                    userId: testUserId,
                    eventType: 'conversion'
                  })
                }
              }
              setTrackingResult('✅ Generated 10 test users with events!')
            } catch (err) {
              setError('Failed to generate test data')
            }
          }}
          disabled={!selectedExperiment}
        >
          🚀 Generate 10 Test Users
        </button>
      </div>
    </div>
  )
}
