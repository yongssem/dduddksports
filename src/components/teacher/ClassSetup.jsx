import { useState } from 'react'
import StudentList from './StudentList'
import EventManager from './EventManager'

export default function ClassSetup({ classData, onRefresh }) {
  const [tab, setTab] = useState('students')

  const tabs = [
    { id: 'students', label: '학생 명부', icon: '👥' },
    { id: 'events', label: '종목 설정', icon: '🏅' },
    { id: 'invite', label: '초대 코드', icon: '🔗' },
  ]

  function copyCode() {
    navigator.clipboard?.writeText(classData.inviteCode)
  }

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap touch-target transition-colors ${
              tab === t.id ? 'bg-orange text-white' : 'bg-white text-navy/60 shadow-sm'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'students' && <StudentList classId={classData.id} />}

      {tab === 'events' && <EventManager classId={classData.id} />}

      {tab === 'invite' && (
        <div className="text-center py-8">
          <p className="text-navy/50 text-sm mb-4">학생들에게 아래 코드를 공유하세요</p>
          <div className="bg-white rounded-2xl p-8 shadow-sm inline-block">
            <div className="text-4xl font-mono font-black tracking-[0.3em] text-orange">
              {classData.inviteCode}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={copyCode}
              className="px-6 py-3 bg-mint text-white rounded-xl font-medium touch-target"
            >
              📋 코드 복사
            </button>
          </div>
          <p className="text-navy/40 text-xs mt-4">
            {classData.schoolName} {classData.grade}학년 {classData.classNumber}반
          </p>
        </div>
      )}
    </div>
  )
}
