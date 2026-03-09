import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { db } from "./db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    emailAndPassword: {
        enabled: true,
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path !== "/sign-up/email" && ctx.path !== "/sign-in/email") {
                return;
            }

            const email = typeof ctx.body?.email === "string" ? ctx.body.email.trim().toLowerCase() : "";

            if (!email) {
                throw new APIError("BAD_REQUEST", {
                    message: "Email is required.",
                });
            }

            if (ctx.path === "/sign-up/email") {
                const name = typeof ctx.body?.name === "string" ? ctx.body.name.trim() : "";

                if (!name) {
                    throw new APIError("BAD_REQUEST", {
                        message: "Name is required.",
                    });
                }

                return {
                    context: {
                        ...ctx,
                        body: {
                            ...ctx.body,
                            email,
                            name,
                        },
                    },
                };
            }

            return {
                context: {
                    ...ctx,
                    body: {
                        ...ctx.body,
                        email,
                    },
                },
            };
        }),
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
