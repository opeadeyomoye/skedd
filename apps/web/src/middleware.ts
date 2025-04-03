import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isAllAccessRoute = createRouteMatcher(['/', '/privacy'])
const isGuestOnlyRoute = createRouteMatcher([])

export default clerkMiddleware(async (auth, req) => {
  if (isAllAccessRoute(req)) return
  if (isGuestOnlyRoute(req)) {
    if ((await auth()).userId) {
      // move them to an authenticated route
    }
  }

  await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
