import { useState } from 'react'

export default function CreateExperiment({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    variants: [
      { name: 'Control', key: 'control', weight: 50, description: '' },
      { name: 'Variant A', key: 'variant-a', weight: 50, description: '' }
    ]
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants]
    newVariants[index][field] = field === 'weight' ? parseFloat(value) || 0 : value
    setFormData({ ...formData, variants: newVariants })
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: `Variant ${String.fromCharCode(65 + formData.variants.length)}`, key: `variant-${formData.variants.length}`, weight: 0, description: '' }
      ]
    })
  }

  const removeVariant = (index) => {
    if (formData.variants.length <= 2) {
      setError('An experiment must have at least 2 variants')
      return
    }
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: newVariants })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate
    const totalWeight = formData.variants.reduce((sum, v) => sum + v.weight, 0)
    if (totalWeight !== 100) {
      setError('Variant weights must sum to 100%')
      return
    }

    if (!formData.name || !formData.key) {
      setError('Name and key are required')
      return
    }

    try {
      await onSubmit(formData)
      setSuccess(true)
      // Reset form
      setFormData({
        name: '',
        key: '',
        description: '',
        variants: [
          { name: 'Control', key: 'control', weight: 50, description: '' },
          { name: 'Variant A', key: 'variant-a', weight: 50, description: '' }
        ]
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create experiment')
    }
  }

  const totalWeight = formData.variants.reduce((sum, v) => sum + v.weight, 0)

  return (
    <div>
      <h2>Create New Experiment</h2>
      
      <div className="card" style={{ maxWidth: '800px' }}>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Experiment created successfully!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Experiment Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Homepage Button Color Test"
              required
            />
          </div>

          <div className="form-group">
            <label>Experiment Key * (unique identifier)</label>
            <input
              type="text"
              name="key"
              value={formData.key}
              onChange={handleChange}
              placeholder="e.g., homepage-button-v1"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of what you're testing..."
              rows="3"
            />
          </div>

          <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>
            Variants 
            <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '12px', color: totalWeight === 100 ? '#27ae60' : '#e74c3c' }}>
              Total Weight: {totalWeight}%
            </span>
          </h3>

          {formData.variants.map((variant, index) => (
            <div key={index} className="card" style={{ marginBottom: '16px', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Variant {index + 1}</h4>
                {formData.variants.length > 2 && (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeVariant(index)}
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Variant Name</label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Variant Key</label>
                  <input
                    type="text"
                    value={variant.key}
                    onChange={(e) => handleVariantChange(index, 'key', e.target.value)}
                    pattern="[a-z0-9-]+"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Traffic Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={variant.weight}
                  onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={variant.description}
                  onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                  placeholder="What's different about this variant?"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            style={{ marginBottom: '20px', background: '#ecf0f1', color: '#2c3e50' }}
          >
            + Add Variant
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="primary" style={{ flex: 1 }}>
              Create Experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
