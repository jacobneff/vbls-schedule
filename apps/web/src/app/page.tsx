'use client';

import Link from 'next/link';
import type { Route } from 'next';

const quickLinks: Array<{ href: string; label: string }> = [
  { href: '/admin', label: 'Admin Console (coming soon)' },
  { href: '/muster', label: 'Daily Muster' },
  { href: '/scheduler', label: 'Weekly Scheduler' }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-14">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-widest text-cyan-300">
            Virginia Beach Lifesaving Service
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">
            Lifeguard Scheduling & Muster System
          </h1>
          <p className="text-lg text-slate-300">
            Automate weekly assignments, keep day-of flexibility, and give guards the tools they
            need on the sand. This interface is the launchpad for administrators and supervisors.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href as Route}
              className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 transition hover:border-cyan-400 hover:bg-slate-900"
            >
              <p className="text-sm font-medium text-cyan-300">Preview</p>
              <p className="text-base font-semibold">{label}</p>
              <p className="text-xs text-slate-400">Build in progress</p>
            </Link>
          ))}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-cyan-200">Next Up</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-300">
            <li>Wire up authentication and role-based access.</li>
            <li>Implement admin tools for stands, zones, and seniority management.</li>
            <li>Develop availability intake with parser support.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
