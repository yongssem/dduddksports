import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useClass } from '../../hooks/useClass'
import ClassSetup from './ClassSetup'
import RecordMonitor from './RecordMonitor'
import Modal from '../common/Modal'
import Footer from '../common/Footer'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { classes, createClass, refresh } = useClass(user?.id)
  const [selectedClass, setSelectedClass] = useState(null)
  const [tab, setTab] = useState('setup')
  const [showCreate, setShowCreate] = useState(false)
  const [newClass, setNewClass] = useState({ schoolName: '', grade: '', classNumber: '' })

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0])
    }
  }, [classes, selectedClass])

  function handleCreateClass() {
    if (!newClass.schoolName.trim() || !newClass.grade || !newClass.classNumber) return
    const created = createClass(newClass.schoolName.trim(), newClass.grade, newClass.classNumber)
    setSelectedClass(created)
    setNewClass({ schoolName: '', grade: '', classNumber: '' })
    setShowCreate(false)
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-dvh bg-bg">
      {/* Header */}
      <div className="glass sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="font-black text-navy font-display">뚝딱체력</span>
            <span className="text-navy/35 text-sm font-display">| {user.name} 선생님</span>
          </div>
          <button onClick={handleLogout} className="text-navy/35 text-sm touch-target px-2 hover:text-navy/60 transition-colors font-display font-medium">
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Class selector */}
        {classes.length > 0 ? (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2.5 rounded-xl text-sm whitespace-nowrap touch-target transition-all font-display font-bold ${
                  selectedClass?.id === cls.id ? 'bg-navy text-white shadow-md' : 'pill-inactive'
                }`}
              >
                {cls.grade}-{cls.classNumber}
              </button>
            ))}
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold pill-inactive text-orange touch-target font-display"
            >
              + 학급
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-black text-navy mb-2 font-display">첫 학급을 만들어보세요!</h2>
            <p className="text-navy/45 mb-6">학급을 만들고 학생들을 초대하세요.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange to-orange-light text-white rounded-2xl font-black text-lg shadow-lg shadow-orange/25 touch-target font-display"
            >
              학급 만들기
            </button>
          </div>
        )}

        {/* Tabs */}
        {selectedClass && (
          <>
            <div className="flex gap-2 mb-6">
              {[
                { id: 'setup', label: '학급 관리', icon: '⚙️' },
                { id: 'records', label: '기록 현황', icon: '📊' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm touch-target transition-all font-display font-bold ${
                    tab === t.id ? 'bg-gradient-to-r from-mint to-mint-light text-white shadow-md shadow-mint/20' : 'pill-inactive'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {tab === 'setup' && <ClassSetup classData={selectedClass} onRefresh={refresh} />}
            {tab === 'records' && <RecordMonitor classId={selectedClass.id} />}
          </>
        )}
      </div>

      <Footer />

      {/* Create class modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="학급 만들기"
        confirmText="만들기"
        onConfirm={handleCreateClass}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-navy/50 mb-1.5 font-display font-bold">학교명</label>
            <input
              type="text"
              value={newClass.schoolName}
              onChange={e => setNewClass(v => ({ ...v, schoolName: e.target.value }))}
              placeholder="예: 한빛초등학교"
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-orange focus:outline-none touch-target transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-navy/50 mb-1.5 font-display font-bold">학년</label>
              <select
                value={newClass.grade}
                onChange={e => setNewClass(v => ({ ...v, grade: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-orange focus:outline-none touch-target transition-colors"
              >
                <option value="">선택</option>
                {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}학년</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy/50 mb-1.5 font-display font-bold">반</label>
              <select
                value={newClass.classNumber}
                onChange={e => setNewClass(v => ({ ...v, classNumber: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-orange focus:outline-none touch-target transition-colors"
              >
                <option value="">선택</option>
                {[1,2,3,4,5,6,7,8,9,10].map(c => <option key={c} value={c}>{c}반</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
