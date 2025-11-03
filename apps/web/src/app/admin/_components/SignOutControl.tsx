'use client';

import { SignOutButton } from '@clerk/nextjs';

type SignOutControlProps = {
  className?: string;
};

export function SignOutControl({ className }: SignOutControlProps) {
  return (
    <SignOutButton redirectUrl="/login">
      <button
        type="button"
        className={
          className ??
          'inline-flex items-center rounded-md border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-rose-400 hover:text-rose-200'
        }
      >
        Sign out
      </button>
    </SignOutButton>
  );
}
