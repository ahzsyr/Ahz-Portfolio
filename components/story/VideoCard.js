import StorySection from "./StorySection";

function isDirectVideo(src) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src || "");
}

export default function VideoCard({ title, subtitle, src }) {
  if (!src) return null;

  return (
    <StorySection title={title} subtitle={subtitle}>
      <div className="overflow-hidden rounded-lg bg-slate-900 aspect-video">
        {isDirectVideo(src) ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={src}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            title={title || "Video"}
            src={src}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </StorySection>
  );
}
