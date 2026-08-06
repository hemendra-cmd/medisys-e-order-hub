import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import {
  useEffect,
  type ReactNode,
} from "react";

import appCss from "../styles.css?url";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import logoAsset from "@/assets/MEDISYS.jpeg";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">
          404
        </h1>

        <h2 className="mt-4 text-xl font-semibold">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong.
        </p>

        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-white"
          >
            Try Again
          </button>

          <a
            href="/"
            className="rounded-md border px-4 py-2"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{
    queryClient: QueryClient;
  }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1",
        },
        {
          title:
            "Medisys — B2B Ordering for Labs & Diagnostics",
        },
        {
          name: "description",
          content:
            "Order pathological equipment, reagents, rapid tests, biochemistry items and lab accessories from Medisys.",
        },
        {
          property: "og:title",
          content:
            "Medisys — B2B Ordering for Labs & Diagnostics",
        },
        {
          property: "og:description",
          content:
            "Trusted supplier for diagnostic laboratories.",
        },
        {
          property: "og:image",
          content: logoAsset,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],

      links: [
  { rel: "stylesheet", href: appCss },

  { rel: "icon", href: "/favicon.ico" },

  { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },

  { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },

  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } =
    Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <WhatsAppFab />
      <Analytics />
    </QueryClientProvider>
  );
}
