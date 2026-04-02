import { getEvents } from '../hooks/useClass'
import { getPersonalBest } from './scoreCalculator'
import * as fs from '../services/firestore'
import { generateId } from './constants'

export async function getEarnedBadges(classId) {
  return fs.getEarnedBadges(classId)
}

/**
 * Run badge checks for a student after a record is saved.
 * Returns array of newly earned badges (empty if none).
 */
export async function checkBadges(classId, studentId, allRecords) {
  const earned = await getEarnedBadges(classId)
  const studentRecords = allRecords.filter(r => r.studentId === studentId)
  const events = (await getEvents(classId)).filter(e => e.isActive)
  const newBadges = []

  function alreadyHas(badgeName) {
    return earned.some(b => b.studentId === studentId && b.badgeName === badgeName)
  }

  function award(badgeName, emoji, description, detail) {
    if (alreadyHas(badgeName)) return
    const badge = {
      id: generateId(),
      studentId,
      badgeName,
      emoji,
      description,
      detail,
      earnedAt: new Date().toISOString(),
    }
    earned.push(badge)
    newBadges.push(badge)
  }

  // 🌱 첫 발자국: 최초 1회 기록
  if (studentRecords.length >= 1) {
    award('첫 발자국', '🌱', '최초 1회 기록 입력', '첫 기록을 남겼어요!')
  }

  // 🔥 꾸준왕: 5회 이상 기록
  if (studentRecords.length >= 5) {
    award('꾸준왕', '🔥', '5회 이상 기록 입력', `총 ${studentRecords.length}회 기록!`)
  }

  // 📈 성장왕: 동일 종목 3회 연속 향상
  for (const event of events) {
    const eventRecords = studentRecords
      .filter(r => r.eventId === event.id)
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))

    if (eventRecords.length >= 3) {
      for (let i = 0; i <= eventRecords.length - 3; i++) {
        const slice = eventRecords.slice(i, i + 3)
        const improving = event.direction === 'high'
          ? slice[0].value < slice[1].value && slice[1].value < slice[2].value
          : slice[0].value > slice[1].value && slice[1].value > slice[2].value
        if (improving) {
          award('성장왕', '📈', '동일 종목 3회 연속 기록 향상', `${event.name}에서 연속 성장!`)
          break
        }
      }
    }
  }

  // ⭐ 종목마스터: 특정 종목 목표값 달성
  for (const event of events) {
    const eventRecords = studentRecords.filter(r => r.eventId === event.id)
    if (eventRecords.length === 0) continue
    const best = getPersonalBest(eventRecords, event.direction)
    const achieved = event.direction === 'high'
      ? best.value >= event.targetValue
      : best.value <= event.targetValue
    if (achieved) {
      const masterKey = `종목마스터_${event.id}`
      if (!alreadyHas(masterKey)) {
        award(masterKey, '⭐', '종목 목표값 달성', `${event.name} 목표 달성!`)
      }
    }
  }

  // 👑 올라운더: 전 활성 종목 1회 이상 기록
  if (events.length > 0) {
    const recordedEventIds = new Set(studentRecords.map(r => r.eventId))
    const allRecorded = events.every(e => recordedEventIds.has(e.id))
    if (allRecorded) {
      award('올라운더', '👑', '전 종목 1회 이상 기록 보유', '모든 종목에 기록을 남겼어요!')
    }
  }

  // 🏆 뚝딱체력왕: 전 활성 종목 목표값 달성
  if (events.length > 0) {
    const allTargets = events.every(event => {
      const eventRecords = studentRecords.filter(r => r.eventId === event.id)
      if (eventRecords.length === 0) return false
      const best = getPersonalBest(eventRecords, event.direction)
      return event.direction === 'high'
        ? best.value >= event.targetValue
        : best.value <= event.targetValue
    })
    if (allTargets) {
      award('뚝딱체력왕', '🏆', '전 종목 목표값 달성', '모든 종목의 목표를 달성했어요!')
    }
  }

  // Save newly earned badges to Firestore
  for (const badge of newBadges) {
    await fs.saveEarnedBadge(classId, badge)
  }

  return newBadges
}

/**
 * Get all badge definitions with earned status for a student.
 */
export async function getBadgeStatus(classId, studentId) {
  const earned = (await getEarnedBadges(classId)).filter(b => b.studentId === studentId)
  const events = (await getEvents(classId)).filter(e => e.isActive)

  const baseBadges = [
    { name: '첫 발자국', emoji: '🌱', condition: '최초 1회 기록 입력' },
    { name: '꾸준왕', emoji: '🔥', condition: '5회 이상 기록 입력' },
    { name: '성장왕', emoji: '📈', condition: '동일 종목 3회 연속 기록 향상' },
    { name: '올라운더', emoji: '👑', condition: '전 종목 1회 이상 기록 보유' },
    { name: '뚝딱체력왕', emoji: '🏆', condition: '전 종목 목표값 달성' },
  ]

  // Add per-event 종목마스터 badges
  const masterBadges = events.map(e => ({
    name: `종목마스터_${e.id}`,
    displayName: `종목마스터: ${e.name}`,
    emoji: '⭐',
    condition: `${e.name} 목표값(${e.targetValue}${e.unit}) 달성`,
  }))

  const allBadges = [...baseBadges, ...masterBadges]

  return allBadges.map(badge => {
    const earnedBadge = earned.find(b => b.badgeName === badge.name)
    return {
      ...badge,
      displayName: badge.displayName || badge.name,
      earned: !!earnedBadge,
      earnedAt: earnedBadge?.earnedAt || null,
      detail: earnedBadge?.detail || null,
    }
  })
}
