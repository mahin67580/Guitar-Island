export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-brass border-t-transparent animate-spin" />
        <p className="text-sm text-ink/50">Loading dashboard...</p>
      </div>
    </div>
  );
}