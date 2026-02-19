export default function StatsSection() {
  return (
    <section className="border-y border-black/5 bg-neutral-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        {[
          ["70+", "Universities"],
          ["12k+", "Professors"],
          ["45k+", "Reviews"],
          ["100%", "Authentic"],
        ].map(([value, label]) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-black">{value}</div>
            <div className="mt-1 text-xs font-bold uppercase text-neutral-500">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
