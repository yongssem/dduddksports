import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getEvents, useClass } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'
import { EVENT_ICONS } from '../../utils/constants'
import { checkBadges } from '../../utils/badgeChecker'
import Modal from '../common/Modal'
import ConfettiModal from '../common/ConfettiModal'
import NavBar from '../common/NavBar'
import Footer from '../common/Footer'

export default function RecordInput() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(searchParams.get('eventId') || '')
  const [value, setValue] = useState('')
  const [memo, setMemo] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedRecord, setSavedRecord] = useState(null)
  const [newBadges, setNewBadges] = useState([])
  const [saving, setSaving] = useState(false)
  const { records, addRecord, getStudentEventRecords } = useRecords(user?.classId)
  const { getClassSettings } = useClass()
  const classSettings = user?.classId ? getClassSettings(user.classId) : {}
  const inputDisabled = !classSettings.studentInputEnabled

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/')
      return
    }
    async function load() {
      const allEvents = await getEvents(user.classId)
      setEvents(allEvents.filter(e => e.isActive))
    }
    load()
  }, [user, navigate])

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const recentRecords = selectedEvent
    ? getStudentEventRecords(user.id, selectedEvent.id).slice(-3).reverse()
    : []

  function handleSubmit() {
    if (!selectedEvent || !value) return
    setShowConfirm(true)
  }

  async function confirmRecord() {
    setShowConfirm(false)
    setSaving(true)
    try {
      await addRecord(user.id, user.name, selectedEvent.id, selectedEvent.name, value, memo)
      setSavedRecord({ value: Number(value), unit: selectedEvent.unit, eventName: selectedEvent.name })

      // Run badge checker with fresh records
      const badges = await checkBadges(user.classId, user.id, records)
      setNewBadges(badges)

      setValue('')
      setMemo('')
      setShowSuccess(true)
    } finally {
      setSaving(false)
    }
  }

  const isDecimal = selectedEvent && ['초', 'cm', 'kg', 'm'].includes(selectedEvent.unit)

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-navy text-lg text-center font-display">기록 입력 ✏️</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {inputDisabled && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-lg font-bold text-navy mb-2 font-display">기록 입력이 비활성화되었어요</h2>
            <p className="text-navy/50">선생님이 직접 기록을 입력하고 있어요.</p>
            <button
              onClick={() => navigate('/student/home')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-mint to-mint-light text-white rounded-2xl font-bold touch-target font-display shadow-lg shadow-mint/20"
            >
              홈으로 돌아가기
            </button>
          </div>
        )}

        {!inputDisabled && (<>
        {/* Event selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-navy/50 mb-2 font-display">종목 선택</label>
          <div className="grid grid-cols-2 gap-2.5">
            {events.map(event => {
              const icon = EVENT_ICONS[event.name] || '🎯'
              const isSelected = selectedEventId === event.id
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-4 rounded-2xl text-left transition-all touch-target ${
                    isSelected
                      ? 'bg-gradient-to-br from-orange to-orange-light text-white shadow-lg shadow-orange/25 scale-[1.02]'
                      : 'card-elevated text-navy'
                  }`}
                >
                  <div className="text-xl">{icon}</div>
                  <div className="font-bold text-sm mt-1.5 font-display">{event.name}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/65' : 'text-navy/35'}`}>
                    목표 {event.targetValue}{event.unit}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Value input */}
        {selectedEvent && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-navy/50 mb-2 font-display">기록값</label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="0"
                  inputMode={isDecimal ? 'decimal' : 'numeric'}
                  step={isDecimal ? '0.1' : '1'}
                  min="0"
                  className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-orange focus:outline-none text-3xl font-black text-center touch-target font-display shadow-sm transition-colors"
                  autoFocus
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-navy/35 font-bold font-display">
                  {selectedEvent.unit}
                </span>
              </div>
              <div className="text-center mt-2 text-sm text-navy/35">
                목표: {selectedEvent.targetValue}{selectedEvent.unit}
                {selectedEvent.direction === 'high' ? ' (높을수록 좋음)' : ' (낮을수록 좋음)'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-navy/50 mb-2 font-display">메모 (선택)</label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="오늘 컨디션이 좋았다!"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-100 focus:border-orange focus:outline-none touch-target shadow-sm transition-colors"
              />
            </div>

            {/* Recent records */}
            {recentRecords.length > 0 && (
              <div>
                <p className="text-sm text-navy/45 mb-2 font-display font-medium">최근 기록</p>
                <div className="flex gap-2">
                  {recentRecords.map(r => (
                    <div key={r.id} className="card-elevated rounded-xl px-3.5 py-2.5 text-sm">
                      <div className="font-bold text-navy font-display">{r.value}{selectedEvent.unit}</div>
                      <div className="text-navy/30 text-xs mt-0.5">
                        {new Date(r.recordedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!value || saving}
              className="w-full py-4 bg-gradient-to-r from-orange to-orange-light text-white rounded-2xl font-black text-lg shadow-lg shadow-orange/25 disabled:opacity-40 touch-target mt-4 font-display transition-shadow hover:shadow-xl hover:shadow-orange/30"
            >
              {saving ? '저장 중...' : '기록하기 💪'}
            </button>
          </div>
        )}
      </>)}
      </div>

      {/* Confirm modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="기록을 저장할까요?"
        confirmText="저장"
        onConfirm={confirmRecord}
      >
        <div className="text-center py-4">
          <div className="text-lg text-navy/50 mb-2 font-display">{selectedEvent?.name}</div>
          <div className="text-4xl font-black text-gradient-orange font-display">
            {value}<span className="text-xl text-navy/35 ml-1" style={{WebkitTextFillColor: 'unset'}}>{selectedEvent?.unit}</span>
          </div>
        </div>
      </Modal>

      {/* Success confetti */}
      <ConfettiModal
        isOpen={showSuccess}
        onClose={() => { setShowSuccess(false); setNewBadges([]) }}
        value={savedRecord?.value}
        unit={savedRecord?.unit}
        eventName={savedRecord?.eventName}
        badges={newBadges}
      />

      <Footer />
      <NavBar />
    </div>
  )
}
