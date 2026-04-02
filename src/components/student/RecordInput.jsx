import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getEvents } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'
import { EVENT_ICONS } from '../../utils/constants'
import Modal from '../common/Modal'
import ConfettiModal from '../common/ConfettiModal'
import NavBar from '../common/NavBar'

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
  const { records, addRecord, getStudentEventRecords } = useRecords(user?.classId)

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/')
      return
    }
    setEvents(getEvents(user.classId).filter(e => e.isActive))
  }, [user, navigate])

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const recentRecords = selectedEvent
    ? getStudentEventRecords(user.id, selectedEvent.id).slice(-3).reverse()
    : []

  function handleSubmit() {
    if (!selectedEvent || !value) return
    setShowConfirm(true)
  }

  function confirmRecord() {
    setShowConfirm(false)
    const record = addRecord(user.id, user.name, selectedEvent.id, selectedEvent.name, value, memo)
    setSavedRecord({ value: Number(value), unit: selectedEvent.unit, eventName: selectedEvent.name })
    setValue('')
    setMemo('')
    setShowSuccess(true)
  }

  const isDecimal = selectedEvent && ['초', 'cm', 'kg', 'm'].includes(selectedEvent.unit)

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-navy text-lg text-center">기록 입력 ✏️</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Event selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-navy/60 mb-2">종목 선택</label>
          <div className="grid grid-cols-2 gap-2">
            {events.map(event => {
              const icon = EVENT_ICONS[event.name] || '🎯'
              const isSelected = selectedEventId === event.id
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className={`p-3 rounded-xl text-left transition-all touch-target ${
                    isSelected
                      ? 'bg-orange text-white shadow-md scale-[1.02]'
                      : 'bg-white text-navy shadow-sm'
                  }`}
                >
                  <div className="text-lg">{icon}</div>
                  <div className="font-medium text-sm mt-1">{event.name}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-navy/40'}`}>
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
              <label className="block text-sm font-medium text-navy/60 mb-2">기록값</label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="0"
                  inputMode={isDecimal ? 'decimal' : 'numeric'}
                  step={isDecimal ? '0.1' : '1'}
                  min="0"
                  className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-gray-200 focus:border-orange focus:outline-none text-3xl font-bold text-center touch-target"
                  autoFocus
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-navy/40 font-medium">
                  {selectedEvent.unit}
                </span>
              </div>
              <div className="text-center mt-2 text-sm text-navy/40">
                목표: {selectedEvent.targetValue}{selectedEvent.unit}
                {selectedEvent.direction === 'high' ? ' (높을수록 좋음)' : ' (낮을수록 좋음)'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy/60 mb-2">메모 (선택)</label>
              <input
                type="text"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="오늘 컨디션이 좋았다!"
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-orange focus:outline-none touch-target"
              />
            </div>

            {/* Recent records */}
            {recentRecords.length > 0 && (
              <div>
                <p className="text-sm text-navy/50 mb-2">최근 기록</p>
                <div className="flex gap-2">
                  {recentRecords.map(r => (
                    <div key={r.id} className="bg-white rounded-lg px-3 py-2 shadow-sm text-sm">
                      <div className="font-medium text-navy">{r.value}{selectedEvent.unit}</div>
                      <div className="text-navy/30 text-xs">
                        {new Date(r.recordedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!value}
              className="w-full py-4 bg-orange text-white rounded-2xl font-bold text-lg shadow-lg disabled:opacity-40 touch-target mt-4"
            >
              기록하기 💪
            </button>
          </div>
        )}
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
          <div className="text-lg text-navy/60 mb-2">{selectedEvent?.name}</div>
          <div className="text-4xl font-black text-orange">
            {value}<span className="text-xl text-navy/40 ml-1">{selectedEvent?.unit}</span>
          </div>
        </div>
      </Modal>

      {/* Success confetti */}
      <ConfettiModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        value={savedRecord?.value}
        unit={savedRecord?.unit}
        eventName={savedRecord?.eventName}
      />

      <NavBar />
    </div>
  )
}
