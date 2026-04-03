import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { createTeacher, getTeacherByName, getTeacherById } from '../services/firestore'

const AuthContext = createContext(null)
const googleProvider = new GoogleAuthProvider()

// 카카오톡, 라인 등 인앱 브라우저 감지
function isInAppBrowser() {
  const ua = navigator.userAgent || ''
  return /KAKAOTALK|NAVER|Line|Instagram|FBAN|FBAV|Twitter/i.test(ua)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 리다이렉트 로그인 결과 처리 (카톡 인앱 브라우저 등)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        const { uid, displayName, email } = result.user
        let teacher = await getTeacherById(uid)
        if (!teacher) {
          teacher = {
            id: uid,
            name: displayName || email.split('@')[0],
            email,
            firebaseUid: uid,
          }
          await createTeacher(teacher)
        }
        const userData = { id: teacher.id, name: teacher.name, role: 'teacher' }
        persistUser(userData)
      }
    }).catch(() => {})

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const saved = localStorage.getItem('fithero_currentUser')
        if (saved) {
          setUser(JSON.parse(saved))
        }
      } else {
        const saved = localStorage.getItem('fithero_currentUser')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.role === 'student') {
            setUser(parsed)
          } else {
            setUser(null)
            localStorage.removeItem('fithero_currentUser')
          }
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  function persistUser(userData) {
    setUser(userData)
    localStorage.setItem('fithero_currentUser', JSON.stringify(userData))
  }

  // ── 이메일 회원가입 ──
  async function teacherSignup(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    const teacher = {
      id: cred.user.uid,
      name: displayName,
      email,
      firebaseUid: cred.user.uid,
    }
    await createTeacher(teacher)

    const userData = { id: teacher.id, name: teacher.name, role: 'teacher' }
    persistUser(userData)
    return userData
  }

  // ── 이메일 로그인 ──
  async function teacherLogin(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)

    const teacher = await getTeacherById(cred.user.uid)
    if (!teacher) {
      throw new Error('등록된 선생님 정보를 찾을 수 없습니다.')
    }

    const userData = { id: teacher.id, name: teacher.name, role: 'teacher' }
    persistUser(userData)
    return userData
  }

  // ── Google 로그인/가입 (자동 판별) ──
  // 인앱 브라우저에서는 redirect, 일반 브라우저에서는 popup 사용
  async function teacherGoogleLogin() {
    if (isInAppBrowser()) {
      await signInWithRedirect(auth, googleProvider)
      // 리다이렉트 후 결과는 위 useEffect의 getRedirectResult에서 처리
      return
    }

    const cred = await signInWithPopup(auth, googleProvider)
    const { uid, displayName, email } = cred.user

    let teacher = await getTeacherById(uid)

    if (!teacher) {
      teacher = {
        id: uid,
        name: displayName || email.split('@')[0],
        email,
        firebaseUid: uid,
      }
      await createTeacher(teacher)
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

  async function logout() {
    try {
      await signOut(auth)
    } catch (e) {
      // 학생은 Firebase Auth 사용 안하므로 에러 무시
    }
    setUser(null)
    localStorage.removeItem('fithero_currentUser')
  }

  return (
    <AuthContext.Provider value={{ user, loading, teacherSignup, teacherLogin, teacherGoogleLogin, studentJoin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
