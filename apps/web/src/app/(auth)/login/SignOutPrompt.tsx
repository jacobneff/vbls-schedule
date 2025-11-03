'use client';

import { SignOutButton } from '@clerk/nextjs';

export function SignOutPrompt() {
  return (
    <SignOutButton redirectUrl="/login">
      <button className="inline-flex items-center justify-center rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-200">
        Sign out
      </button>
    </SignOutButton>
  );
}
