export default function VantaGlobe() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden bg-black"
    >
      <div className="absolute left-1/2 top-1/2 h-[min(80vw,80vh)] w-[min(80vw,80vh)] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border border-green-400/20 shadow-[0_0_100px_rgba(56,255,56,0.15),inset_0_0_100px_rgba(56,255,56,0.1)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,255,56,0.08),transparent_55%)]" />
    </div>
  );
}
