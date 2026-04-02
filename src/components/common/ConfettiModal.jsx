import { useEffect, useState } from 'react'

export default function ConfettiModal({ isOpen, onClose, value, unit, eventName, badges = [] }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#FF6B35', '#2EC4B6', '#FFD700', '#FF69B4', '#7B68EE'][Math.floor(Math.random() * 5)],
        size: 6 + Math.random() * 6,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => onClose(), badges.length > 0 ? 4000 : 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm" />

      {/* Confetti */}
      {particles.map(p => (
        <div
          key={p.id}
          className="fixed top-0 animate-[confettiFall_1.5s_ease-in_forwards]"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 text-center animate-[modalIn_0.3s_ease-out] max-w-xs w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-navy mb-2 font-display">멋져요!</h2>
        <p className="text-navy/50 mb-4 font-display">{eventName}</p>
        <div className="text-4xl font-black text-gradient-orange font-display mb-2">
          {value}<span className="text-xl text-navy/35 ml-1" style={{WebkitTextFillColor: 'unset'}}>{unit}</span>
        </div>
        <p className="text-sm text-navy/35">기록이 저장되었습니다</p>

        {badges.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm font-bold text-mint mb-3 font-display">🎖️ 새 뱃지 획득!</p>
            <div className="flex flex-col gap-2">
              {badges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-gradient-to-r from-mint/10 to-mint/5 rounded-2xl px-3.5 py-2.5">
                  <span className="text-2xl">{badge.emoji}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-navy font-display">{badge.badgeName}</div>
                    <div className="text-xs text-navy/45">{badge.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
