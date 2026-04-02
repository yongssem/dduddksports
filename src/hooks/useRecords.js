import { useState, useEffect, useCallback } from 'react'
import { generateId } from '../utils/constants'

function getRecordsKey(classId) {
  return `fithero_records_${classId}`
}

function getAllRecords(classId) {
  return JSON.parse(localStorage.getItem(getRecordsKey(classId)) || '[]')
}

function saveAllRecords(classId, records) {
  localStorage.setItem(getRecordsKey(classId), JSON.stringify(records))
}

export function useRecords(classId) {
  const [records, setRecords] = useState([])

  const loadRecords = useCallback(() => {
    if (!classId) return
    setRecords(getAllRecords(classId))
  }, [classId])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  function addRecord(studentId, studentName, eventId, eventName, value, memo = '') {
    const all = getAllRecords(classId)
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
    all.push(record)
    saveAllRecords(classId, all)
    loadRecords()
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

  function deleteRecord(recordId) {
    const all = getAllRecords(classId).filter(r => r.id !== recordId)
    saveAllRecords(classId, all)
    loadRecords()
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
