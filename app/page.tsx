import { readItems, readSettings } from "@/lib/items";
import Pinboard from "@/components/Pinboard";
import SpotifyEmbed from "@/components/SpotifyEmbed";

export default async function Home() {
  const [items, settings] = await Promise.all([readItems(), readSettings()]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black">
      <header className="relative z-10 pt-16 pb-8 text-center pointer-events-none">
        <h1
          className="text-5xl sm:text-6xl tracking-tight text-neutral-100"
          style={{ fontFamily: "var(--font-serif), serif", fontWeight: 400 }}
        >
          {settings.heading}
        </h1>
        {settings.subheading ? (
          <p
            className="mt-3 text-neutral-400"
            style={{ fontFamily: "var(--font-hand), cursive", fontSize: "1.5rem" }}
          >
            {settings.subheading}
          </p>
        ) : null}
      </header>

      <Pinboard items={items} />

      <SpotifyEmbed playlistId={settings.spotifyPlaylistId} />
    </main>
  );
}
