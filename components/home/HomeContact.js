import Link from "next/link";

export default function HomeContact({ settings }) {
  const email = settings?.contact?.email;
  if (!email && !settings) return null;

  return (
    <section
      id="contact"
      className="home-section home-contact py-16 md:py-24"
      aria-label="Contact"
    >
      <div className="max-w-screen-md mx-auto px-4 text-center">
        <p className="font-display text-xs tracking-[0.2em] uppercase text-[var(--color-brand)] mb-2">
          Next step
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-[var(--color-ink)]">
          Let&apos;s work together
        </h2>
        <p className="mt-3 text-[var(--color-muted)] max-w-lg mx-auto">
          Open to design, IT support, e-commerce, and operations collaborations.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="bg-[var(--color-brand)] text-white px-5 py-3 hover:brightness-110 transition"
          >
            Get in touch
          </Link>
          {email && (
            <a
              href={`mailto:${email}`}
              className="border border-[var(--color-brand)] text-[var(--color-brand)] px-5 py-3 hover:bg-blue-50 transition"
            >
              {email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
