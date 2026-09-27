import { eq } from "drizzle-orm";
import type { CurrentUser } from "../../app-env";
import type { Database } from "../../db/client";
import { users } from "../../db/schema";

type FirebaseUserInput = {
  firebaseUid: string;
  email?: string | null;
  phone?: string | null;
  displayName?: string | null;
};

export class UserRepository {
  constructor(private readonly db: Database) {}

  async upsertFirebaseUser(input: FirebaseUserInput): Promise<CurrentUser> {
    const fallbackUser = {
      id: crypto.randomUUID(),
      firebaseUid: input.firebaseUid,
      email: input.email ?? null,
      phone: input.phone ?? null,
      displayName: input.displayName ?? null
    };

    if (!this.db) {
      return fallbackUser;
    }

    const now = new Date();
    const [user] = await this.db
      .insert(users)
      .values({
        firebaseUid: input.firebaseUid,
        email: input.email,
        phone: input.phone,
        displayName: input.displayName,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: {
          email: input.email,
          phone: input.phone,
          displayName: input.displayName,
          updatedAt: now
        }
      })
      .returning();

    if (!user) {
      const [existingUser] = await this.db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, input.firebaseUid))
        .limit(1);

      if (!existingUser) {
        throw new Error("Failed to resolve authenticated user.");
      }

      return {
        id: existingUser.id,
        firebaseUid: existingUser.firebaseUid,
        email: existingUser.email,
        phone: existingUser.phone,
        displayName: existingUser.displayName
      };
    }

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName
    };
  }
}
