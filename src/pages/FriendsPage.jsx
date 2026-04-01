import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import GoalCard from '../components/GoalCard'
import NudgeModal from '../components/NudgeModal'
import { UserPlus, Search } from 'lucide-react'

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [friendGoals, setFriendGoals] = useState([])
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [nudgeGoal, setNudgeGoal] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => { if (user) fetchFriendsAndGoals() }, [user])

  async function fetchFriendsAndGoals() {
    const { data: frData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id, username, score), addressee:addressee_id(id, username, score)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendList = (frData || []).map(f =>
      f.requester_id === user.id ? f.addressee : f.requester
    )
    setFriends(friendList)

    if (friendList.length > 0) {
      const ids = friendList.map(f => f.id)
      const { data: goals } = await supabase
        .from('goals')
        .select('*, profiles(username)')
        .in('user_id', ids)
        .order('deadline', { ascending: true })
      setFriendGoals(goals || [])
    } else {
      setFriendGoals([])
    }
  }

  async function searchUser() {
    if (!search.trim()) return
    setSearching(true)
    setSearchResult(null)
    const { data } = await supabase
      .from('profiles')
      .select('id, username, score')
      .ilike('username', search.trim())
      .neq('id', user.id)
      .single()
    setSearchResult(data || 'not_found')
    setSearching(false)
  }

  async function sendFriendRequest(addresseeId) {
    const { error } = await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
    if (error) setMsg(error.message)
    else setMsg('Friend request sent!')
    setSearchResult(null)
    setSearch('')
    setTimeout(() => setMsg(''), 3000)
  }

  async function sendNudge(goalId, message) {
    await supabase.from('nudges').insert({ goal_id: goalId, sender_id: user.id, message })
  }

  return (
    <div className="page">
      <h2 className="page-title">Accountability Partners</h2>

      <div className="card">
        <h3>Find a friend</h3>
        <div className="search-row">
          <input type="text" placeholder="Search by username…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchUser()} />
          <button className="btn-primary" onClick={searchUser} disabled={searching}>
            <Search size={16} /> Search
          </button>
        </div>
        {msg && <p className="msg-success">{msg}</p>}
        {searchResult === 'not_found' && <p className="msg-error">No user found with that username.</p>}
        {searchResult && searchResult !== 'not_found' && (
          <div className="search-result">
            <div className="user-chip">
              <div className="avatar">{searchResult.username[0].toUpperCase()}</div>
              <div>
                <strong>@{searchResult.username}</strong>
                <span className="score-badge">{searchResult.score} pts</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => sendFriendRequest(searchResult.id)}>
              <UserPlus size={16} /> Add Friend
            </button>
          </div>
        )}
      </div>

      {friends.length > 0 && (
        <div className="card">
          <h3>Your Partners ({friends.length})</h3>
          <div className="friends-list">
            {friends.map(f => (
              <div key={f.id} className="friend-row">
                <div className="avatar">{f.username[0].toUpperCase()}</div>
                <div>
                  <strong>@{f.username}</strong>
                  <span className="score-badge">{f.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {friendGoals.length > 0 && (
        <div>
          <h3 className="section-title">Friends' Active Goals</h3>
          <div className="goals-grid">
            {friendGoals.filter(g => !g.completed).map(g => (
              <GoalCard
                key={g.id}
                goal={g}
                isFriendGoal={true}
                currentUserId={user.id}
                onNudge={setNudgeGoal}
                onComplete={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && (
        <div className="empty-state">
          <UserPlus size={40} />
          <p>No accountability partners yet.</p>
          <p>Search for friends by username above to get started.</p>
        </div>
      )}

      {nudgeGoal && (
        <NudgeModal
          goal={nudgeGoal}
          onClose={() => setNudgeGoal(null)}
          onSend={sendNudge}
        />
      )}
    </div>
  )
}
