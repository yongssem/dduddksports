import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getEvents, getStudents } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'
import { useClass } from '../../hooks/useClass'
import { getPersonalBest, calculateAchievementRate } from '../../utils/scoreCalculator'
import NavBar from '../common/NavBar'
import Footer from '../common/Footer'

export default function Leaderboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [students, setStudents] = useState([])
  const [activeTab, setActiveTab] = useState('overall')
  const { records } = useRecords(user?.classId)
  const { getClassSettings } = useClass()
  const classSettings = user?.classId ? getClassSettings(user.classId) : {}

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/')
      return
    }
    setEvents(getEvents(user.classId).filter(e => e.isActive))
    setStudents(getStudents(user.classId))
  }, [user, navigate])

  // Block if private
  if (classSettings.recordVisibility === 'private') {
    return (
      <div className="min-h-dvh bg-bg pb-20">
        <div className="glass sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="font-bold text-navy text-lg text-center font-display">리더보드 🏅</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-lg font-bold text-navy mb-2 font-display">리더보드가 비공개입니다</h2>
          <p className="text-navy/45 text-sm">선생님이 기록 공개 설정을 변경하면 볼 수 있어요.</p>
          <button
            onClick={() => navigate('/student/home')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-mint to-mint-light text-white rounded-2xl font-bold touch-target font-display shadow-lg shadow-mint/20"
          >
            홈으로 돌아가기
          </button>
        </div>
        <Footer />
        <NavBar />
      </div>
    )
  }

  const isAnonymous = classSettings.recordVisibility === 'anonymous'

  function getDisplayName(student) {
    if (student.id === user.id) return user.name
    if (isAnonymous) return `${student.number}번`
    return student.name
  }

  function getRankEmoji(rank) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  function getEventRanking(event) {
    const rankings = students
      .map(student => {
        const studentRecords = records.filter(r => r.studentId === student.id && r.eventId === event.id)
        const best = getPersonalBest(studentRecords, event.direction)
        if (!best) return null
        return { student, bestValue: best.value }
      })
      .filter(Boolean)

    rankings.sort((a, b) =>
      event.direction === 'high' ? b.bestValue - a.bestValue : a.bestValue - b.bestValue
    )

    return rankings.map((r, i) => ({ ...r, rank: i + 1 }))
  }

  function getOverallRanking() {
    const rankings = students
      .map(student => {
        const rates = events.map(event => {
          const studentRecords = records.filter(r => r.studentId === student.id && r.eventId === event.id)
          const best = getPersonalBest(studentRecords, event.direction)
          if (!best) return 0
          return calculateAchievementRate(best.value, event.targetValue, event.direction)
        })
        if (rates.every(r => r === 0)) return null
        const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length
        return { student, avgRate: Math.round(avgRate * 10) / 10 }
      })
      .filter(Boolean)

    rankings.sort((a, b) => b.avgRate - a.avgRate)
    return rankings.map((r, i) => ({ ...r, rank: i + 1 }))
  }

  const selectedEvent = events.find(e => e.id === activeTab)
  const ranking = activeTab === 'overall'
    ? getOverallRanking()
    : selectedEvent ? getEventRanking(selectedEvent) : []

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-navy text-lg text-center font-display">리더보드 🏅</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all touch-target font-display font-bold ${
              activeTab === 'overall' ? 'pill-active' : 'pill-inactive'
            }`}
          >
            🏆 종합
          </button>
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => setActiveTab(event.id)}
              className={`px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all touch-target font-display font-bold ${
                activeTab === event.id ? 'pill-active' : 'pill-inactive'
              }`}
            >
              {event.name}
            </button>
          ))}
        </div>

        {/* Ranking list */}
        {ranking.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-navy/40 font-display">아직 기록이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((entry) => {
              const isMe = entry.student.id === user.id
              return (
                <div
                  key={entry.student.id}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-orange/10 to-orange/5 border-2 border-orange/30 shadow-sm'
                      : 'card-elevated'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                    ) : (
                      <span className="text-lg font-black text-navy/30 font-display">{entry.rank}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <div className={`font-bold font-display ${isMe ? 'text-orange' : 'text-navy'}`}>
                      {getDisplayName(entry.student)}
                      {isMe && <span className="text-xs ml-1.5 text-orange/60 bg-orange/10 px-1.5 py-0.5 rounded-full">나</span>}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    {activeTab === 'overall' ? (
                      <div className="font-black text-navy font-display">
                        {entry.avgRate}<span className="text-sm text-navy/35 ml-0.5">%</span>
                      </div>
                    ) : (
                      <div className="font-black text-navy font-display">
                        {selectedEvent && ['초', 'cm', 'kg', 'm'].includes(selectedEvent.unit)
                          ? entry.bestValue.toFixed(1)
                          : entry.bestValue
                        }
                        <span className="text-sm text-navy/35 ml-0.5">{selectedEvent?.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* My rank summary */}
        {ranking.length > 0 && (() => {
          const myEntry = ranking.find(r => r.student.id === user.id)
          if (!myEntry) return null
          return (
            <div className="mt-6 header-gradient-orange rounded-2xl p-5 text-white text-center shadow-lg shadow-orange/20">
              <p className="text-sm text-white/65 font-display font-medium">내 순위</p>
              <div className="text-3xl font-black mt-1 font-display">
                {myEntry.rank}<span className="text-lg font-medium">위</span>
                <span className="text-lg mx-2 opacity-50">/</span>
                <span className="text-lg font-medium">{ranking.length}명</span>
              </div>
            </div>
          )
        })()}
      </div>

      <Footer />
      <NavBar />
    </div>
  )
}
