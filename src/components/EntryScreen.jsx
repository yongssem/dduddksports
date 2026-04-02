import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect } from 'react'
import Footer from './common/Footer'
import GradeRunnerBackground from './common/GradeRunnerBackground'

const features = [
  { icon: '📊', text: '기록 추적' },
  { icon: '📈', text: '성장 그래프' },
  { icon: '🏅', text: '뱃지 수집' },
  { icon: '🏆', text: '리더보드' },
]

export default function EntryScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'teacher') navigate('/teacher/dashboard')
    if (user?.role === 'student') navigate('/student/home')
  }, [user, navigate])

  return (
    <div className="relative w-screen min-h-dvh overflow-hidden">
      {/* Interactive canvas background */}
      <GradeRunnerBackground />

      {/* UI overlay — pointer-events-none so canvas drag works */}
      <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center p-6 pointer-events-none bg-black/20 backdrop-blur-xl">
        {/* Hero section */}
        <div className="text-center mb-8 entry-fade-in">
          <div className="relative inline-block">
            <div className="text-[5.5rem] leading-none entry-float drop-shadow-lg">🏆</div>
            <div className="absolute -top-1 -right-3 text-2xl entry-sparkle">✨</div>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mt-2 drop-shadow-lg font-display">
            뚝딱<span className="text-gradient-orange" style={{WebkitTextFillColor: 'unset', color: '#FFB088'}}>체력</span>
          </h1>
          <p className="text-white/45 mt-3 text-sm font-medium tracking-widest uppercase">DDuk-DDak Fitness · 건강체력교실</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 entry-fade-in-delay">
          {features.map((f, i) => (
            <div
              key={f.text}
              className="flex items-center gap-1.5 glass-dark px-4 py-2.5 rounded-full text-sm font-medium text-white/80"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              <span className="text-base">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-sm space-y-3 entry-fade-in-delay-2 pointer-events-auto">
          <button
            onClick={() => navigate('/teacher/auth')}
            className="group w-full p-4 bg-gradient-to-r from-orange to-orange-light text-white rounded-2xl shadow-lg shadow-orange/25 active:scale-[0.97] transition-all duration-200 touch-target flex items-center gap-3 hover:shadow-xl hover:shadow-orange/35"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shrink-0 group-active:bg-white/30 transition-colors">
              👨‍🏫
            </div>
            <div className="text-left">
              <div className="text-base font-semibold font-display">선생님으로 시작</div>
              <div className="text-white/55 text-xs">학급 만들고 관리하기</div>
            </div>
            <div className="ml-auto text-white/30 text-xl">→</div>
          </button>

          <button
            onClick={() => navigate('/student/join')}
            className="group w-full p-4 bg-gradient-to-r from-mint to-mint-light text-white rounded-2xl shadow-lg shadow-mint/25 active:scale-[0.97] transition-all duration-200 touch-target flex items-center gap-3 hover:shadow-xl hover:shadow-mint/35"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shrink-0 group-active:bg-white/30 transition-colors">
              🙋
            </div>
            <div className="text-left">
              <div className="text-base font-semibold font-display">학생으로 참여</div>
              <div className="text-white/55 text-xs">초대코드로 입장하기</div>
            </div>
            <div className="ml-auto text-white/30 text-xl">→</div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 pointer-events-auto">
          <Footer variant="dark" />
        </div>
      </div>
    </div>
  )
}
