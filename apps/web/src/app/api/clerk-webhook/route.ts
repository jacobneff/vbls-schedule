import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/server/db';
import { Role } from '@prisma/client';
import type { WebhookEvent } from '@clerk/nextjs/server';

const rawWebhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!rawWebhookSecret) {
  throw new Error('CLERK_WEBHOOK_SECRET is not configured. Add it to your environment.');
}

const webhookSecret = rawWebhookSecret;

function parseRole(value: unknown): Role | null {
  if (typeof value !== 'string') {
    return null;
  }
  const upper = value.toUpperCase();
  return (Object.values(Role) as string[]).includes(upper) ? (upper as Role) : null;
}

function parseYearsAtVBLS(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no'].includes(normalized)) {
      return false;
    }
  }
  return null;
}

type UserWebhookData = WebhookEvent & {
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    primary_email_address_id?: string | null;
    email_addresses?: Array<{
      id: string;
      email_address: string;
    }>;
    private_metadata?: Record<string, unknown> | null;
    public_metadata?: Record<string, unknown> | null;
  };
};

function getPrimaryEmail(event: UserWebhookData['data']): string | null {
  const primaryId = event.primary_email_address_id;
  const emails = event.email_addresses ?? [];
  if (primaryId) {
    const match = emails.find((entry) => entry.id === primaryId);
    if (match) {
      return match.email_address.toLowerCase();
    }
  }
  const fallback = emails[0];
  return fallback ? fallback.email_address.toLowerCase() : null;
}

export async function POST(request: Request) {
  const payload = await request.text();
  const headersList = await headers();

  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix headers' }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    const verifier = new Webhook(webhookSecret);
    const verificationHeaders: Record<string, string> = {
      'svix-id': svixId as string,
      'svix-timestamp': svixTimestamp as string,
      'svix-signature': svixSignature as string
    };
    event = verifier.verify(payload, verificationHeaders) as WebhookEvent;
  } catch (error) {
    console.error('Clerk webhook signature verification failed', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const typedEvent = event as UserWebhookData;
  const email = getPrimaryEmail(typedEvent.data);

  if (!email) {
    return NextResponse.json({ error: 'No email to sync' }, { status: 200 });
  }

  const firstName = typedEvent.data.first_name?.trim() || 'Unknown';
  const lastName = typedEvent.data.last_name?.trim() || 'User';

  const metadataRole =
    parseRole(typedEvent.data.private_metadata?.role) ??
    parseRole(typedEvent.data.public_metadata?.role);

  const yearsAtVBLS =
    parseYearsAtVBLS(typedEvent.data.public_metadata?.yearsAtVBLS) ??
    parseYearsAtVBLS(typedEvent.data.private_metadata?.yearsAtVBLS);

  const isRookie =
    parseBoolean(typedEvent.data.public_metadata?.isRookie) ??
    parseBoolean(typedEvent.data.private_metadata?.isRookie);

  try {
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        await prisma.user.upsert({
          where: { email },
          create: {
            firstName,
            lastName,
            email,
            role: metadataRole ?? Role.GUARD,
            yearsAtVBLS: yearsAtVBLS ?? 0,
            isRookie: isRookie ?? true,
            alwaysOff: []
          },
          update: {
            firstName,
            lastName,
            role: metadataRole ?? undefined,
            yearsAtVBLS: yearsAtVBLS ?? undefined,
            isRookie: isRookie ?? undefined
          }
        });
        break;
      }
      case 'user.deleted': {
        await prisma.user.deleteMany({
          where: { email }
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Failed to process Clerk webhook', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
