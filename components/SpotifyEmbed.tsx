type Props = {
  playlistId: string | null;
  compact?: boolean;
};

export default function SpotifyEmbed({ playlistId, compact = true }: Props) {
  if (!playlistId) return null;
  const height = compact ? 80 : 352;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(640px,calc(100vw-2rem))] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <iframe
        title="Spotify playlist"
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
        width="100%"
        height={height}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style={{ border: 0, display: "block" }}
      />
    </div>
  );
}
