import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Footer from '../common/Footer'

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
      <div className="glass sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/teacher/dashboard')} className="text-2xl text-navy/40 touch-target hover:text-navy/60 transition-colors">←</button>
          <h1 className="font-black text-navy text-lg font-display">설정</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="card-elevated p-5">
          <h3 className="font-bold text-navy/40 text-sm mb-3 font-display">계정 정보</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange/15 to-orange/5 rounded-2xl flex items-center justify-center text-xl">👨‍🏫</div>
            <div>
              <div className="font-black text-navy font-display">{user.name} 선생님</div>
              <div className="text-sm text-navy/35">교사 계정</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 card-elevated text-red-400 font-bold touch-target font-display hover:text-red-500 transition-colors"
        >
          로그아웃
        </button>

        <Footer />
      </div>
    </div>
  )
}
