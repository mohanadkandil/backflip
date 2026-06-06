const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"];

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div className="flex items-baseline justify-between gap-2">
        <div className="h-7 w-32 rounded shimmer" />
        <div className="h-4 w-24 rounded shimmer" />
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_KEYS.map((k) => (
          <li
            key={k}
            className="overflow-hidden rounded-[var(--radius)] border"
          >
            <div className="aspect-square shimmer" />
            <div className="flex items-center justify-between p-3">
              <div className="h-3 w-20 rounded shimmer" />
              <div className="h-6 w-12 rounded shimmer" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
