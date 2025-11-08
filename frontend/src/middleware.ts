import { useUser } from "@clerk/nextjs";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/sign-up(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);

  if (userId && isPublicRoute(req)) {
    url.pathname = "/dashboard";
    return Response.redirect(url);
  }

  if (!isPublicRoute(req)) {
    const home = new URL("/", req.url).toString();
    await auth.protect({
      unauthenticatedUrl: home,
      unauthorizedUrl: home,
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
