import { ArrowRight, Cloud, Database, LockKeyhole } from "lucide-react";
import { CoMark } from "@/components/co-mark";
import { resendConfirmation, signIn, signUp } from "@/app/login/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:py-20">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section>
          <div className="flex items-center gap-3"><CoMark size={38} /><span className="font-display text-3xl text-landing">career-ops</span></div>
          <p className="mt-8 max-w-2xl font-display text-4xl leading-tight text-landing sm:text-5xl">Your live career workspace, available from any computer.</p>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted">Your tracker, reports, CV metadata, and job pipeline are stored in your private cloud workspace. Local tools and the Vercel dashboard read the same source.</p>
          <div className="mt-8 grid gap-3 text-sm text-muted sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-4"><Cloud className="mb-3 size-5 text-brand" />Works while your PC is offline</div>
            <div className="rounded-xl border border-border bg-surface p-4"><Database className="mb-3 size-5 text-brand" />One synchronized dataset</div>
            <div className="rounded-xl border border-border bg-surface p-4"><LockKeyhole className="mb-3 size-5 text-brand" />Private per-user access</div>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
          <h1 className="font-display text-2xl text-landing">Sign in to your dashboard</h1>
          <p className="mt-2 text-sm text-muted">Create the account once, then use the same login on localhost and Vercel.</p>
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          {message && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}
          <form className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Email<input name="email" type="email" autoComplete="email" required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-brand" /></label>
            <label className="block text-sm font-medium">Password<input name="password" type="password" autoComplete="current-password" minLength={8} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-brand" /></label>
            <button formAction={signIn} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-200">Sign in <ArrowRight className="size-4" /></button>
            <button formAction={signUp} className="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-hover">Create private workspace</button>
            <button formAction={resendConfirmation} className="w-full text-sm text-muted underline underline-offset-4 hover:text-foreground">Resend confirmation email</button>
          </form>
        </section>
      </div>
    </main>
  );
}
