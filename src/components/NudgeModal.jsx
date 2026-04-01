import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'

const QUICK_NUDGES = [
  "Hey, how's this goal going? 👀",
  "You've got this! Any updates?",
  "Deadline is coming up — need any help?",
  "Just checking in — what's the progress?",
  "Don't give up, you're almost there!",
]

export default function NudgeModal({ goal, onClose, onSend }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(msg) {
    const text = msg || message.trim()
    if (!text) return
    setLoading(true)
    await onSend(goal.id, text)
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={18} />
            <h2>Send Accountability Nudge</h2>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="nudge-target">To: <strong>{goal.profiles?.username}</strong> · "{goal.title}"</p>

        <div className="field">
          <label>Quick messages</label>
          <div className="quick-nudges">
            {QUICK_NUDGES.map(q => (
              <button key={q} type="button" className="quick-nudge-btn" onClick={() => handleSend(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Or write your own</label>
          <textarea
            placeholder="Write a custom message…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => handleSend(null)} disabled={loading || !message.trim()}>
            {loading ? 'Sending…' : 'Send Nudge'}
          </button>
        </div>
      </div>
    </div>
  )
}
