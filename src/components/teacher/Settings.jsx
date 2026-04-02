import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'teacher') navigate('/')
  }, [user, navigate])

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-dvh bg-bg">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/teacher/dashboard')} className="text-2xl text-navy/50 touch-target">←</button>
          <h1 className="font-bold text-navy text-lg">설정</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-medium text-navy/50 text-sm mb-3">계정 정보</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center text-xl">👨‍🏫</div>
            <div>
              <div className="font-bold text-navy">{user.name} 선생님</div>
              <div className="text-sm text-navy/40">교사 계정</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white rounded-xl shadow-sm text-red-500 font-medium touch-target"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
