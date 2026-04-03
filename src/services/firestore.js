import { db } from '../firebase'
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'

// ─── Teachers ────────────────────────────────────────
export async function createTeacher(teacher) {
  await setDoc(doc(db, 'teachers', teacher.id), {
    ...teacher,
    createdAt: serverTimestamp(),
  })
}

export async function getTeacherByName(name) {
  const q = query(collection(db, 'teachers'), where('name', '==', name))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function getTeacherById(uid) {
  const d = await getDoc(doc(db, 'teachers', uid))
  if (!d.exists()) return null
  return { id: d.id, ...d.data() }
}

// ─── Classes ─────────────────────────────────────────
export async function createClassDoc(classData) {
  await setDoc(doc(db, 'classes', classData.id), {
    ...classData,
    createdAt: serverTimestamp(),
  })
}

export async function getClassesByTeacher(teacherId) {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getClassByInviteCode(code) {
  const q = query(collection(db, 'classes'), where('inviteCode', '==', code.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function updateClassDoc(classId, updates) {
  await updateDoc(doc(db, 'classes', classId), updates)
}

// ─── Students (subcollection of class) ───────────────
export async function getStudents(classId) {
  const q = query(collection(db, 'classes', classId, 'students'), orderBy('number'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addStudents(classId, students) {
  const promises = students.map(s =>
    setDoc(doc(db, 'classes', classId, 'students', s.id), s)
  )
  await Promise.all(promises)
}

export async function updateStudent(classId, studentId, updates) {
  await updateDoc(doc(db, 'classes', classId, 'students', studentId), updates)
}

export async function removeStudent(classId, studentId) {
  await deleteDoc(doc(db, 'classes', classId, 'students', studentId))
}

// ─── Events (subcollection of class) ─────────────────
export async function getEvents(classId) {
  const q = query(collection(db, 'classes', classId, 'events'), orderBy('order'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function setEvents(classId, events) {
  const promises = events.map(e =>
    setDoc(doc(db, 'classes', classId, 'events', e.id), e)
  )
  await Promise.all(promises)
}

export async function updateEvent(classId, eventId, updates) {
  await updateDoc(doc(db, 'classes', classId, 'events', eventId), updates)
}

export async function removeEvent(classId, eventId) {
  await deleteDoc(doc(db, 'classes', classId, 'events', eventId))
}

// ─── Records (subcollection of class) ────────────────
export async function getRecords(classId) {
  const q = query(collection(db, 'classes', classId, 'records'), orderBy('recordedAt'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addRecord(classId, record) {
  await setDoc(doc(db, 'classes', classId, 'records', record.id), {
    ...record,
    recordedAt: record.recordedAt,
  })
}

export async function deleteRecord(classId, recordId) {
  await deleteDoc(doc(db, 'classes', classId, 'records', recordId))
}

// ─── Badge Rules (subcollection of class) ────────────
export async function getBadgeRules(classId) {
  const snap = await getDocs(collection(db, 'classes', classId, 'badgeRules'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function setBadgeRules(classId, badges) {
  const promises = badges.map(b =>
    setDoc(doc(db, 'classes', classId, 'badgeRules', b.id), b)
  )
  await Promise.all(promises)
}

// ─── Earned Badges (subcollection of class) ──────────
export async function getEarnedBadges(classId) {
  const snap = await getDocs(collection(db, 'classes', classId, 'earnedBadges'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function saveEarnedBadge(classId, badge) {
  await setDoc(doc(db, 'classes', classId, 'earnedBadges', badge.id), badge)
}
