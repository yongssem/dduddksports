import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Footer from '../common/Footer'

export default function TeacherAuth() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { teacherSignup, teacherLogin } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('이름을 입력해주세요.')
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    if (mode === 'signup' && password !== confirmPassword) return setError('비밀번호가 일치하지 않습니다.')

    setLoading(true)
    try {
      if (mode === 'signup') {
        await teacherSignup(name.trim(), password)
      } else {
        await teacherLogin(name.trim(), password)
      }
      navigate('/teacher/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-bg">
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-navy/40 text-2xl touch-target hover:text-navy/60 transition-colors">
        ←
      </button>

      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👨‍🏫</div>
        <h1 className="text-2xl font-black text-navy font-display">선생님 {mode === 'login' ? '로그인' : '가입'}</h1>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex card-elevated p-1.5 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all touch-target font-display ${mode === 'login' ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-md' : 'text-navy/40'}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('signup'); setError('') }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all touch-target font-display ${mode === 'signup' ? 'bg-gradient-to-r from-orange to-orange-light text-white shadow-md' : 'text-navy/40'}`}
          >
            가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-navy/50 mb-1.5 font-display">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="선생님 이름"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-orange focus:outline-none text-lg touch-target shadow-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-navy/50 mb-1.5 font-display">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-orange focus:outline-none text-lg touch-target shadow-sm transition-colors"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-navy/50 mb-1.5 font-display">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-orange focus:outline-none text-lg touch-target shadow-sm transition-colors"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange to-orange-light text-white rounded-2xl font-black text-lg shadow-lg shadow-orange/25 disabled:opacity-50 touch-target font-display transition-shadow hover:shadow-xl"
          >
            {loading ? '처리 중...' : (mode === 'login' ? '로그인' : '가입하기')}
          </button>
        </form>
      </div>

      <div className="mt-auto pt-8">
        <Footer />
      </div>
    </div>
  )
}
