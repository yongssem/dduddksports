import { useState, useEffect } from 'react'
import { getStudents, saveStudents } from '../../hooks/useClass'
import { updateStudent } from '../../services/firestore'
import { generateId } from '../../utils/constants'
import Modal from '../common/Modal'

const EMPTY_ROW = () => ({ name: '', pin: '' })

export default function StudentList({ classId }) {
  const [students, setStudents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [newName, setNewName] = useState('')
  const [bulkRows, setBulkRows] = useState(() => Array.from({ length: 5 }, EMPTY_ROW))
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    refresh()
  }, [classId])

  async function refresh() {
    setStudents(await getStudents(classId))
  }

  async function addSingleStudent() {
    if (!newName.trim()) return
    const all = await getStudents(classId)
    const newStudent = {
      id: generateId(),
      number: all.length + 1,
      name: newName.trim(),
      pin: null,
      createdAt: new Date().toISOString(),
    }
    await saveStudents(classId, [...all, newStudent])
    setNewName('')
    await refresh()
  }

  function updateBulkRow(index, field, value) {
    setBulkRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  function addMoreRows() {
    setBulkRows(prev => [...prev, ...Array.from({ length: 5 }, EMPTY_ROW)])
  }

  function removeBulkRow(index) {
    setBulkRows(prev => prev.length <= 1 ? [EMPTY_ROW()] : prev.filter((_, i) => i !== index))
  }

  async function submitBulkStudents() {
    const validRows = bulkRows.filter(row => row.name.trim())
    if (validRows.length === 0) return

    setLoading(true)
    try {
      const all = await getStudents(classId)
      const startNum = all.length + 1
      const newStudents = validRows.map((row, i) => ({
        id: generateId(),
        number: startNum + i,
        name: row.name.trim(),
        pin: row.pin.length === 4 ? row.pin : null,
        createdAt: new Date().toISOString(),
      }))
      await saveStudents(classId, [...all, ...newStudents])
      setBulkRows(Array.from({ length: 5 }, EMPTY_ROW))
      setShowAdd(false)
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  async function resetPin(studentId) {
    await updateStudent(classId, studentId, { pin: null })
    await refresh()
  }

  async function confirmAndRemoveStudent() {
    if (!confirmDelete) return
    const all = (await getStudents(classId)).filter(s => s.id !== confirmDelete.id)
    all.forEach((s, i) => { s.number = i + 1 })
    await saveStudents(classId, all)
    setConfirmDelete(null)
    await refresh()
  }

  const validCount = bulkRows.filter(r => r.name.trim()).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-navy text-lg">학생 명부 ({students.length}명)</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium touch-target"
        >
          + 학생 추가
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-navy/40">
          <div className="text-4xl mb-2">📋</div>
          <p>아직 등록된 학생이 없습니다.</p>
          <p className="text-sm mt-1">학생을 추가해주세요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map(student => (
            <div key={student.id} className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
              <span className="shrink-0 w-8 h-8 rounded-full bg-mint/10 text-mint font-bold flex items-center justify-center text-sm">
                {student.number}
              </span>
              <span className="flex-1 min-w-0 font-medium text-navy truncate">{student.name}</span>
              {student.pin && <span className="shrink-0 text-xs">🔒</span>}
              {student.pin && (
                <button
                  onClick={() => resetPin(student.id)}
                  type="button"
                  className="shrink-0 px-3 h-10 rounded-lg bg-orange/10 text-orange text-xs font-bold active:bg-orange/20"
                >
                  PIN
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(student)}
                type="button"
                className="shrink-0 px-3 h-10 rounded-lg bg-red-50 text-red-500 text-xs font-bold active:bg-red-100"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmAndRemoveStudent}
        title="학생 삭제"
        confirmText="삭제"
      >
        <p className="text-sm">
          <strong className="text-navy">{confirmDelete?.number}번 {confirmDelete?.name}</strong> 학생을 삭제할까요?
        </p>
        <p className="text-xs text-red-500 mt-2">삭제한 학생은 되돌릴 수 없으며, 기록은 그대로 남아 있습니다.</p>
      </Modal>

      <Modal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); setBulkMode(false) }}
        title="학생 추가"
      >
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setBulkMode(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium touch-target ${!bulkMode ? 'bg-orange text-white' : 'bg-gray-100 text-navy/50'}`}
          >
            개별 추가
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium touch-target ${bulkMode ? 'bg-orange text-white' : 'bg-gray-100 text-navy/50'}`}
          >
            일괄 추가
          </button>
        </div>

        {!bulkMode ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="학생 이름"
              className="flex-1 px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange focus:outline-none touch-target"
              onKeyDown={e => e.key === 'Enter' && addSingleStudent()}
            />
            <button onClick={addSingleStudent} className="px-4 py-3 bg-orange text-white rounded-lg font-medium touch-target">
              추가
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 헤더 */}
            <div className="grid grid-cols-[32px_1fr_80px_28px] gap-2 text-xs text-navy/40 font-medium px-1">
              <span>번호</span>
              <span>이름</span>
              <span>PIN</span>
              <span></span>
            </div>

            {/* 입력 행들 */}
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {bulkRows.map((row, i) => (
                <div key={i} className="grid grid-cols-[32px_1fr_80px_28px] gap-2 items-center">
                  <span className="text-sm text-navy/40 text-center font-medium">
                    {students.length + i + 1}
                  </span>
                  <input
                    type="text"
                    value={row.name}
                    onChange={e => updateBulkRow(i, 'name', e.target.value)}
                    placeholder="이름"
                    className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange focus:outline-none text-sm touch-target"
                  />
                  <input
                    type="text"
                    value={row.pin}
                    onChange={e => updateBulkRow(i, 'pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="선택"
                    inputMode="numeric"
                    maxLength={4}
                    className="px-2 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-mint focus:outline-none text-sm text-center touch-target"
                  />
                  <button
                    onClick={() => removeBulkRow(i)}
                    className="text-red-300 hover:text-red-500 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 행 추가 */}
            <button
              onClick={addMoreRows}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-navy/40 text-sm font-medium hover:border-mint hover:text-mint transition-colors touch-target"
            >
              + 5행 추가
            </button>

            {/* 등록 버튼 */}
            <button
              onClick={submitBulkStudents}
              disabled={loading || validCount === 0}
              className="w-full py-3 bg-orange text-white rounded-lg font-bold touch-target disabled:opacity-50"
            >
              {loading ? '등록 중...' : `${validCount}명 일괄 등록`}
            </button>
            <p className="text-center text-navy/30 text-xs">PIN은 비워두면 학생이 첫 접속 시 직접 설정해요</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
