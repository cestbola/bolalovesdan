import { unlockAction } from "./actions";

export const metadata = { title: "Enter PIN" };

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen w-full bg-black flex items-center justify-center px-4">
      <form
        action={unlockAction}
        className="w-full max-w-sm space-y-4 text-center"
      >
        <h1
          className="text-2xl text-neutral-100"
          style={{ fontFamily: "var(--font-serif), serif", fontWeight: 400 }}
        >
          enter pin
        </h1>
        <input
          name="pin"
          type="password"
          autoFocus
          autoComplete="off"
          required
          placeholder="•••••"
          className="w-full bg-black border border-white/20 rounded px-4 py-3 text-center text-neutral-100 tracking-widest focus:outline-none focus:border-white/60"
        />
        {error ? (
          <p className="text-sm text-red-400">incorrect pin</p>
        ) : null}
        <button
          type="submit"
          className="w-full bg-white text-black py-2.5 rounded font-medium hover:bg-neutral-200"
        >
          unlock
        </button>
      </form>
    </main>
  );
}
