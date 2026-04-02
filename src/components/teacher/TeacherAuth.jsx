import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

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
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-navy/50 text-2xl touch-target">
        ←
      </button>

      <div className="text-center mb-8">
        <div className="text-5xl mb-2">👨‍🏫</div>
        <h1 className="text-2xl font-bold text-navy">선생님 {mode === 'login' ? '로그인' : '가입'}</h1>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors touch-target ${mode === 'login' ? 'bg-orange text-white' : 'text-navy/50'}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('signup'); setError('') }}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors touch-target ${mode === 'signup' ? 'bg-orange text-white' : 'text-navy/50'}`}
          >
            가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="선생님 이름"
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-orange focus:outline-none text-lg touch-target"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-orange focus:outline-none text-lg touch-target"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-navy/70 mb-1">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 다시 입력"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-orange focus:outline-none text-lg touch-target"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 touch-target"
          >
            {loading ? '처리 중...' : (mode === 'login' ? '로그인' : '가입하기')}
          </button>
        </form>
      </div>
    </div>
  )
}
