import { clerkMiddleware } from '@clerk/nextjs/server';

const loginPrefix = '/login';
const ignoredPrefixes = ['/api/clerk-webhook'];
const publicPrefixes = ['/api/stands'];

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return;
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname === loginPrefix ||
    pathname.startsWith(`${loginPrefix}/`) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isPublicRoute) {
    return;
  }

  await auth.protect();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
