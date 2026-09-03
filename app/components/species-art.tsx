type SpeciesArtProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

export function SpeciesArt({ src, alt, className = "" }: SpeciesArtProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${alt} image unavailable`}
        className={`absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.7),transparent_35%),linear-gradient(135deg,var(--cream),var(--border))] ${className}`}
      />
    );
  }

  return (
    // Catalogue URLs are curated by the WildQuest database.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
