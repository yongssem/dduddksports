import { createContext, useContext, useState, useEffect } from 'react'
import { generateId } from '../utils/constants'

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  teachers: 'fithero_teachers',
  currentUser: 'fithero_currentUser',
}

function getTeachers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.teachers) || '[]')
}

function saveTeachers(teachers) {
  localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(teachers))
}

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.currentUser)
    if (saved) {
      setUser(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  function persistUser(userData) {
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(userData))
  }

  async function teacherSignup(name, password) {
    const teachers = getTeachers()
    if (teachers.some(t => t.name === name)) {
      throw new Error('이미 사용 중인 이름입니다.')
    }
    const passwordHash = await hashPassword(password)
    const teacher = {
      id: generateId(),
      name,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    teachers.push(teacher)
    saveTeachers(teachers)
    const userData = { id: teacher.id, name: teacher.name, role: 'teacher' }
    persistUser(userData)
    return userData
  }

  async function teacherLogin(name, password) {
    const teachers = getTeachers()
    const teacher = teachers.find(t => t.name === name)
    if (!teacher) {
      throw new Error('등록되지 않은 이름입니다.')
    }
    const passwordHash = await hashPassword(password)
    if (teacher.passwordHash !== passwordHash) {
      throw new Error('비밀번호가 일치하지 않습니다.')
    }
    const userData = { id: teacher.id, name: teacher.name, role: 'teacher' }
    persistUser(userData)
    return userData
  }

  function studentJoin(classId, className, student) {
    const userData = {
      id: student.id,
      name: student.name,
      role: 'student',
      classId,
      className,
      studentNumber: student.number,
    }
    persistUser(userData)
    return userData
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.currentUser)
  }

  return (
    <AuthContext.Provider value={{ user, loading, teacherSignup, teacherLogin, studentJoin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
