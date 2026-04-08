import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const REACTION_EMOJIS = ['🔥', '💪', '👏', '🎯', '⭐']

export default function ReactionsBar({ goalId, currentUserId }) {
  const [reactions, setReactions] = useState([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    fetchReactions()
  }, [goalId])

  async function fetchReactions() {
    const { data } = await supabase
      .from('reactions')
      .select('*, profiles(username)')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true })
    setReactions(data || [])
  }

  async function toggleReaction(emoji) {
    const existing = reactions.find(
      r => r.user_id === currentUserId && r.emoji === emoji
    )
    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('reactions').insert({
        goal_id: goalId,
        user_id: currentUserId,
        emoji,
      })
    }
    setShowPicker(false)
    fetchReactions()
  }

  // Group reactions by emoji
  const grouped = {}
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = []
    grouped[r.emoji].push(r)
  }

  const myReactions = new Set(
    reactions.filter(r => r.user_id === currentUserId).map(r => r.emoji)
  )

  return (
    <div className="reactions-bar" onClick={e => e.stopPropagation()}>
      <div className="reactions-list">
        {Object.entries(grouped).map(([emoji, users]) => (
          <button
            key={emoji}
            className={`reaction-chip ${myReactions.has(emoji) ? 'mine' : ''}`}
            onClick={() => toggleReaction(emoji)}
            title={users.map(u => `@${u.profiles?.username}`).join(', ')}
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{users.length}</span>
          </button>
        ))}

        <button
          className="reaction-add"
          onClick={() => setShowPicker(!showPicker)}
          title="Add reaction"
        >
          +
        </button>
      </div>

      {showPicker && (
        <div className="reaction-picker">
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              className={`picker-emoji ${myReactions.has(emoji) ? 'active' : ''}`}
              onClick={() => toggleReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
