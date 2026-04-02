import { useState, useEffect, useCallback } from 'react'
import { generateId, generateInviteCode, DEFAULT_PAPS_EVENTS, DEFAULT_BADGES } from '../utils/constants'
import * as fs from '../services/firestore'

// Async helper exports (used by components directly)
export async function getStudents(classId) {
  return fs.getStudents(classId)
}

export async function saveStudents(classId, students) {
  return fs.addStudents(classId, students)
}

export async function getEvents(classId) {
  return fs.getEvents(classId)
}

export async function saveEvents(classId, events) {
  return fs.setEvents(classId, events)
}

export function useClass(teacherId) {
  const [classes, setClasses] = useState([])

  const loadClasses = useCallback(async () => {
    if (!teacherId) return
    const all = await fs.getClassesByTeacher(teacherId)
    setClasses(all)
  }, [teacherId])

  useEffect(() => {
    loadClasses()
  }, [loadClasses])

  async function createClass(schoolName, grade, classNumber) {
    const inviteCode = generateInviteCode()
    const classId = generateId()

    const newClass = {
      id: classId,
      teacherId,
      schoolName,
      grade: Number(grade),
      classNumber: Number(classNumber),
      inviteCode,
      settings: {
        studentInputEnabled: true,
        recordVisibility: 'private',
      },
    }

    await fs.createClassDoc(newClass)

    // Seed default PAPS events
    const events = DEFAULT_PAPS_EVENTS.map((e, i) => ({
      id: generateId(),
      ...e,
      isActive: true,
      order: i,
    }))
    await fs.setEvents(classId, events)

    // Seed default badge rules
    const badges = DEFAULT_BADGES.map(b => ({
      id: generateId(),
      ...b,
      isActive: true,
    }))
    await fs.setBadgeRules(classId, badges)

    await loadClasses()
    return newClass
  }

  async function addClass(students, classId) {
    const existing = await fs.getStudents(classId)
    const newStudents = students.map((s, i) => ({
      id: generateId(),
      number: existing.length + i + 1,
      name: s.name || s,
      pin: null,
      createdAt: new Date().toISOString(),
    }))
    await fs.addStudents(classId, newStudents)
  }

  async function removeStudent(classId, studentId) {
    await fs.removeStudent(classId, studentId)
  }

  async function findClassByInviteCode(code) {
    return fs.getClassByInviteCode(code)
  }

  async function regenerateInviteCode(classId) {
    const newCode = generateInviteCode()
    await fs.updateClassDoc(classId, { inviteCode: newCode })
    await loadClasses()
    return newCode
  }

  async function updateEvent(classId, eventId, updates) {
    await fs.updateEvent(classId, eventId, updates)
  }

  async function addCustomEvent(classId, event) {
    const events = await fs.getEvents(classId)
    const newEvent = {
      id: generateId(),
      ...event,
      type: 'custom',
      isActive: true,
      order: events.length,
    }
    await fs.setEvents(classId, [newEvent])
  }

  async function updateClassSettings(classId, settings) {
    const cls = classes.find(c => c.id === classId)
    const merged = { ...cls?.settings, ...settings }
    await fs.updateClassDoc(classId, { settings: merged })
    await loadClasses()
  }

  function getClassSettings(classId) {
    const cls = classes.find(c => c.id === classId)
    return cls?.settings || { studentInputEnabled: true, recordVisibility: 'private' }
  }

  async function removeEvent(classId, eventId) {
    await fs.removeEvent(classId, eventId)
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
    updateClassSettings,
    getClassSettings,
    refresh: loadClasses,
  }
}
