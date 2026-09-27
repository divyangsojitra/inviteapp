import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const FIREBASE_JWKS_URL = new URL(
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
);

const firebaseJwks = createRemoteJWKSet(FIREBASE_JWKS_URL);

export type VerifiedFirebaseUser = {
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
};

type FirebaseJwtPayload = JWTPayload & {
  email?: string;
  phone_number?: string;
  name?: string;
};

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string
): Promise<VerifiedFirebaseUser> {
  const { payload } = await jwtVerify<FirebaseJwtPayload>(token, firebaseJwks, {
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`
  });

  if (!payload.sub) {
    throw new Error("Firebase token is missing a subject.");
  }

  return {
    firebaseUid: payload.sub,
    email: payload.email ?? null,
    phone: payload.phone_number ?? null,
    displayName: payload.name ?? null
  };
}
