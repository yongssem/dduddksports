import React, { useState, useEffect } from 'react'
import { getStudents, getEvents } from '../../hooks/useClass'
import { useRecords } from '../../hooks/useRecords'
import Modal from '../common/Modal'

export default function RecordMonitor({ classId }) {
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const [expandedStudentId, setExpandedStudentId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const { records, deleteRecord } = useRecords(classId)

  useEffect(() => {
    async function load() {
      setStudents(await getStudents(classId))
      const allEvents = await getEvents(classId)
      setEvents(allEvents.filter(e => e.isActive))
    }
    load()
  }, [classId])

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

  function getStudentRecordsByDate(studentId) {
    const studentRecords = records
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
    const grouped = {}
    for (const r of studentRecords) {
      const date = new Date(r.recordedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(r)
    }
    return grouped
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return
    await deleteRecord(confirmDelete.id)
    setConfirmDelete(null)
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
              {students.map(student => {
                const isExpanded = expandedStudentId === student.id
                const recordCount = records.filter(r => r.studentId === student.id).length
                return (
                  <React.Fragment key={student.id}>
                    <tr
                      className="border-t border-gray-100 cursor-pointer hover:bg-mint/5 transition-colors"
                      onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                    >
                      <td className="py-3 px-3 bg-bg sticky left-0">
                        <span className="font-medium text-navy text-sm flex items-center gap-1.5">
                          <span className={`inline-block transition-transform text-[10px] text-navy/30 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                          {student.number}. {student.name}
                          {recordCount > 0 && (
                            <span className="text-[10px] text-navy/30 bg-navy/5 rounded-full px-1.5">{recordCount}</span>
                          )}
                        </span>
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
                    {isExpanded && (
                      <tr>
                        <td colSpan={events.length + 1} className="p-0">
                          <div className="bg-navy/[0.02] border-y border-navy/5 px-4 py-3">
                            {(() => {
                              const grouped = getStudentRecordsByDate(student.id)
                              const dates = Object.keys(grouped)
                              if (dates.length === 0) {
                                return <p className="text-sm text-navy/40 text-center py-2">기록이 없습니다.</p>
                              }
                              return dates.map(date => (
                                <div key={date} className="mb-3 last:mb-0">
                                  <div className="text-xs font-bold text-navy/40 mb-1.5">{date}</div>
                                  <div className="flex flex-wrap gap-2">
                                    {grouped[date].map(r => {
                                      const event = events.find(e => e.id === r.eventId)
                                      const achieved = event && isTargetAchieved(r.value, event)
                                      return (
                                        <span
                                          key={r.id}
                                          className={`inline-flex items-center gap-1.5 text-xs pl-2.5 pr-1 py-1 rounded-lg ${
                                            achieved ? 'bg-mint/10 text-mint' : 'bg-white text-navy'
                                          } shadow-sm`}
                                        >
                                          <span className="font-medium">{r.eventName}</span>
                                          <span className="font-bold">{r.value}{event?.unit}</span>
                                          {achieved && <span>✅</span>}
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(r) }}
                                            type="button"
                                            className="ml-0.5 w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center text-sm active:bg-red-100"
                                            aria-label="기록 삭제"
                                          >
                                            ×
                                          </button>
                                        </span>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))
                            })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="기록 삭제"
        confirmText="삭제"
      >
        {confirmDelete && (
          <p className="text-sm">
            <strong className="text-navy">{confirmDelete.studentName}</strong>의{' '}
            <strong className="text-navy">{confirmDelete.eventName} {confirmDelete.value}</strong>{' '}
            기록을 삭제할까요?
          </p>
        )}
        <p className="text-xs text-red-500 mt-2">삭제한 기록은 되돌릴 수 없습니다.</p>
      </Modal>
    </div>
  )
}
