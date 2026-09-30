import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StorySection from "./StorySection";
import ResponsiveImage from "../ResponsiveImage";
import useMotionAllowed from "../motion/useMotionAllowed";

function normalizeItems(paths = []) {
  return paths
    .map((entry) => {
      if (typeof entry === "string") {
        return { src: entry, caption: "", alt: "" };
      }
      if (entry && typeof entry === "object") {
        const src = entry.src || entry.path || entry.url || "";
        if (!src) return null;
        return {
          src,
          caption: entry.caption || entry.title || "",
          alt: entry.alt || entry.caption || "",
        };
      }
      return null;
    })
    .filter(Boolean);
}

export default function GalleryCard({ title, subtitle, paths = [] }) {
  const items = normalizeItems(paths);
  const motionOk = useMotionAllowed();
  const [openIndex, setOpenIndex] = useState(null);
  const closeBtnRef = useRef(null);
  const titleId = useId();
  const open = openIndex != null;
  const active = open ? items[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(() => {
    setOpenIndex((i) => (i == null ? i : (i - 1 + items.length) % items.length));
  }, [items.length]);
  const showNext = useCallback(() => {
    setOpenIndex((i) => (i == null ? i : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeBtnRef.current?.focus?.(), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, showPrev, showNext]);

  if (!items.length) return null;

  return (
    <StorySection title={title} subtitle={subtitle}>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((item, index) => (
          <button
            key={item.src + index}
            type="button"
            className="overflow-hidden rounded-lg bg-slate-100 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 group"
            onClick={() => setOpenIndex(index)}
            aria-label={
              item.caption
                ? `Open image: ${item.caption}`
                : `Open gallery image ${index + 1}`
            }
          >
            <figure>
              <div className="relative w-full h-48 overflow-hidden">
                <ResponsiveImage
                  src={item.src}
                  alt={item.alt || ""}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              {item.caption ? (
                <figcaption className="px-3 py-2 text-sm text-slate-600">
                  {item.caption}
                </figcaption>
              ) : null}
            </figure>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && active && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={motionOk ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={motionOk ? { opacity: 0 } : undefined}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/80"
              aria-label="Close gallery"
              onClick={close}
            />
            <div className="relative z-10 w-full max-w-4xl flex flex-col gap-3">
              <div className="flex items-center justify-between text-white gap-3">
                <p id={titleId} className="text-sm font-medium">
                  {active.caption || title || "Gallery"}
                  <span className="text-white/60 font-normal">
                    {" "}
                    · {openIndex + 1} / {items.length}
                  </span>
                </p>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={close}
                  className="rounded px-2 py-1 text-white/90 hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="relative flex items-center gap-2">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={showPrev}
                    className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white w-10 h-10"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                )}
                <motion.div
                  key={active.src}
                  className="flex-1 overflow-hidden rounded-lg bg-black/40 relative min-h-[40vh]"
                  initial={motionOk ? { opacity: 0.4 } : false}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResponsiveImage
                    src={active.src}
                    alt={active.alt || active.caption || ""}
                    width={1600}
                    height={900}
                    className="w-full max-h-[75vh] h-auto object-contain mx-auto"
                    sizes="(max-width: 1024px) 100vw, 56rem"
                    priority
                  />
                </motion.div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={showNext}
                    className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white w-10 h-10"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StorySection>
  );
}
