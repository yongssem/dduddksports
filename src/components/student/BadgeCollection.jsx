import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getBadgeStatus } from '../../utils/badgeChecker'
import NavBar from '../common/NavBar'
import Footer from '../common/Footer'

export default function BadgeCollection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [badges, setBadges] = useState([])
  const [selectedBadge, setSelectedBadge] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/')
      return
    }
    async function load() {
      setBadges(await getBadgeStatus(user.classId, user.id))
    }
    load()
  }, [user, navigate])

  const earnedCount = badges.filter(b => b.earned).length

  return (
    <div className="min-h-dvh bg-bg pb-20">
      <div className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-navy text-lg text-center font-display">뱃지 컬렉션 🎖️</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Summary */}
        <div className="card-elevated p-5 mb-6 text-center">
          <div className="text-4xl font-black text-gradient-orange font-display">{earnedCount}<span className="text-lg text-navy/35" style={{WebkitTextFillColor: 'unset'}}>/{badges.length}</span></div>
          <p className="text-sm text-navy/45 mt-1 font-display font-medium">획득한 뱃지</p>
        </div>

        {/* Badge grid */}
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge, i) => (
            <button
              key={i}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-2xl text-center transition-all touch-target ${
                badge.earned
                  ? 'card-elevated'
                  : 'bg-gray-100/80 opacity-45'
              }`}
            >
              <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                {badge.emoji}
              </div>
              <div className={`text-xs font-bold font-display ${badge.earned ? 'text-navy' : 'text-navy/40'}`}>
                {badge.displayName}
              </div>
              {badge.earned && (
                <div className="text-[10px] text-mint font-medium mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </div>
              )}
              {!badge.earned && (
                <div className="text-[10px] text-navy/25 mt-1">미획득</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Badge detail modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBadge(null)}>
          <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl p-7 text-center max-w-xs w-full animate-[modalIn_0.25s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className={`text-6xl mb-3 ${selectedBadge.earned ? '' : 'grayscale'}`}>
              {selectedBadge.emoji}
            </div>
            <h2 className="text-xl font-black text-navy mb-1 font-display">{selectedBadge.displayName}</h2>
            <p className="text-sm text-navy/45 mb-4">{selectedBadge.condition}</p>

            {selectedBadge.earned ? (
              <>
                <div className="bg-gradient-to-r from-mint/10 to-mint/5 rounded-2xl px-4 py-3 mb-3">
                  <p className="text-sm font-bold text-mint font-display">{selectedBadge.detail}</p>
                </div>
                <p className="text-xs text-navy/35">
                  {new Date(selectedBadge.earnedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 획득
                </p>
              </>
            ) : (
              <div className="bg-gray-50 rounded-2xl px-4 py-3">
                <p className="text-sm text-navy/35">아직 획득하지 못했어요</p>
              </div>
            )}

            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-5 px-8 py-3 bg-gradient-to-r from-orange to-orange-light text-white rounded-2xl font-bold touch-target font-display shadow-lg shadow-orange/20"
            >
              닫기
            </button>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.85) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}

      <Footer />
      <NavBar />
    </div>
  )
}
