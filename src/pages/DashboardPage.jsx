import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import GoalCard from '../components/GoalCard'
import AddGoalModal from '../components/AddGoalModal'
import { Plus, Target } from 'lucide-react'

export default function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('active')

  useEffect(() => { if (user) fetchGoals() }, [user])

  async function fetchGoals() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true })
    setGoals(data || [])
    setLoading(false)
  }

  async function addGoal(goalData) {
    const { error } = await supabase.from('goals').insert({ ...goalData, user_id: user.id })
    if (!error) fetchGoals()
  }

  async function completeGoal(goal) {
    const { error } = await supabase
      .from('goals')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', goal.id)
    if (!error) {
      await supabase
        .from('profiles')
        .update({ score: (profile?.score || 0) + goal.points })
        .eq('id', user.id)
      await refreshProfile()
      fetchGoals()
    }
  }

  async function deleteGoal(id) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(g => g.filter(x => x.id !== id))
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
              onComplete={completeGoal}
              onDelete={deleteGoal}
              isFriendGoal={false}
              onNudge={() => {}}
            />
          ))}
        </div>
      )}

      {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} onAdd={addGoal} />}
    </div>
  )
}
