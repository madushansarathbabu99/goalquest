import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import GoalCard from '../components/GoalCard'
import NudgeModal from '../components/NudgeModal'
import { UserCheck, Inbox } from 'lucide-react'

export default function FeedPage() {
  const { user } = useAuth()
  const [taggedGoals, setTaggedGoals] = useState([])
  const [friendGoals, setFriendGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [nudgeGoal, setNudgeGoal] = useState(null)
  const [tab, setTab] = useState('tagged')

  useEffect(() => {
    if (user) {
      fetchTaggedGoals()
      fetchFriendGoals()
    }
  }, [user])

  async function fetchTaggedGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*, owner:user_id(username)')
      .eq('tagged_friend_id', user.id)
      .order('deadline', { ascending: true })
    console.log('Tagged goals query:', { userId: user.id, data, error })
    setTaggedGoals(data || [])
    setLoading(false)
  }

  async function fetchFriendGoals() {
    // Get accepted friends
    const { data: frData } = await supabase
      .from('friendships')
      .select('*, requester:requester_id(id), addressee:addressee_id(id)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted')

    const friendIds = (frData || []).map(f =>
      f.requester_id === user.id ? f.addressee.id : f.requester.id
    )

    if (friendIds.length > 0) {
      const { data: goals } = await supabase
        .from('goals')
        .select('*, profiles(username)')
        .in('user_id', friendIds)
        .eq('completed', false)
        .order('deadline', { ascending: true })
      setFriendGoals(goals || [])
    } else {
      setFriendGoals([])
    }
  }

  async function sendNudge(goalId, message) {
    await supabase.from('nudges').insert({ goal_id: goalId, sender_id: user.id, message })
  }

  const activeTagged = taggedGoals.filter(g => !g.completed)
  const completedTagged = taggedGoals.filter(g => g.completed)

  return (
    <div className="page">
      <h2 className="page-title">Feed</h2>

      <div className="feed-tabs">
        <button className={tab === 'tagged' ? 'active' : ''} onClick={() => setTab('tagged')}>
          <UserCheck size={14} />
          Tagged In
          {activeTagged.length > 0 && <span className="feed-tab-count">{activeTagged.length}</span>}
        </button>
        <button className={tab === 'friends' ? 'active' : ''} onClick={() => setTab('friends')}>
          <Inbox size={14} />
          Friends' Goals
          {friendGoals.length > 0 && <span className="feed-tab-count">{friendGoals.length}</span>}
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading feed…</div>
      ) : tab === 'tagged' ? (
        <>
          {activeTagged.length > 0 && (
            <div className="feed-section">
              <h3 className="feed-section-title">Active — You're Keeping Them Accountable</h3>
              <div className="feed-scroll-row">
                {activeTagged.map(g => (
                  <div key={g.id} className="feed-scroll-card">
                    <GoalCard
                      goal={g}
                      currentUserId={user.id}
                      isFriendGoal={true}
                      onNudge={setNudgeGoal}
                      onComplete={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTagged.length > 0 && (
            <div className="feed-section">
              <h3 className="feed-section-title">Completed</h3>
              <div className="feed-scroll-row">
                {completedTagged.map(g => (
                  <div key={g.id} className="feed-scroll-card">
                    <GoalCard
                      goal={g}
                      currentUserId={user.id}
                      isFriendGoal={true}
                      onNudge={() => {}}
                      onComplete={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {taggedGoals.length === 0 && (
            <div className="empty-state">
              <UserCheck size={40} />
              <p>No one has tagged you yet.</p>
              <p>When a friend tags you as their accountability partner, their goals will show up here.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {friendGoals.length > 0 ? (
            <div className="feed-section">
              <h3 className="feed-section-title">What Your Friends Are Working On</h3>
              <div className="feed-scroll-row">
                {friendGoals.map(g => (
                  <div key={g.id} className="feed-scroll-card">
                    <GoalCard
                      goal={g}
                      currentUserId={user.id}
                      isFriendGoal={true}
                      onNudge={setNudgeGoal}
                      onComplete={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Inbox size={40} />
              <p>No friend goals to show.</p>
              <p>Add friends from the Friends tab to see their goals here.</p>
            </div>
          )}
        </>
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
