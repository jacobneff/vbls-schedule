export const metadata = {
  title: 'VBLS Admin — Scheduler Controls'
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-14">
        <header>
          <p className="text-sm uppercase tracking-widest text-cyan-300">Admin Console</p>
          <h1 className="text-3xl font-semibold">Scheduling & Muster Configuration</h1>
          <p className="mt-2 text-sm text-slate-400">
            Authentication, access control, and editable panels are pending. This stub provides a
            placeholder for forthcoming data management tools.
          </p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">Stands & Zones</h2>
            <p className="mt-2 text-sm text-slate-300">
              CRUD tooling will allow admins to manage stand labels, zone assignments, and AS
              support.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-lg font-semibold text-cyan-200">Seniority & Preferences</h2>
            <p className="mt-2 text-sm text-slate-300">
              Import rosters, edit seniority, and configure guard preference defaults.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
