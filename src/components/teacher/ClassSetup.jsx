import { useState, useEffect } from 'react'
import { useClass } from '../../hooks/useClass'
import StudentList from './StudentList'
import EventManager from './EventManager'

export default function ClassSetup({ classData, onRefresh }) {
  const [tab, setTab] = useState('students')
  const { getClassSettings, updateClassSettings } = useClass()
  const [settings, setSettings] = useState({ studentInputEnabled: true, recordVisibility: 'private' })

  useEffect(() => {
    setSettings(getClassSettings(classData.id))
  }, [classData.id])

  async function handleSettingChange(key, value) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    await updateClassSettings(classData.id, updated)
  }

  const tabs = [
    { id: 'students', label: '학생 명부', icon: '👥' },
    { id: 'events', label: '종목 설정', icon: '🏅' },
    { id: 'settings', label: '학급 설정', icon: '⚙️' },
    { id: 'invite', label: '초대 코드', icon: '🔗' },
  ]

  function copyCode() {
    navigator.clipboard?.writeText(classData.inviteCode)
  }

  const visibilityOptions = [
    { value: 'private', label: '비공개', desc: '본인과 선생님만 기록을 볼 수 있어요' },
    { value: 'leaderboard', label: '순위 공개', desc: '종목별 순위를 반 전체가 볼 수 있어요' },
    { value: 'anonymous', label: '익명 순위', desc: '순위는 보이지만 이름 대신 번호로 표시해요' },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
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

      {tab === 'settings' && (
        <div className="space-y-6">
          {/* Student self-input toggle */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-navy">학생 자기입력 허용</h3>
                <p className="text-sm text-navy/50 mt-1">
                  {settings.studentInputEnabled
                    ? '학생이 직접 기록을 입력할 수 있어요'
                    : '선생님만 기록을 입력할 수 있어요'}
                </p>
              </div>
              <button
                onClick={() => handleSettingChange('studentInputEnabled', !settings.studentInputEnabled)}
                className={`w-14 h-8 rounded-full transition-colors relative shrink-0 ${
                  settings.studentInputEnabled ? 'bg-mint' : 'bg-gray-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${
                  settings.studentInputEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Record visibility */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-navy mb-1">기록 열람 범위</h3>
            <p className="text-sm text-navy/50 mb-4">학생들이 다른 학생의 기록을 볼 수 있는 범위를 설정해요</p>
            <div className="space-y-2">
              {visibilityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSettingChange('recordVisibility', opt.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                    settings.recordVisibility === opt.value
                      ? 'border-mint bg-mint/5'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      settings.recordVisibility === opt.value ? 'border-mint' : 'border-gray-300'
                    }`}>
                      {settings.recordVisibility === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-mint" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-navy">{opt.label}</div>
                      <div className="text-xs text-navy/50 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Class info */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-navy mb-3">학급 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy/50">학교</span>
                <span className="font-medium text-navy">{classData.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">학년/반</span>
                <span className="font-medium text-navy">{classData.grade}학년 {classData.classNumber}반</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy/50">초대코드</span>
                <span className="font-mono font-bold text-orange">{classData.inviteCode}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
