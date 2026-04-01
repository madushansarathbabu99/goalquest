import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Check, Users, MessageCircle, Trophy } from 'lucide-react'

export default function NotificationsPanel() {
  const { user } = useAuth()
  const [nudges, setNudges] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [milestones, setMilestones] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchAll()
    const channel = supabase.channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nudges' }, fetchAll)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships' }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchAll() {
    // Fetch unread nudges for my goals
    const { data: nudgeData } = await supabase
      .from('nudges')
      .select('*, sender:sender_id(username), goal:goal_id(title)')
      .eq('read', false)
      .order('created_at', { ascending: false })

    // Only show nudges for goals I own
    const myNudges = []
    for (const n of (nudgeData || [])) {
      const { data: goal } = await supabase.from('goals').select('user_id').eq('id', n.goal_id).single()
      if (goal?.user_id === user.id) myNudges.push(n)
    }
    setNudges(myNudges)

    // Pending friend requests sent TO me
    const { data: frData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(username)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
    setFriendRequests(frData || [])

    // Day milestones from goals
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
    const ms = []
    for (const g of (goals || [])) {
      const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / 86400000)
      if ([7, 3, 1].includes(daysLeft)) {
        ms.push({ id: g.id, title: g.title, daysLeft })
      }
    }
    setMilestones(ms)
  }

  const totalUnread = nudges.length + friendRequests.length + milestones.length

  async function markNudgeRead(id) {
    await supabase.from('nudges').update({ read: true }).eq('id', id)
    setNudges(n => n.filter(x => x.id !== id))
  }

  async function handleFriendRequest(id, accept) {
    await supabase.from('friendships').update({ status: accept ? 'accepted' : 'rejected' }).eq('id', id)
    setFriendRequests(r => r.filter(x => x.id !== id))
  }

  return (
    <div className="notif-wrap">
      <button className="notif-btn" onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {totalUnread > 0 && <span className="notif-badge">{totalUnread}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-header">
            <h3>Notifications</h3>
            <span className="notif-count">{totalUnread} new</span>
          </div>

          {totalUnread === 0 && (
            <div className="notif-empty">
              <Bell size={24} />
              <p>All caught up!</p>
            </div>
          )}

          {milestones.map(m => (
            <div key={m.id} className="notif-item milestone">
              <div className="notif-icon"><Trophy size={14} /></div>
              <div className="notif-body">
                <p><strong>{m.daysLeft} day{m.daysLeft !== 1 ? 's' : ''} left</strong> on "{m.title}"</p>
                <span className="notif-time">Deadline approaching</span>
              </div>
            </div>
          ))}

          {friendRequests.map(fr => (
            <div key={fr.id} className="notif-item friend-req">
              <div className="notif-icon"><Users size={14} /></div>
              <div className="notif-body">
                <p><strong>@{fr.requester?.username}</strong> wants to be accountability partners</p>
                <div className="notif-actions">
                  <button className="btn-xs success" onClick={() => handleFriendRequest(fr.id, true)}>Accept</button>
                  <button className="btn-xs danger" onClick={() => handleFriendRequest(fr.id, false)}>Decline</button>
                </div>
              </div>
            </div>
          ))}

          {nudges.map(n => (
            <div key={n.id} className="notif-item nudge">
              <div className="notif-icon"><MessageCircle size={14} /></div>
              <div className="notif-body">
                <p><strong>@{n.sender?.username}</strong>: {n.message}</p>
                <span className="notif-sub">Re: "{n.goal?.title}"</span>
                <div className="notif-actions">
                  <button className="btn-xs" onClick={() => markNudgeRead(n.id)}>
                    <Check size={12} /> Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
