import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import GoalCard from '../components/GoalCard'
import AddGoalModal from '../components/AddGoalModal'
import EditGoalModal from '../components/EditGoalModal'
import CompleteGoalModal from '../components/CompleteGoalModal'
import NudgeModal from '../components/NudgeModal'
import { Plus, Target, UserCheck } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [goals, setGoals] = useState([])
  const [taggedGoals, setTaggedGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [completeGoal, setCompleteGoal] = useState(null)
  const [nudgeGoal, setNudgeGoal] = useState(null)
  const [filter, setFilter] = useState('active')

  useEffect(() => { if (user) { fetchGoals(); fetchTaggedGoals() } }, [user])

  async function fetchGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true })
    setGoals(data || [])
    setLoading(false)
  }

  async function fetchTaggedGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*, profiles(username)')
      .eq('tagged_friend_id', user.id)
      .eq('completed', false)
      .order('deadline', { ascending: true })
    setTaggedGoals(data || [])
  }

  async function addGoal(goalData) {
    const { error } = await supabase.from('goals').insert({ ...goalData, user_id: user.id })
    if (!error) { fetchGoals(); fetchTaggedGoals() }
  }

  async function saveGoal(updates) {
    const { id, ...fields } = updates
    const { error } = await supabase.from('goals').update(fields).eq('id', id)
    if (!error) { fetchGoals(); fetchTaggedGoals() }
  }

  async function handleComplete(goal, gift) {
    const updateData = { completed: true, completed_at: new Date().toISOString() }
    if (gift) updateData.gift = gift
    const { error } = await supabase.from('goals').update(updateData).eq('id', goal.id)
    if (!error) {
      await supabase.from('profiles').update({ score: (profile?.score || 0) + goal.points }).eq('id', user.id)
      await refreshProfile()
      fetchGoals()
      fetchTaggedGoals()
    }
  }

  async function deleteGoal(id) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(g => g.filter(x => x.id !== id))
  }

  async function sendNudge(goalId, message) {
    await supabase.from('nudges').insert({ goal_id: goalId, sender_id: user.id, message })
  }

  const filtered = goals.filter(g =>
    filter === 'active' ? !g.completed :
    filter === 'completed' ? g.completed : true
  )

  const activeCount = goals.filter(g => !g.completed).length
  const completedCount = goals.filter(g => g.completed).length
  const overdueCount = goals.filter(g => !g.completed && new Date(g.deadline) < new Date()).length

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">My Goals</h2>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-card success">
          <span className="stat-num">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card danger">
          <span className="stat-num">{overdueCount}</span>
          <span className="stat-label">Overdue</span>
        </div>
        <div className="stat-card gold">
          <span className="stat-num">{profile?.score || 0}</span>
          <span className="stat-label">Total Score</span>
        </div>
      </div>

      {taggedGoals.length > 0 && (
        <div className="tagged-section">
          <h3 className="section-title">
            <UserCheck size={16} /> You're Tagged In
          </h3>
          <div className="goals-grid">
            {taggedGoals.map(g => (
              <GoalCard
                key={g.id}
                goal={g}
                currentUserId={user.id}
                isFriendGoal={true}
                onNudge={setNudgeGoal}
                onComplete={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      <div className="filter-tabs">
        {['active','completed','all'].map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="tab-count">{
              f === 'active' ? activeCount :
              f === 'completed' ? completedCount :
              goals.length
            }</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading goals…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Target size={40} />
          <p>{filter === 'active' ? 'No active goals.' : filter === 'completed' ? 'No completed goals yet.' : 'No goals yet.'}</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add your first goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {filtered.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              currentUserId={user.id}
              onComplete={(goal) => setCompleteGoal(goal)}
              onDelete={deleteGoal}
              onEdit={(goal) => setEditGoal(goal)}
              isFriendGoal={false}
              onNudge={() => {}}
            />
          ))}
        </div>
      )}

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onAdd={addGoal} currentUserId={user.id} />}
      {editGoal && <EditGoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={saveGoal} currentUserId={user.id} />}
      {completeGoal && (
        <CompleteGoalModal goal={completeGoal} onClose={() => setCompleteGoal(null)} onConfirm={handleComplete} />
      )}
      {nudgeGoal && (
        <NudgeModal goal={nudgeGoal} onClose={() => setNudgeGoal(null)} onSend={sendNudge} />
      )}
    </div>
  )
}
