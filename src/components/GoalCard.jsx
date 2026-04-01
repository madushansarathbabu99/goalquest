import { useCountdown } from '../hooks/useCountdown'
import { format } from 'date-fns'
import { CheckCircle, Clock, MessageCircle, Trash2 } from 'lucide-react'

function CountdownDisplay({ deadline, completed }) {
  const { days, hours, minutes, seconds, expired } = useCountdown(deadline)
  if (completed) return <span className="badge badge-success">Completed</span>
  if (expired) return <span className="badge badge-danger">Overdue</span>
  return (
    <div className="countdown">
      <div className="cd-block"><span className="cd-num">{days}</span><span className="cd-label">days</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-block"><span className="cd-num">{String(hours).padStart(2,'0')}</span><span className="cd-label">hrs</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-block"><span className="cd-num">{String(minutes).padStart(2,'0')}</span><span className="cd-label">min</span></div>
      <div className="cd-sep">:</div>
      <div className="cd-block"><span className="cd-num">{String(seconds).padStart(2,'0')}</span><span className="cd-label">sec</span></div>
    </div>
  )
}

export default function GoalCard({ goal, onComplete, onDelete, onNudge, isFriendGoal, currentUserId }) {
  const isOwner = goal.user_id === currentUserId
  const urgencyClass = () => {
    if (goal.completed) return 'card-goal completed'
    const days = Math.floor((new Date(goal.deadline) - new Date()) / 86400000)
    if (days < 0) return 'card-goal overdue'
    if (days <= 3) return 'card-goal urgent'
    return 'card-goal'
  }

  return (
    <div className={urgencyClass()}>
      <div className="goal-header">
        <div>
          <h3 className="goal-title">{goal.title}</h3>
          {goal.description && <p className="goal-desc">{goal.description}</p>}
          {isFriendGoal && goal.profiles && (
            <span className="goal-owner">@{goal.profiles.username}</span>
          )}
        </div>
        <div className="goal-points">+{goal.points}pts</div>
      </div>

      <CountdownDisplay deadline={goal.deadline} completed={goal.completed} />

      <div className="goal-footer">
        <span className="goal-date">
          <Clock size={12} />
          {format(new Date(goal.deadline), 'MMM d, yyyy')}
        </span>
        <div className="goal-actions">
          {isOwner && !goal.completed && (
            <button className="btn-icon success" onClick={() => onComplete(goal)} title="Mark complete">
              <CheckCircle size={16} />
            </button>
          )}
          {isFriendGoal && !goal.completed && (
            <button className="btn-icon info" onClick={() => onNudge(goal)} title="Send accountability nudge">
              <MessageCircle size={16} />
            </button>
          )}
          {isOwner && (
            <button className="btn-icon danger" onClick={() => onDelete(goal.id)} title="Delete goal">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
