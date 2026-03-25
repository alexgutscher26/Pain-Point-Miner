"use client";

import { useEffect } from "react";
import type { User } from "@/lib/auth";

type UserJotOptions = {
  widget: boolean;
  position: "left" | "right";
  theme: "light" | "dark" | "auto";
};

type UserJotLoadedApi = {
  init: (appId: string, options: UserJotOptions) => void;
  identify?: (user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => void;
};

type UserJotQueuedApi = Record<string, (...args: unknown[]) => unknown>;

type UserJotApi = UserJotLoadedApi | UserJotQueuedApi;

declare global {
  interface Window {
    $ujq?: unknown[][];
    uj?: UserJotApi;
    __userJotInitialized?: boolean;
  }
}

const USERJOT_SRC = "https://cdn.userjot.com/sdk/v2/uj.js";
const USERJOT_APP_ID = "cmmwvda0306en0io2l0qfc9s7";

function ensureQueueShim() {
  window.$ujq = window.$ujq || [];
  if (window.uj) {
    return;
  }

  window.uj = new Proxy({} as UserJotQueuedApi, {
    get:
      (_, property) =>
      (...args: unknown[]) =>
        window.$ujq?.push([String(property), ...args]),
  });
}

function getUserJotIdentity(user: Pick<User, "id" | "email" | "name">) {
  const [firstName, ...rest] = (user.name ?? "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  return {
    id: user.id,
    email: user.email || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
  };
}

export function UserJotWidget({
  user,
}: {
  user?: Pick<User, "id" | "email" | "name"> | null;
}) {
  useEffect(() => {
    ensureQueueShim();

    const initialize = () => {
      if (window.__userJotInitialized) {
        return;
      }

      const userJot = window.uj;

      if (userJot && "init" in userJot && typeof userJot.init === "function") {
        userJot.init(USERJOT_APP_ID, {
          widget: true,
          position: "right",
          theme: "auto",
        });

        if (
          user &&
          "identify" in userJot &&
          typeof userJot.identify === "function"
        ) {
          userJot.identify(getUserJotIdentity(user));
        }

        window.__userJotInitialized = true;
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${USERJOT_SRC}"]`,
    );

    if (existingScript) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = USERJOT_SRC;
    script.type = "module";
    script.async = true;
    script.onload = initialize;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [user]);

  return null;
}
