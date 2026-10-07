export default function VantaBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden bg-black"
    >
      <div className="absolute -inset-1/4 animate-pulse bg-[radial-gradient(circle_at_30%_30%,rgba(56,255,56,0.14),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(0,180,255,0.1),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,255,56,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,255,56,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
    </div>
  );
}
