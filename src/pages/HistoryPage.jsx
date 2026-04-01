import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import { Trophy, CheckCircle } from 'lucide-react'

export default function HistoryPage() {
  const { user, profile } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchCompleted() }, [user])

  async function fetchCompleted() {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  const totalPts = goals.reduce((s, g) => s + g.points, 0)

  return (
    <div className="page">
      <h2 className="page-title">Completed Goals</h2>

      <div className="history-header">
        <div className="trophy-banner">
          <Trophy size={32} />
          <div>
            <p className="trophy-score">{profile?.score || 0} total points</p>
            <p className="trophy-sub">{goals.length} goals completed · {totalPts} pts earned here</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={40} />
          <p>No completed goals yet.</p>
          <p>Complete your first goal to see it here!</p>
        </div>
      ) : (
        <div className="history-list">
          {goals.map(g => (
            <div key={g.id} className="history-item">
              <div className="history-check"><CheckCircle size={20} /></div>
              <div className="history-info">
                <h3>{g.title}</h3>
                {g.description && <p>{g.description}</p>}
                <span className="history-date">
                  Completed {g.completed_at ? format(new Date(g.completed_at), 'MMM d, yyyy · h:mm a') : '—'}
                </span>
              </div>
              <div className="history-pts">+{g.points}pts</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
