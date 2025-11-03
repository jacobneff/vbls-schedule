import type { ReactNode } from 'react';

export const metadata = {
  title: 'VBLS Admin — Sign In'
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6">
        <div className="w-full space-y-6 rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-lg shadow-slate-900/40">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-widest text-cyan-300">VBLS Scheduler</p>
            <h1 className="text-2xl font-semibold text-slate-100">Sign in to continue</h1>
            <p className="text-sm text-slate-400">Admin & supervisor access only.</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
