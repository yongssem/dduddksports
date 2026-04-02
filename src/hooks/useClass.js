import { useState, useEffect, useCallback } from 'react'
import { generateId, generateInviteCode, DEFAULT_PAPS_EVENTS, DEFAULT_BADGES } from '../utils/constants'

const STORAGE_KEYS = {
  classes: 'fithero_classes',
  students: (classId) => `fithero_students_${classId}`,
  events: (classId) => `fithero_events_${classId}`,
  badgeRules: (classId) => `fithero_badgeRules_${classId}`,
}

function getClasses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.classes) || '[]')
}

function saveClasses(classes) {
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes))
}

export function getStudents(classId) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.students(classId)) || '[]')
}

export function saveStudents(classId, students) {
  localStorage.setItem(STORAGE_KEYS.students(classId), JSON.stringify(students))
}

export function getEvents(classId) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.events(classId)) || '[]')
}

export function saveEvents(classId, events) {
  localStorage.setItem(STORAGE_KEYS.events(classId), JSON.stringify(events))
}

export function useClass(teacherId) {
  const [classes, setClasses] = useState([])

  const loadClasses = useCallback(() => {
    const all = getClasses()
    setClasses(teacherId ? all.filter(c => c.teacherId === teacherId) : all)
  }, [teacherId])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  function createClass(schoolName, grade, classNumber) {
    const allClasses = getClasses()
    const inviteCode = generateInviteCode()
    const classId = generateId()

    const newClass = {
      id: classId,
      teacherId,
      schoolName,
      grade: Number(grade),
      classNumber: Number(classNumber),
      inviteCode,
      createdAt: new Date().toISOString(),
    }

    allClasses.push(newClass)
    saveClasses(allClasses)

    // Seed default PAPS events
    const events = DEFAULT_PAPS_EVENTS.map((e, i) => ({
      id: generateId(),
      ...e,
      isActive: true,
      order: i,
    }))
    saveEvents(classId, events)

    // Seed default badge rules
    const badges = DEFAULT_BADGES.map(b => ({
      id: generateId(),
      ...b,
      isActive: true,
    }))
    localStorage.setItem(STORAGE_KEYS.badgeRules(classId), JSON.stringify(badges))

    loadClasses()
    return newClass
  }

  function addClass(students, classId) {
    const existing = getStudents(classId)
    const newStudents = students.map((s, i) => ({
      id: generateId(),
      number: existing.length + i + 1,
      name: s.name || s,
      pin: null,
      createdAt: new Date().toISOString(),
    }))
    saveStudents(classId, [...existing, ...newStudents])
  }

  function removeStudent(classId, studentId) {
    const students = getStudents(classId).filter(s => s.id !== studentId)
    saveStudents(classId, students)
  }

  function findClassByInviteCode(code) {
    const allClasses = getClasses()
    return allClasses.find(c => c.inviteCode === code.toUpperCase()) || null
  }

  function regenerateInviteCode(classId) {
    const allClasses = getClasses()
    const cls = allClasses.find(c => c.id === classId)
    if (cls) {
      cls.inviteCode = generateInviteCode()
      saveClasses(allClasses)
      loadClasses()
      return cls.inviteCode
    }
    return null
  }

  function updateEvent(classId, eventId, updates) {
    const events = getEvents(classId).map(e => e.id === eventId ? { ...e, ...updates } : e)
    saveEvents(classId, events)
  }

  function addCustomEvent(classId, event) {
    const events = getEvents(classId)
    events.push({
      id: generateId(),
      ...event,
      type: 'custom',
      isActive: true,
      order: events.length,
    })
    saveEvents(classId, events)
  }

  function removeEvent(classId, eventId) {
    const events = getEvents(classId).filter(e => e.id !== eventId)
    saveEvents(classId, events)
  }

  return {
    classes,
    createClass,
    addClass,
    removeStudent,
    findClassByInviteCode,
    regenerateInviteCode,
    updateEvent,
    addCustomEvent,
    removeEvent,
    refresh: loadClasses,
  }
}
