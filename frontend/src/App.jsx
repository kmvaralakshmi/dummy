import { useState, useEffect } from 'react'
import { experimentAPI, analyticsAPI, trackingAPI } from './api'
import Dashboard from './components/Dashboard'
import ExperimentList from './components/ExperimentList'
import CreateExperiment from './components/CreateExperiment'
import ExperimentDetails from './components/ExperimentDetails'
import TestSimulator from './components/TestSimulator'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [experiments, setExperiments] = useState([])
  const [selectedExperiment, setSelectedExperiment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    completed: 0,
  })

  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    try {
      setLoading(true)
      const response = await experimentAPI.getAll()
      const exps = response.data
      setExperiments(exps)
      
      setStats({
        total: exps.length,
        running: exps.filter(e => e.status === 'running').length,
        completed: exps.filter(e => e.status === 'completed').length,
      })
    } catch (error) {
      console.error('Failed to load experiments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExperiment = async (data) => {
    try {
      await experimentAPI.create(data)
      await loadExperiments()
      setActiveTab('experiments')
    } catch (error) {
      console.error('Failed to create experiment:', error)
      throw error
    }
  }

  const handleViewDetails = (experiment) => {
    setSelectedExperiment(experiment)
    setActiveTab('details')
  }

  const handleStartExperiment = async (key) => {
    try {
      await experimentAPI.start(key)
      await loadExperiments()
      if (selectedExperiment?.key === key) {
        const response = await experimentAPI.getOne(key)
        setSelectedExperiment(response.data)
      }
    } catch (error) {
      console.error('Failed to start experiment:', error)
    }
  }

  const handlePauseExperiment = async (key) => {
    try {
      await experimentAPI.pause(key)
      await loadExperiments()
      if (selectedExperiment?.key === key) {
        const response = await experimentAPI.getOne(key)
        setSelectedExperiment(response.data)
      }
    } catch (error) {
      console.error('Failed to pause experiment:', error)
    }
  }

  const handleCompleteExperiment = async (key) => {
    try {
      await experimentAPI.complete(key)
      await loadExperiments()
      if (selectedExperiment?.key === key) {
        const response = await experimentAPI.getOne(key)
        setSelectedExperiment(response.data)
      }
    } catch (error) {
      console.error('Failed to complete experiment:', error)
    }
  }

  const handleDeleteExperiment = async (key) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return
    
    try {
      await experimentAPI.delete(key)
      await loadExperiments()
      if (selectedExperiment?.key === key) {
        setSelectedExperiment(null)
        setActiveTab('experiments')
      }
    } catch (error) {
      console.error('Failed to delete experiment:', error)
    }
  }

  return (
    <div className="app">
      <nav className="nav">
        <h1>🧪 A/B Testing Dashboard</h1>
      </nav>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab ${activeTab === 'experiments' ? 'active' : ''}`}
            onClick={() => setActiveTab('experiments')}
          >
            🔬 Experiments
          </button>
          <button 
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Create New
          </button>
          <button 
            className={`tab ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            🎯 Test Simulator
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                experiments={experiments}
                onViewDetails={handleViewDetails}
              />
            )}

            {activeTab === 'experiments' && (
              <ExperimentList 
                experiments={experiments}
                onViewDetails={handleViewDetails}
                onStart={handleStartExperiment}
                onPause={handlePauseExperiment}
                onComplete={handleCompleteExperiment}
                onDelete={handleDeleteExperiment}
              />
            )}

            {activeTab === 'create' && (
              <CreateExperiment onSubmit={handleCreateExperiment} />
            )}

            {activeTab === 'details' && selectedExperiment && (
              <ExperimentDetails 
                experiment={selectedExperiment}
                onStart={handleStartExperiment}
                onPause={handlePauseExperiment}
                onComplete={handleCompleteExperiment}
                onDelete={handleDeleteExperiment}
                onBack={() => setActiveTab('experiments')}
              />
            )}

            {activeTab === 'simulator' && (
              <TestSimulator experiments={experiments.filter(e => e.status === 'running')} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
