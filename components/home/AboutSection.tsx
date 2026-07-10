export default function AboutSection() {
  return (
    <section className="border-y border-black/10 bg-neutral-50 px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
          About
        </span>
        <h2 className="mb-4 mt-3 text-3xl font-black">
          What is Rate Your Professors?
        </h2>
        <p className="leading-relaxed text-neutral-600">
          <a
            href="https://rypet.vercel.app"
            className="font-bold text-black underline"
          >
            rypet.vercel.app
          </a>{" "}
          is a free, open platform where students across Ethiopia share honest
          reviews of universities and professors. Search any campus or lecturer,
          read real student experiences, and add your own to help others make
          informed academic choices.
        </p>
      </div>
    </section>
  );
}
