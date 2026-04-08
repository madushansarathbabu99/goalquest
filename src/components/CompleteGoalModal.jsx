import { useState } from 'react'
import { X, Gift, CheckCircle } from 'lucide-react'

export default function CompleteGoalModal({ goal, onClose, onConfirm }) {
  const [gift, setGift] = useState(goal.gift || '')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm(goal, gift.trim() || null)
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} className="text-success" />
            <h2>Complete Goal</h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="complete-banner">
          <span className="complete-title">{goal.title}</span>
          <span className="complete-points">+{goal.points} pts</span>
        </div>

        <div className="field">
          <label>Reward / Gift for this Achievement</label>
          <div className="gift-input-wrap">
            <span className="gift-icon">🎁</span>
            <input
              type="text"
              placeholder="e.g. New book, movie night, treat yourself…"
              value={gift}
              onChange={e => setGift(e.target.value)}
              className="gift-input"
              autoFocus
            />
          </div>
          <span className="field-hint">What will you reward yourself with? (optional)</span>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary btn-complete" onClick={handleConfirm} disabled={loading}>
            <CheckCircle size={14} />
            {loading ? 'Completing…' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  )
}
