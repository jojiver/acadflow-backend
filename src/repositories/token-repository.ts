import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { tokens } from "@/db/schema";

type CreateTokenData = {
  userId: string;
  token: string;
  expiresAt: Date;
};

export class TokenRepository {
  async createRefreshToken(data: CreateTokenData) {
    const expiresAt = data.expiresAt.toISOString();

    const [token] = await db
      .insert(tokens)
      .values({
        userId: data.userId,
        token: data.token,
        expiresAt,
        type: "REFRESH",
      })
      .returning();

    return token;
  }

  async findActiveRefreshToken(token: string) {
    const currentTime = new Date().toISOString();

    const [activeToken] = await db
      .select()
      .from(tokens)
      .where(
        and(
          eq(tokens.token, token),
          eq(tokens.type, "REFRESH"),
          isNull(tokens.consumedAt),
          isNull(tokens.revokedAt),
          gt(tokens.expiresAt, currentTime),
        ),
      )
      .limit(1);

    return activeToken;
  }

  async consumeToken(id: string) {
    const consumedAt = new Date().toISOString();

    const [token] = await db
      .update(tokens)
      .set({ consumedAt })
      .where(
        and(
          eq(tokens.id, id),
          isNull(tokens.consumedAt),
          isNull(tokens.revokedAt),
        ),
      )
      .returning();

    return token;
  }

  async revokeToken(id: string) {
    const revokedAt = new Date().toISOString();

    const [token] = await db
      .update(tokens)
      .set({ revokedAt })
      .where(eq(tokens.id, id))
      .returning();

    return token;
  }
}
