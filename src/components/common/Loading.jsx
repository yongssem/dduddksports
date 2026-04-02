export default function Loading() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-bg">
      <div className="w-12 h-12 border-4 border-orange/30 border-t-orange rounded-full animate-spin" />
      <p className="mt-4 text-navy/60 text-sm">로딩 중...</p>
    </div>
  )
}
