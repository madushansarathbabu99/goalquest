import { useState } from 'react'
import { X } from 'lucide-react'
import { format, addDays } from 'date-fns'
import TagFriendPicker from './TagFriendPicker'

export default function AddGoalModal({ onClose, onAdd, currentUserId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"))
  const [points, setPoints] = useState(10)
  const [gift, setGift] = useState('')
  const [taggedFriendId, setTaggedFriendId] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await onAdd({
      title: title.trim(),
      description: description.trim(),
      deadline,
      points: Number(points),
      gift: gift.trim() || null,
      tagged_friend_id: taggedFriendId,
    })
    setLoading(false)
    onClose()
  }

  const pointOptions = [5, 10, 20, 50, 100]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>New Goal</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Goal Title *</label>
            <input type="text" placeholder="e.g. Learn Python basics" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea placeholder="What does success look like?" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="field">
            <label>Deadline *</label>
            <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} required min={format(new Date(), "yyyy-MM-dd'T'HH:mm")} />
          </div>
          <div className="field">
            <label>Points on Completion</label>
            <div className="points-select">
              {pointOptions.map(p => (
                <button type="button" key={p} className={`points-opt ${points === p ? 'active' : ''}`} onClick={() => setPoints(p)}>
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
          <div className="field">
            <label>Tag Accountability Partner</label>
            <TagFriendPicker
              currentUserId={currentUserId}
              selectedId={taggedFriendId}
              onChange={setTaggedFriendId}
            />
            <span className="field-hint">Tag a friend so they can keep you on track!</span>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
              {loading ? 'Adding…' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
