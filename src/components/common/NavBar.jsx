import { useNavigate, useLocation } from 'react-router-dom'

const studentTabs = [
  { path: '/student/home', label: '홈', icon: '🏠' },
  { path: '/student/record', label: '기록', icon: '✏️' },
  { path: '/student/growth', label: '성장', icon: '📈' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-10 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {studentTabs.map(tab => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 touch-target transition-colors ${
                isActive ? 'text-orange' : 'text-navy/40'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium mt-0.5">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
