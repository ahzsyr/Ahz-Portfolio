import { Link } from "react-scroll";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { siteConfig } from "../config/site";

export const Hero = ({ settings }) => {
  const cfg = settings || siteConfig;
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative mt-16 lg:mt-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.18),_transparent_55%),linear-gradient(180deg,#eef4ff_0%,#f7f9fc_45%,#ffffff_100%)]" />
      <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16 py-10 lg:py-16">
        <div className="w-full lg:w-1/2 flex flex-col items-start">
          <p className="font-display text-sm tracking-[0.2em] uppercase text-[var(--color-brand)] mb-4">
            {cfg.siteName}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-[var(--color-ink)] leading-[1.05]">
            {cfg.personName}
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-[var(--color-ink)]/80 font-medium">
            {cfg.headline}
          </p>
          <p className="mt-4 text-base md:text-lg text-[var(--color-muted)] max-w-xl">
            {cfg.heroSupporting}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={cfg.resumePath}
              download
              className="bg-[var(--color-brand)] text-white px-5 py-3 shadow hover:brightness-110 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
            >
              Download Resume
            </a>
            <Link
              to="featured"
              spy
              smooth
              offset={-35}
              duration={reduceMotion ? 0 : 800}
              className="border border-[var(--color-brand)] text-[var(--color-brand)] px-5 py-3 cursor-pointer hover:bg-blue-50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
            >
              View Featured Work
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative w-64 h-80 md:w-80 md:h-[28rem] overflow-hidden shadow-xl"
          >
            <Image
              src="/images/profile.png"
              className="object-cover"
              alt={`${cfg.personName} profile image`}
              fill
              sizes="(max-width: 768px) 16rem, 20rem"
              priority
            />
          </motion.div>
        </div>
      </div>

      {!reduceMotion && (
        <motion.div
          animate={{ translateY: [0, 18] }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="hidden md:flex absolute bottom-2 left-1/2 -translate-x-1/2"
        >
          <Link to="featured" spy smooth offset={-35} duration={800}>
            <button
              type="button"
              aria-label="Scroll to featured projects"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[var(--color-brand)] text-[var(--color-brand)]"
            >
              ↓
            </button>
          </Link>
        </motion.div>
      )}
    </section>
  );
};
