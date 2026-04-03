import { useState, useEffect } from 'react'
import { getStudents, saveStudents } from '../../hooks/useClass'
import { updateStudent } from '../../services/firestore'
import { generateId } from '../../utils/constants'
import Modal from '../common/Modal'

export default function StudentList({ classId }) {
  const [students, setStudents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [newName, setNewName] = useState('')
  const [bulkText, setBulkText] = useState('')

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

  async function addBulkStudents() {
    if (!bulkText.trim()) return
    const names = bulkText
      .split(/[\n,\t]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)

    const all = await getStudents(classId)
    const startNum = all.length + 1
    const newStudents = names.map((name, i) => ({
      id: generateId(),
      number: startNum + i,
      name,
      pin: null,
      createdAt: new Date().toISOString(),
    }))
    await saveStudents(classId, [...all, ...newStudents])
    setBulkText('')
    setShowAdd(false)
    await refresh()
  }

  async function resetPin(studentId) {
    await updateStudent(classId, studentId, { pin: null })
    await refresh()
  }

  async function removeStudent(studentId) {
    const all = (await getStudents(classId)).filter(s => s.id !== studentId)
    all.forEach((s, i) => { s.number = i + 1 })
    await saveStudents(classId, all)
    await refresh()
  }

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
            <div key={student.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-mint/10 text-mint font-bold flex items-center justify-center text-sm">
                  {student.number}
                </span>
                <span className="font-medium text-navy">{student.name}</span>
                {student.pin && <span className="text-xs text-mint/60">🔒</span>}
              </div>
              <div className="flex items-center gap-1">
                {student.pin && (
                  <button
                    onClick={() => resetPin(student.id)}
                    className="text-orange text-xs touch-target px-2"
                  >
                    PIN초기화
                  </button>
                )}
                <button
                  onClick={() => removeStudent(student.id)}
                  className="text-red-400 text-sm touch-target px-2"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"이름을 줄바꾸 또는 쉼표로 구분하여 입력\n예:\n김철수\n이영희\n박지민"}
              rows={6}
              className="w-full px-3 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange focus:outline-none resize-none"
            />
            <button onClick={addBulkStudents} className="w-full py-3 bg-orange text-white rounded-lg font-bold touch-target">
              일괄 추가
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
