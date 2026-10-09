import type { MiddlewareHandler } from "hono";
import type { AppContext } from "../../app-env";
import { createDatabase } from "../../db/client";
import { UserRepository } from "../users/user.repository";
import { verifyFirebaseIdToken } from "./firebase-auth";

function getBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

function canUseDevAuth(env: AppContext["Bindings"]) {
  return env.APP_ENV !== "production" && env.DEV_AUTH_BYPASS === "true";
}

export const requireAuth: MiddlewareHandler<AppContext> = async (c, next) => {
  const token = getBearerToken(c.req.header("authorization"));

  if (canUseDevAuth(c.env) && token === "dev-local-token") {
    const userRepository = new UserRepository(createDatabase(c.env));
    const currentUser = await userRepository.upsertFirebaseUser({
      firebaseUid: "dev-local-host",
      email: "dev@invieasy.local",
      displayName: "Dev Host"
    });

    c.set("currentUser", currentUser);
    return next();
  }

  const projectId = c.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    return c.json(
      {
        error: {
          code: "AUTH_NOT_CONFIGURED",
          message: "Firebase authentication is not configured."
        }
      },
      500
    );
  }

  if (!token) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in to continue."
        }
      },
      401
    );
  }

  try {
    const firebaseUser = await verifyFirebaseIdToken(token, projectId);
    const userRepository = new UserRepository(createDatabase(c.env));
    const currentUser = await userRepository.upsertFirebaseUser(firebaseUser);

    c.set("currentUser", currentUser);
  } catch {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Your session is invalid or expired."
        }
      },
      401
    );
  }

  return next();
};
