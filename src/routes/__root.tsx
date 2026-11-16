import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.includes("~oauth")) {
      // Intercept OAuth redirect loops on self-hosted instances
      window.location.replace("/");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("ShadowXLab PAM Academy Runtime Error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          ShadowXLab PAM Academy | Application Error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred in the simulation runtime. You can reload the workspace or return to overview.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        name: "description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { name: "author", content: "ShadowXLab" },
      { name: "theme-color", content: "#001A33" },
      { name: "application-name", content: "ShadowXLab PAM Academy" },
      { name: "apple-mobile-web-app-title", content: "ShadowXLab PAM" },
      { property: "og:title", content: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        property: "og:description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://cyberark.shadowxlab.com/" },
      { property: "og:image", content: "https://cyberark.shadowxlab.com/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ShadowXLab PAM Academy | Enterprise Privileged Access Training" },
      {
        name: "twitter:description",
        content:
          "ShadowXLab PAM Academy is an enterprise privileged access management training and simulation platform featuring interactive account administration, Safe governance, CPM workflows, PSM session operations, audit trails, and structured administrator learning.",
      },
      { name: "twitter:image", content: "https://cyberark.shadowxlab.com/og-image.png" },
    ],
    links: [
      { rel: "canonical", href: "https://cyberark.shadowxlab.com/" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.includes("~oauth")) {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
