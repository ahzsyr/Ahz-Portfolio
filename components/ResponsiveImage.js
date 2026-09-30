/**
 * Responsive next/image wrapper — lazy by default, sizes required.
 * Relies on next.config images.unoptimized for self-hosted deploys.
 */

import Image from "next/image";

const DEFAULT_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

export default function ResponsiveImage({
  src,
  alt = "",
  fill = false,
  width,
  height,
  sizes = DEFAULT_SIZES,
  priority = false,
  className = "",
  style,
  ...rest
}) {
  if (!src) return null;

  const common = {
    src,
    alt: alt || "",
    sizes,
    priority,
    loading: priority ? undefined : "lazy",
    className,
    style,
    ...rest,
  };

  if (fill) {
    return <Image {...common} fill alt={common.alt} />;
  }

  return (
    <Image
      {...common}
      width={width || 800}
      height={height || 600}
      alt={common.alt}
    />
  );
}
