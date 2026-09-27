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

export const requireAuth: MiddlewareHandler<AppContext> = async (c, next) => {
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

  const token = getBearerToken(c.req.header("authorization"));

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
