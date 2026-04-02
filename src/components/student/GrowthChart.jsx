import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import { getEvents } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'
import { getPersonalBest, calculateAchievementRate, calculateImprovement, formatValue } from '../../utils/scoreCalculator'
import { EVENT_ICONS } from '../../utils/constants'
import NavBar from '../common/NavBar'

export default function GrowthChart() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const { getStudentEventRecords } = useRecords(user?.classId)

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/')
      return
    }
    const activeEvents = getEvents(user.classId).filter(e => e.isActive)
    setEvents(activeEvents)
    if (activeEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(activeEvents[0].id)
    }
  }, [user, navigate])

  if (!user) return null

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const eventRecords = selectedEvent ? getStudentEventRecords(user.id, selectedEvent.id) : []

  const chartData = eventRecords.map((r, i) => ({
    name: new Date(r.recordedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
    value: r.value,
    round: i + 1,
  }))

  const best = selectedEvent ? getPersonalBest(eventRecords, selectedEvent.direction) : null
  const improvement = selectedEvent ? calculateImprovement(eventRecords, selectedEvent.direction) : null
  const achievementRate = best && selectedEvent
    ? calculateAchievementRate(best.value, selectedEvent.targetValue, selectedEvent.direction)
    : 0

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-navy text-lg text-center">성장 그래프 📈</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Event tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {events.map(event => {
            const icon = EVENT_ICONS[event.name] || '🎯'
            const isSelected = selectedEventId === event.id
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap touch-target transition-colors ${
                  isSelected ? 'bg-mint text-white shadow-md' : 'bg-white text-navy/60 shadow-sm'
                }`}
              >
                <span>{icon}</span>
                <span>{event.name}</span>
              </button>
            )
          })}
        </div>

        {selectedEvent && eventRecords.length > 0 ? (
          <>
            {/* Chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#011627', opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#011627', opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`${val}${selectedEvent.unit}`, selectedEvent.name]}
                  />
                  <ReferenceLine
                    y={selectedEvent.targetValue}
                    stroke="#FF6B35"
                    strokeDasharray="6 4"
                    label={{ value: `목표 ${selectedEvent.targetValue}${selectedEvent.unit}`, position: 'right', fontSize: 10, fill: '#FF6B35' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2EC4B6"
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    dot={{ r: 5, fill: '#2EC4B6', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#FF6B35', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs text-navy/40 mb-1">최고 기록</div>
                <div className="text-xl font-bold text-mint">
                  {best ? formatValue(best.value, selectedEvent.unit) : '-'}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs text-navy/40 mb-1">달성률</div>
                <div className={`text-xl font-bold ${achievementRate >= 100 ? 'text-orange' : 'text-navy'}`}>
                  {achievementRate.toFixed(0)}%
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs text-navy/40 mb-1">최근 기록</div>
                <div className="text-xl font-bold text-navy">
                  {eventRecords.length > 0
                    ? formatValue(eventRecords[eventRecords.length - 1].value, selectedEvent.unit)
                    : '-'}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs text-navy/40 mb-1">변화량</div>
                <div className={`text-xl font-bold ${improvement?.improved ? 'text-mint' : 'text-navy/40'}`}>
                  {improvement
                    ? `${improvement.improved ? '+' : '-'}${formatValue(improvement.diff, selectedEvent.unit)}`
                    : '-'}
                </div>
              </div>
            </div>
          </>
        ) : selectedEvent ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-lg font-bold text-navy mb-2">아직 기록이 없어요!</h2>
            <p className="text-navy/50 mb-6">기록을 입력하면 성장 그래프를 볼 수 있어요.</p>
            <button
              onClick={() => navigate(`/student/record?eventId=${selectedEvent.id}`)}
              className="px-6 py-3 bg-orange text-white rounded-xl font-bold touch-target"
            >
              기록 입력하기 ✏️
            </button>
          </div>
        ) : (
          <div className="text-center py-16 text-navy/40">
            <div className="text-4xl mb-2">📋</div>
            <p>등록된 종목이 없습니다.</p>
          </div>
        )}
      </div>

      <NavBar />
    </div>
  )
}
