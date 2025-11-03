import { currentUser } from '@clerk/nextjs/server';
import { Role } from '@prisma/client';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { prisma } from '@/server/db';

const LOGIN_ROUTE = '/login';
const UNAUTHORIZED_LOGIN_ROUTE = '/login?unauthorized=1';

const userSelection = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true
} as const;

export type CurrentAppUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

function normalizeEmail(value?: string | null) {
  return typeof value === 'string' && value.length > 0 ? value.toLowerCase() : null;
}

function parseRole(value: unknown): Role | null {
  if (typeof value !== 'string') {
    return null;
  }
  const asRole = value.toUpperCase();
  return (Object.values(Role) as string[]).includes(asRole) ? (asRole as Role) : null;
}

async function resolveUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const primaryEmail =
    normalizeEmail(clerkUser.primaryEmailAddress?.emailAddress) ??
    normalizeEmail(clerkUser.emailAddresses[0]?.emailAddress);

  if (!primaryEmail) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: primaryEmail },
    select: userSelection
  });

  if (existingUser) {
    return existingUser;
  }

  const firstName = clerkUser.firstName?.trim() || 'Unknown';
  const lastName = clerkUser.lastName?.trim() || 'User';
  const metadataRole =
    parseRole((clerkUser.privateMetadata as Record<string, unknown> | undefined)?.role) ??
    parseRole((clerkUser.publicMetadata as Record<string, unknown> | undefined)?.role) ??
    null;

  const privilegedUserExists = await prisma.user.count({
    where: {
      role: {
        in: [Role.ADMIN, Role.SUPERVISOR]
      }
    }
  });

  const assignedRole =
    metadataRole ?? (privilegedUserExists === 0 ? Role.ADMIN : Role.GUARD);

  const createdUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: primaryEmail,
      role: assignedRole,
      yearsAtVBLS: 0,
      isRookie: true,
      alwaysOff: []
    },
    select: userSelection
  });

  return createdUser;
}

export const getCurrentUser = cache(async (): Promise<CurrentAppUser | null> => {
  const user = await resolveUser();
  return user;
});

export async function requireUser(redirectTo: string = LOGIN_ROUTE) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo as Route);
  }
  return user;
}

export async function requireUserWithRole(roles: Role[], redirectTo: string = LOGIN_ROUTE) {
  const user = await requireUser(redirectTo);
  if (!roles.includes(user.role)) {
    const target = redirectTo === LOGIN_ROUTE ? UNAUTHORIZED_LOGIN_ROUTE : redirectTo;
    redirect(target as Route);
  }
  return user;
}
