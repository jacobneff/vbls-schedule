'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/server/db';
import { Role } from '@prisma/client';
import { requireUserWithRole } from '@/server/auth/session';

const ADMIN_ROUTE = '/admin';

function parseInteger(value: FormDataEntryValue | null, field: string): number {
  if (typeof value !== 'string') {
    throw new Error(`Missing ${field}`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`Missing ${field}`);
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field}`);
  }
  return parsed;
}

export async function updateUserSeniorityAction(formData: FormData) {
  await requireUserWithRole([Role.ADMIN]);

  const userId = parseInteger(formData.get('userId'), 'userId');
  const yearsAtVBLS = parseInteger(formData.get('yearsAtVBLS'), 'yearsAtVBLS');
  const roleValue = formData.get('role');
  const isRookie = formData.get('isRookie') === 'on';

  if (typeof roleValue !== 'string' || !Object.values(Role).includes(roleValue as Role)) {
    throw new Error('Invalid role selection');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      yearsAtVBLS,
      isRookie,
      role: roleValue as Role
    },
    select: {
      email: true
    }
  });

  const email = updatedUser.email;

  if (email) {
    try {
      const client = await clerkClient();
      const matchingUsers = await client.users.getUserList({
        emailAddress: [email]
      });

      const clerkUser = matchingUsers[0];
      if (clerkUser) {
        const currentPrivateMetadata =
          (clerkUser.privateMetadata as Record<string, unknown> | undefined) ?? {};
        const currentPublicMetadata =
          (clerkUser.publicMetadata as Record<string, unknown> | undefined) ?? {};

        await client.users.updateUser(clerkUser.id, {
          privateMetadata: {
            ...currentPrivateMetadata,
            role: roleValue
          },
          publicMetadata: {
            ...currentPublicMetadata,
            yearsAtVBLS,
            isRookie
          }
        });
      }
    } catch (error) {
      console.error('Failed to sync Clerk metadata', error);
    }
  }

  revalidatePath(ADMIN_ROUTE);
}
