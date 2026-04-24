import { useState, useEffect } from 'react'
import { getEvents, saveEvents } from '../../hooks/useClass'
import { removeEvent as removeEventDoc } from '../../services/firestore'
import { generateId } from '../../utils/constants'
import Modal from '../common/Modal'

export default function EventManager({ classId }) {
  const [events, setEvents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({ name: '', unit: '회', direction: 'high', targetValue: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    refresh()
  }, [classId])

  async function refresh() {
    setEvents(await getEvents(classId))
  }

  async function toggleEvent(eventId) {
    const all = await getEvents(classId)
    const updated = all.map(e =>
      e.id === eventId ? { ...e, isActive: !e.isActive } : e
    )
    await saveEvents(classId, updated)
    await refresh()
  }

  async function addCustomEvent() {
    if (!newEvent.name.trim() || !newEvent.targetValue) return
    const all = await getEvents(classId)
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
    await saveEvents(classId, all)
    setNewEvent({ name: '', unit: '회', direction: 'high', targetValue: '' })
    setShowAdd(false)
    await refresh()
  }

  async function confirmAndRemoveEvent() {
    if (!confirmDelete) return
    await removeEventDoc(classId, confirmDelete.id)
    setConfirmDelete(null)
    await refresh()
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
          <div key={event.id} className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
            <button
              onClick={() => toggleEvent(event.id)}
              className={`shrink-0 w-12 h-7 rounded-full transition-colors relative ${event.isActive ? 'bg-mint' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${event.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-navy flex items-center gap-2">
                <span className="truncate">{event.name}</span>
                {event.type === 'paps' && (
                  <span className="shrink-0 text-xs bg-orange/10 text-orange px-2 py-0.5 rounded-full">PAPS</span>
                )}
              </div>
              <div className="text-sm text-navy/50 truncate">
                목표: {event.targetValue}{event.unit} · {event.direction === 'high' ? '높을수록 좋음' : '낮을수록 좋음'}
              </div>
            </div>
            {event.type === 'custom' && (
              <button
                onClick={() => setConfirmDelete(event)}
                type="button"
                className="shrink-0 px-3 h-10 rounded-lg bg-red-50 text-red-500 text-xs font-bold active:bg-red-100"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmAndRemoveEvent}
        title="종목 삭제"
        confirmText="삭제"
      >
        <p className="text-sm">
          <strong className="text-navy">{confirmDelete?.name}</strong> 종목을 삭제할까요?
        </p>
        <p className="text-xs text-red-500 mt-2">이 종목의 기존 기록은 그대로 남지만, 더 이상 새로 기록할 수 없습니다.</p>
      </Modal>

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
