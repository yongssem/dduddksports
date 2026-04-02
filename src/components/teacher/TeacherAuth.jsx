import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Footer from '../common/Footer'

export default function TeacherAuth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { teacherSignup, teacherLogin, teacherGoogleLogin } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) return setError('이메일을 입력해주세요.')
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    if (mode === 'signup') {
      if (!displayName.trim()) return setError('이름을 입력해주세요.')
      if (password !== confirmPassword) return setError('비밀번호가 일치하지 않습니다.')
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await teacherSignup(email.trim(), password, displayName.trim())
      } else {
        await teacherLogin(email.trim(), password)
      }
      navigate('/teacher/dashboard')
    } catch (err) {
      const code = err.code
      if (code === 'auth/email-already-in-use') setError('이미 가입된 이메일입니다.')
      else if (code === 'auth/invalid-email') setError('유효하지 않은 이메일입니다.')
      else if (code === 'auth/invalid-credential') setError('이메일 또는 비밀번호가 틀립니다.')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await teacherGoogleLogin()
      navigate('/teacher/dashboard')
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return
      console.error('Google login error:', err.code, err.message)
      setError(`Google 로그인 실패: ${err.code || err.message}`)
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
        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-navy flex items-center justify-center gap-3 touch-target shadow-sm hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 mb-5"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Google로 {mode === 'login' ? '로그인' : '시작하기'}
        </button>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-navy/30 font-display">또는 이메일로</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 로그인/가입 탭 */}
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
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-bold text-navy/50 mb-1.5 font-display">이름</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="선생님 이름"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-orange focus:outline-none text-lg touch-target shadow-sm transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-navy/50 mb-1.5 font-display">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teacher@school.com"
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
