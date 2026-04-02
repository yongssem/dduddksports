import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useClass, getStudents } from '../../hooks/useClass'
import Footer from '../common/Footer'

export default function JoinClass() {
  const [step, setStep] = useState('code') // 'code' | 'select' | 'pin'
  const [inviteCode, setInviteCode] = useState('')
  const [foundClass, setFoundClass] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { studentJoin } = useAuth()
  const { findClassByInviteCode } = useClass()

  async function handleCodeSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cls = await findClassByInviteCode(inviteCode.trim())
      if (!cls) {
        setError('올바른 초대코드를 입력해주세요.')
        return
      }
      setFoundClass(cls)
      setStudents(await getStudents(cls.id))
      setStep('select')
    } finally {
      setLoading(false)
    }
  }

  function handleStudentSelect(student) {
    setSelectedStudent(student)
    if (student.pin) {
      setStep('pin')
    } else {
      completeJoin(student)
    }
  }

  function handlePinSubmit(e) {
    e.preventDefault()
    if (pin !== selectedStudent.pin) {
      setError('PIN이 일치하지 않습니다.')
      return
    }
    completeJoin(selectedStudent)
  }

  function completeJoin(student) {
    const className = `${foundClass.schoolName} ${foundClass.grade}학년 ${foundClass.classNumber}반`
    studentJoin(foundClass.id, className, student)
    navigate('/student/home')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-bg">
      <button onClick={() => step === 'code' ? navigate('/') : setStep('code')} className="absolute top-4 left-4 text-navy/40 text-2xl touch-target hover:text-navy/60 transition-colors">
        ←
      </button>

      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🙋</div>
        <h1 className="text-2xl font-black text-navy font-display">
          {step === 'code' && '초대코드 입력'}
          {step === 'select' && '내 이름 선택'}
          {step === 'pin' && 'PIN 입력'}
        </h1>
      </div>

      <div className="w-full max-w-sm">
        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="초대코드 입력"
              maxLength={6}
              className="w-full px-4 py-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-mint focus:outline-none text-2xl text-center font-mono tracking-widest touch-target shadow-sm transition-colors font-display"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-mint to-mint-light text-white rounded-2xl font-black text-lg shadow-lg shadow-mint/25 touch-target font-display disabled:opacity-50"
            >
              {loading ? '확인 중...' : '입장하기'}
            </button>
          </form>
        )}

        {step === 'select' && (
          <div>
            <div className="card-elevated p-4 mb-5 text-center">
              <p className="text-navy/40 text-sm font-display font-medium">학급</p>
              <p className="font-black text-navy font-display mt-1">
                {foundClass.schoolName} {foundClass.grade}학년 {foundClass.classNumber}반
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {students.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className="p-4 card-elevated text-center touch-target hover:border-mint border-2 border-transparent transition-all rounded-2xl"
                >
                  <div className="text-lg font-medium text-navy/50 font-display">{student.number}번</div>
                  <div className="text-navy font-black font-display">{student.name}</div>
                </button>
              ))}
            </div>
            {students.length === 0 && (
              <p className="text-center text-navy/35 py-8 font-display">아직 등록된 학생이 없습니다.</p>
            )}
          </div>
        )}

        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <p className="text-center text-navy/50 font-display">{selectedStudent.name} 학생의 PIN을 입력하세요</p>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="4자리 PIN"
              maxLength={4}
              inputMode="numeric"
              className="w-full px-4 py-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-mint focus:outline-none text-2xl text-center tracking-widest touch-target shadow-sm transition-colors"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-mint to-mint-light text-white rounded-2xl font-black text-lg shadow-lg shadow-mint/25 touch-target font-display">
              확인
            </button>
          </form>
        )}
      </div>

      <div className="mt-auto pt-8">
        <Footer />
      </div>
    </div>
  )
}
