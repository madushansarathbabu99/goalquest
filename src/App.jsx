import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import FriendsPage from './pages/FriendsPage'
import HistoryPage from './pages/HistoryPage'
import NotificationsPanel from './components/NotificationsPanel'
import { getCurrentQuote } from './lib/quotes'
import { Target, Users, Trophy, LogOut, Quote } from 'lucide-react'

function Layout() {
  const { user, profile, signOut, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [quote, setQuote] = useState(getCurrentQuote())

  // Refresh quote every 6 hours
  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(getCurrentQuote())
    }, 6 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="splash">
      <span className="logo-icon large">◎</span>
      <p>Loading GoalQuest…</p>
    </div>
  )

  if (!user) return <AuthPage />

  const navItems = [
    { id: 'dashboard', label: 'Goals', icon: Target },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'history', label: 'History', icon: Trophy },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo-icon">◎</span>
          <span className="logo-text">GoalQuest</span>
        </div>
        <div className="header-quote">
          <Quote size={12} />
          <span>"{quote.text}"</span>
          <span className="quote-author">— {quote.author}</span>
        </div>
        <div className="header-right">
          <div className="score-pill">
            <Trophy size={14} />
            {profile?.score || 0} pts
          </div>
          <span className="header-user">@{profile?.username}</span>
          <NotificationsPanel />
          <button className="btn-icon" onClick={signOut} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'friends' && <FriendsPage />}
        {page === 'history' && <HistoryPage />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  )
}
