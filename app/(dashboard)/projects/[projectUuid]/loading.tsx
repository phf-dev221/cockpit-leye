export default function ProjectLoading() {
  return (
    <div className="space-y-4 py-1">
      <div className="h-44 animate-pulse rounded-[1.5rem] bg-white/60" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-[1.5rem] bg-white/60" />
          <div className="h-72 animate-pulse rounded-[1.5rem] bg-white/60" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/60" />
        </div>
        <div className="space-y-4">
          <div className="h-44 animate-pulse rounded-[1.5rem] bg-white/60" />
          <div className="h-52 animate-pulse rounded-[1.5rem] bg-white/60" />
          <div className="h-56 animate-pulse rounded-[1.5rem] bg-white/60" />
        </div>
      </div>
    </div>
  );
}
