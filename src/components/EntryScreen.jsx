import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'

export default function EntryScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'teacher') navigate('/teacher/dashboard')
    if (user?.role === 'student') navigate('/student/home')
  }, [user, navigate])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-bg">
      <div className="text-center mb-12">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-4xl font-black text-navy">체력왕</h1>
        <p className="text-navy/50 mt-2 text-sm">건강체력교실 운영 앱</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={() => navigate('/teacher/auth')}
          className="w-full p-6 bg-orange text-white rounded-2xl shadow-lg active:scale-[0.98] transition-transform touch-target"
        >
          <div className="text-3xl mb-2">👨‍🏫</div>
          <div className="text-xl font-bold">선생님으로 시작하기</div>
          <div className="text-white/70 text-sm mt-1">학급 만들고 관리하기</div>
        </button>

        <button
          onClick={() => navigate('/student/join')}
          className="w-full p-6 bg-mint text-white rounded-2xl shadow-lg active:scale-[0.98] transition-transform touch-target"
        >
          <div className="text-3xl mb-2">🙋</div>
          <div className="text-xl font-bold">학생으로 참여하기</div>
          <div className="text-white/70 text-sm mt-1">초대코드로 입장하기</div>
        </button>
      </div>
    </div>
  )
}
