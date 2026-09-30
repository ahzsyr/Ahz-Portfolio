import StorySection from "./StorySection";
import ResponsiveImage from "../ResponsiveImage";

export default function MediaCard({ title, subtitle, src, alt }) {
  if (!src) return null;
  return (
    <StorySection title={title} subtitle={subtitle}>
      <figure className="overflow-hidden rounded-lg relative w-full aspect-[16/10] max-h-[28rem]">
        <ResponsiveImage
          src={src}
          alt={alt || ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 48rem"
        />
      </figure>
    </StorySection>
  );
}
