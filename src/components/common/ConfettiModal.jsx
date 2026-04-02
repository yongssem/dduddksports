import { useEffect, useState } from 'react'

export default function ConfettiModal({ isOpen, onClose, value, unit, eventName }) {
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

      const timer = setTimeout(() => onClose(), 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-navy/30" />

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

      <div className="relative bg-white rounded-2xl shadow-xl p-8 text-center animate-[modalIn_0.3s_ease-out] max-w-xs w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-navy mb-2">멋져요!</h2>
        <p className="text-navy/60 mb-4">{eventName}</p>
        <div className="text-4xl font-black text-orange mb-2">
          {value}<span className="text-xl text-navy/40 ml-1">{unit}</span>
        </div>
        <p className="text-sm text-navy/40">기록이 저장되었습니다</p>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
