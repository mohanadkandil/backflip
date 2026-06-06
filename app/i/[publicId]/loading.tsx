export default function ViewerLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div className="h-5 w-32 rounded shimmer" />
      <div className="aspect-[4/3] rounded-[var(--radius)] shimmer" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded shimmer" />
        <div className="h-10 w-32 rounded shimmer" />
      </div>
    </div>
  );
}
