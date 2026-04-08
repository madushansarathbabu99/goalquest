import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { format } from 'date-fns'

export default function EditGoalModal({ goal, onClose, onSave }) {
  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description || '')
  const [deadline, setDeadline] = useState(format(new Date(goal.deadline), "yyyy-MM-dd'T'HH:mm"))
  const [points, setPoints] = useState(goal.points)
  const [gift, setGift] = useState(goal.gift || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await onSave({
      id: goal.id,
      title: title.trim(),
      description: description.trim(),
      deadline,
      points: Number(points),
      gift: gift.trim() || null,
    })
    setLoading(false)
    onClose()
  }

  const pointOptions = [5, 10, 20, 50, 100]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Goal</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Goal Title *</label>
            <input
              type="text"
              placeholder="e.g. Learn Python basics"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="What does success look like?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="field">
            <label>Deadline *</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              required
              disabled={goal.completed}
            />
          </div>
          <div className="field">
            <label>Points on Completion</label>
            <div className="points-select">
              {pointOptions.map(p => (
                <button
                  type="button"
                  key={p}
                  className={`points-opt ${points === p ? 'active' : ''}`}
                  onClick={() => setPoints(p)}
                  disabled={goal.completed}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Reward / Gift for Completing</label>
            <div className="gift-input-wrap">
              <span className="gift-icon">🎁</span>
              <input
                type="text"
                placeholder="e.g. New book, movie night, treat yourself…"
                value={gift}
                onChange={e => setGift(e.target.value)}
                className="gift-input"
              />
            </div>
            <span className="field-hint">Set a personal reward to motivate yourself!</span>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
              <Save size={14} />
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
