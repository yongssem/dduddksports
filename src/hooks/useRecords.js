import { useState, useEffect, useCallback } from 'react'
import { generateId } from '../utils/constants'
import * as fs from '../services/firestore'

export function useRecords(classId) {
  const [records, setRecords] = useState([])

  const loadRecords = useCallback(async () => {
    if (!classId) return
    const data = await fs.getRecords(classId)
    setRecords(data)
  }, [classId])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  async function addRecord(studentId, studentName, eventId, eventName, value, memo = '') {
    const record = {
      id: generateId(),
      studentId,
      studentName,
      eventId,
      eventName,
      value: Number(value),
      memo,
      recordedAt: new Date().toISOString(),
    }
    await fs.addRecord(classId, record)
    await loadRecords()
    return record
  }

  function getStudentRecords(studentId) {
    return records.filter(r => r.studentId === studentId)
  }

  function getStudentEventRecords(studentId, eventId) {
    return records
      .filter(r => r.studentId === studentId && r.eventId === eventId)
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
  }

  async function deleteRecord(recordId) {
    await fs.deleteRecord(classId, recordId)
    await loadRecords()
  }

  return {
    records,
    addRecord,
    getStudentRecords,
    getStudentEventRecords,
    deleteRecord,
    refresh: loadRecords,
  }
}
