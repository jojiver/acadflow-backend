import bcrypt from "bcrypt";
import { UserRepository } from "@/repositories/user-repository";
import { TokenRepository } from "@/repositories/token-repository";
import { signAccessToken, signRefreshToken, TokenExpiry } from "@/lib/jwt";

export async function loginService(email: string, password: string) {
  const userRepository = new UserRepository();
  const tokenRepository = new TokenRepository();

  try {
    const user = await userRepository.findByEmail(email);
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return { code: 400, status: "error", message: "Invalid credentials" };
    }

    const accessToken = signAccessToken(
      user.id,
      user.role,
      TokenExpiry.ACCESS_TOKEN_EXPIRES,
    );
    const refreshToken = signRefreshToken(
      user.id,
      user.role,
      TokenExpiry.REFRESH_TOKEN_EXPIRES,
    );

    await tokenRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      code: 200,
      status: "success",
      message: "Successfully logged in",
      data: { accessToken, refreshToken },
    };
  } catch (error) {
    console.error("loginService Error", error);
    return { code: 500, status: "error", message: "Failed to login account" };
  }
}
