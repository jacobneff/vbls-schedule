import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

import { getCurrentUser } from '@/server/auth/session';
import { SignOutPrompt } from '../SignOutPrompt';

export const metadata = {
  title: 'VBLS Scheduler — Sign In'
};

export default async function LoginPage() {
  const currentUser = await getCurrentUser();
  const isAuthorized =
    currentUser && (currentUser.role === Role.ADMIN || currentUser.role === Role.SUPERVISOR);

  if (isAuthorized) {
    redirect('/admin');
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-100">Sign in to VBLS Scheduler</h1>
        <p className="mt-2 text-sm text-slate-400">
          Use your VBLS admin credentials. Access is limited to authorized supervisors and admins.
        </p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-8 shadow-xl">
        <SignIn signUpUrl="/login" afterSignInUrl="/admin" afterSignUpUrl="/admin" />
      </div>
      {currentUser && !isAuthorized ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm text-rose-400">
            You are signed in but do not have admin access. Contact a VBLS administrator if you
            believe this is incorrect.
          </p>
          <SignOutPrompt />
        </div>
      ) : null}
    </div>
  );
}
