export const DEFAULT_PAPS_EVENTS = [
  { name: '왕복오래달리기', unit: '회', direction: 'high', targetValue: 50, type: 'paps' },
  { name: '50m 달리기', unit: '초', direction: 'low', targetValue: 9.0, type: 'paps' },
  { name: '앉아윗몸앞으로굽히기', unit: 'cm', direction: 'high', targetValue: 15, type: 'paps' },
  { name: '윗몸말아올리기', unit: '회', direction: 'high', targetValue: 30, type: 'paps' },
  { name: '악력', unit: 'kg', direction: 'high', targetValue: 20, type: 'paps' },
]

export const DEFAULT_BADGES = [
  { name: '첫 발자국', emoji: '🌱', conditionType: 'first_record', conditionValue: null, description: '최초 1회 기록 입력' },
  { name: '꾸준왕', emoji: '🔥', conditionType: 'record_count', conditionValue: 5, description: '5회 이상 기록 입력' },
  { name: '성장왕', emoji: '📈', conditionType: 'consecutive_improve', conditionValue: 3, description: '동일 종목 3회 연속 기록 향상' },
  { name: '종목마스터', emoji: '⭐', conditionType: 'target_achieved', conditionValue: null, description: '특정 종목 목표값 달성' },
  { name: '올라운더', emoji: '👑', conditionType: 'all_events', conditionValue: null, description: '전 종목 1회 이상 기록 보유' },
  { name: '뚝딱체력왕', emoji: '🏆', conditionType: 'all_targets', conditionValue: null, description: '전 종목 목표값 달성' },
]

export const INVITE_CODE_LENGTH = 6

export const EVENT_ICONS = {
  '왕복오래달리기': '🏃',
  '50m 달리기': '⚡',
  '앉아윗몸앞으로굽히기': '🤸',
  '윗몸말아올리기': '💪',
  '악력': '✊',
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
