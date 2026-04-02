export function getPersonalBest(records, direction) {
  if (records.length === 0) return null
  return records.reduce((best, r) => {
    if (!best) return r
    if (direction === 'low') return r.value < best.value ? r : best
    return r.value > best.value ? r : best
  }, null)
}

export function calculateAchievementRate(value, targetValue, direction) {
  if (!targetValue || targetValue === 0) return 0
  let rate
  if (direction === 'low') {
    rate = (targetValue / value) * 100
  } else {
    rate = (value / targetValue) * 100
  }
  return Math.min(rate, 150) // cap at 150%
}

export function calculateImprovement(records, direction) {
  if (records.length < 2) return null
  const sorted = [...records].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
  const first = sorted[0]
  const latest = sorted[sorted.length - 1]
  const diff = latest.value - first.value
  const improved = direction === 'low' ? diff < 0 : diff > 0
  return { diff: Math.abs(diff), improved, first: first.value, latest: latest.value }
}

export function formatValue(value, unit) {
  if (typeof value !== 'number') return '-'
  const isDecimal = ['초', 'cm', 'kg', 'm'].includes(unit)
  const formatted = isDecimal ? value.toFixed(1) : Math.round(value)
  return `${formatted}${unit}`
}
