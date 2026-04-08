import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { UserPlus, X } from 'lucide-react'

export default function TagFriendPicker({ currentUserId, selectedId, onChange }) {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchFriends()
  }, [currentUserId])

  async function fetchFriends() {
    const { data } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id, username), addressee:addressee_id(id, username)')
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
      .eq('status', 'accepted')

    const list = (data || []).map(f =>
      f.requester_id === currentUserId ? f.addressee : f.requester
    )
    setFriends(list)
    setLoading(false)
  }

  const selectedFriend = friends.find(f => f.id === selectedId)

  if (loading) return <div className="tag-loading">Loading friends…</div>

  return (
    <div className="tag-friend-picker">
      {selectedFriend ? (
        <div className="tag-selected">
          <div className="tag-chip">
            <div className="tag-avatar">{selectedFriend.username[0].toUpperCase()}</div>
            <span>@{selectedFriend.username}</span>
            <button
              type="button"
              className="tag-remove"
              onClick={() => onChange(null)}
              title="Remove tag"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="tag-select-area">
          {!open ? (
            <button
              type="button"
              className="tag-trigger"
              onClick={() => setOpen(true)}
            >
              <UserPlus size={14} />
              Tag a friend
            </button>
          ) : (
            <div className="tag-dropdown">
              {friends.length === 0 ? (
                <div className="tag-empty">No friends yet — add some first!</div>
              ) : (
                friends.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className="tag-option"
                    onClick={() => { onChange(f.id); setOpen(false) }}
                  >
                    <div className="tag-avatar">{f.username[0].toUpperCase()}</div>
                    <span>@{f.username}</span>
                  </button>
                ))
              )}
              <button
                type="button"
                className="tag-cancel"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
