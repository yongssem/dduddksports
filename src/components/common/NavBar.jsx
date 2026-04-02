import { useNavigate, useLocation } from 'react-router-dom'

const studentTabs = [
  { path: '/student/home', label: '홈', icon: '🏠' },
  { path: '/student/record', label: '기록', icon: '✏️' },
  { path: '/student/growth', label: '성장', icon: '📈' },
  { path: '/student/badges', label: '뱃지', icon: '🎖️' },
  { path: '/leaderboard', label: '순위', icon: '🏅' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 nav-modern z-10 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {studentTabs.map(tab => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 touch-target transition-all duration-200 ${
                isActive ? 'text-orange nav-indicator' : 'text-navy/35 hover:text-navy/50'
              }`}
            >
              <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>{tab.icon}</span>
              <span className={`text-[11px] mt-0.5 font-display ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
