import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getEvents } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'
import { EVENT_ICONS } from '../../utils/constants'
import NavBar from '../common/NavBar'

export default function StudentHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const { records } = useRecords(user?.classId)

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/')
      return
    }
    setEvents(getEvents(user.classId).filter(e => e.isActive))
  }, [user, navigate])

  if (!user) return null

  const myRecords = records.filter(r => r.studentId === user.id)

  function getLatestRecord(eventId) {
    const eventRecords = myRecords
      .filter(r => r.eventId === eventId)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    return eventRecords[0] || null
  }

  function getBestRecord(eventId) {
    const event = events.find(e => e.id === eventId)
    const eventRecords = myRecords.filter(r => r.eventId === eventId)
    if (eventRecords.length === 0) return null
    return eventRecords.reduce((best, r) => {
      if (!best) return r
      if (event?.direction === 'low') return r.value < best.value ? r : best
      return r.value > best.value ? r : best
    }, null)
  }

  function getImprovement() {
    if (myRecords.length < 2) return null
    const sorted = [...myRecords].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    const latest = sorted[0]
    const event = events.find(e => e.id === latest.eventId)
    const sameEvent = sorted.filter(r => r.eventId === latest.eventId)
    if (sameEvent.length < 2) return null
    const prev = sameEvent[1]
    const diff = latest.value - prev.value
    const improved = event?.direction === 'low' ? diff < 0 : diff > 0
    return improved ? { eventName: latest.eventName, diff: Math.abs(diff), unit: event?.unit } : null
  }

  const improvement = getImprovement()

  return (
    <div className="min-h-dvh bg-bg pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange to-orange-dark text-white px-4 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm opacity-80">{user.className}</span>
            <button onClick={() => { logout(); navigate('/') }} className="text-sm opacity-60 touch-target">나가기</button>
          </div>
          <h1 className="text-2xl font-black">안녕, {user.name}! 👋</h1>
          <p className="opacity-80 mt-1">오늘도 체력왕에 도전해볼까?</p>

          {improvement && (
            <div className="mt-4 bg-white/20 rounded-xl px-4 py-3">
              <span className="text-sm">🔥 {improvement.eventName} +{improvement.diff}{improvement.unit} 향상!</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-orange">{myRecords.length}</div>
            <div className="text-xs text-navy/50">총 기록</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-mint">
              {events.filter(e => getBestRecord(e.id)).length}/{events.length}
            </div>
            <div className="text-xs text-navy/50">참여 종목</div>
          </div>
        </div>

        {/* Event cards */}
        <h2 className="font-bold text-navy mb-3">내 종목별 기록</h2>
        <div className="space-y-3">
          {events.map(event => {
            const latest = getLatestRecord(event.id)
            const best = getBestRecord(event.id)
            const icon = EVENT_ICONS[event.name] || '🎯'
            const achieved = best && (
              event.direction === 'high' ? best.value >= event.targetValue : best.value <= event.targetValue
            )

            return (
              <button
                key={event.id}
                onClick={() => navigate(`/student/record?eventId=${event.id}`)}
                className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy flex items-center gap-2">
                    {event.name}
                    {achieved && <span className="text-xs">✅</span>}
                  </div>
                  <div className="text-sm text-navy/50">
                    {latest ? `최근 ${latest.value}${event.unit}` : '기록 없음'}
                    {best ? ` · 최고 ${best.value}${event.unit}` : ''}
                  </div>
                </div>
                <div className="text-navy/30 text-xl">›</div>
              </button>
            )
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 text-navy/40">
            <div className="text-4xl mb-2">📋</div>
            <p>아직 등록된 종목이 없어요.</p>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  )
}
