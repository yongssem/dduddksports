export default function Footer({ variant }) {
  const isDark = variant === 'dark'

  return (
    <footer
      className="text-center py-4 px-6 mx-auto rounded-2xl max-w-md relative z-20"
      style={{
        background: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <p
        className="font-display font-medium"
        style={{
          color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
          fontSize: '13px',
        }}
      >
        © 2026{' '}
        <a
          href="https://mumuclass.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity font-bold"
          style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#475569' }}
        >
          무궁무진클래스
        </a>
        {' '}· 용쌤
      </p>
    </footer>
  )
}
