import { useState, useEffect } from 'react'
import { getStudents, getEvents } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'

export default function RecordMonitor({ classId }) {
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const { records } = useRecords(classId)

  useEffect(() => {
    async function load() {
      setStudents(await getStudents(classId))
      const allEvents = await getEvents(classId)
      setEvents(allEvents.filter(e => e.isActive))
    }
    load()
  }, [classId])

  function getLatestRecord(studentId, eventId) {
    const studentRecords = records
      .filter(r => r.studentId === studentId && r.eventId === eventId)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    return studentRecords[0] || null
  }

  function getBestRecord(studentId, eventId) {
    const event = events.find(e => e.id === eventId)
    const studentRecords = records.filter(r => r.studentId === studentId && r.eventId === eventId)
    if (studentRecords.length === 0) return null
    return studentRecords.reduce((best, r) => {
      if (!best) return r
      if (event?.direction === 'low') return r.value < best.value ? r : best
      return r.value > best.value ? r : best
    }, null)
  }

  function isTargetAchieved(value, event) {
    if (event.direction === 'high') return value >= event.targetValue
    return value <= event.targetValue
  }

  const totalRecords = records.length
  const todayRecords = records.filter(r => {
    const today = new Date().toDateString()
    return new Date(r.recordedAt).toDateString() === today
  }).length

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange">{totalRecords}</div>
          <div className="text-xs text-navy/50">총 기록 수</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <div className="text-2xl font-bold text-mint">{todayRecords}</div>
          <div className="text-xs text-navy/50">오늘 기록</div>
        </div>
      </div>

      {students.length === 0 ? (
        <p className="text-center text-navy/40 py-8">등록된 학생이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left">
                <th className="py-2 px-3 text-sm font-medium text-navy/50 bg-bg sticky left-0">학생</th>
                {events.map(event => (
                  <th key={event.id} className="py-2 px-3 text-sm font-medium text-navy/50 text-center">
                    <div>{event.name}</div>
                    <div className="text-xs text-navy/30">목표 {event.targetValue}{event.unit}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-t border-gray-100">
                  <td className="py-3 px-3 bg-bg sticky left-0">
                    <span className="font-medium text-navy text-sm">{student.number}. {student.name}</span>
                  </td>
                  {events.map(event => {
                    const best = getBestRecord(student.id, event.id)
                    const achieved = best && isTargetAchieved(best.value, event)
                    return (
                      <td key={event.id} className="py-3 px-3 text-center">
                        {best ? (
                          <span className={`text-sm font-medium ${achieved ? 'text-mint' : 'text-navy'}`}>
                            {best.value}{event.unit}
                            {achieved && ' ✅'}
                          </span>
                        ) : (
                          <span className="text-navy/20 text-sm">-</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
