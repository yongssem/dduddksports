import { useState, useEffect } from 'react'
import { getEvents, saveEvents } from '../../hooks/useClass'
import { generateId } from '../../utils/constants'
import Modal from '../common/Modal'

export default function EventManager({ classId }) {
  const [events, setEvents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({ name: '', unit: '회', direction: 'high', targetValue: '' })

  useEffect(() => {
    setEvents(getEvents(classId))
  }, [classId])

  function refresh() {
    setEvents(getEvents(classId))
  }

  function toggleEvent(eventId) {
    const all = getEvents(classId).map(e =>
      e.id === eventId ? { ...e, isActive: !e.isActive } : e
    )
    saveEvents(classId, all)
    refresh()
  }

  function addCustomEvent() {
    if (!newEvent.name.trim() || !newEvent.targetValue) return
    const all = getEvents(classId)
    all.push({
      id: generateId(),
      name: newEvent.name.trim(),
      unit: newEvent.unit,
      direction: newEvent.direction,
      targetValue: Number(newEvent.targetValue),
      type: 'custom',
      isActive: true,
      order: all.length,
    })
    saveEvents(classId, all)
    setNewEvent({ name: '', unit: '회', direction: 'high', targetValue: '' })
    setShowAdd(false)
    refresh()
  }

  function removeEvent(eventId) {
    const all = getEvents(classId).filter(e => e.id !== eventId)
    saveEvents(classId, all)
    refresh()
  }

  const units = ['회', '초', 'cm', 'kg', 'm', '점']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy text-lg">종목 설정</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-mint text-white rounded-lg text-sm font-medium touch-target"
        >
          + 종목 추가
        </button>
      </div>

      <div className="space-y-2">
        {events.map(event => (
          <div key={event.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => toggleEvent(event.id)}
                className={`w-12 h-7 rounded-full transition-colors relative ${event.isActive ? 'bg-mint' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${event.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <div>
                <div className="font-medium text-navy flex items-center gap-2">
                  {event.name}
                  {event.type === 'paps' && (
                    <span className="text-xs bg-orange/10 text-orange px-2 py-0.5 rounded-full">PAPS</span>
                  )}
                </div>
                <div className="text-sm text-navy/50">
                  목표: {event.targetValue}{event.unit} · {event.direction === 'high' ? '높을수록 좋음' : '낮을수록 좋음'}
                </div>
              </div>
            </div>
            {event.type === 'custom' && (
              <button onClick={() => removeEvent(event.id)} className="text-red-400 text-sm touch-target px-2">
                삭제
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="커스텀 종목 추가"
        confirmText="추가"
        onConfirm={addCustomEvent}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-navy/60 mb-1">종목명</label>
            <input
              type="text"
              value={newEvent.name}
              onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))}
              placeholder="예: 줄넘기"
              className="w-full px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-mint focus:outline-none touch-target"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-navy/60 mb-1">단위</label>
              <select
                value={newEvent.unit}
                onChange={e => setNewEvent(v => ({ ...v, unit: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-mint focus:outline-none touch-target"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy/60 mb-1">측정 방향</label>
              <select
                value={newEvent.direction}
                onChange={e => setNewEvent(v => ({ ...v, direction: e.target.value }))}
                className="w-full px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-mint focus:outline-none touch-target"
              >
                <option value="high">높을수록 좋음</option>
                <option value="low">낮을수록 좋음</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-navy/60 mb-1">목표값</label>
            <input
              type="number"
              value={newEvent.targetValue}
              onChange={e => setNewEvent(v => ({ ...v, targetValue: e.target.value }))}
              placeholder="목표값 입력"
              inputMode="decimal"
              className="w-full px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-mint focus:outline-none touch-target"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
