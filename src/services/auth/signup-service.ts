import bcrypt from "bcrypt";
import { UserRepository } from "@/repositories/user-repository";
import type { SignupInput } from "@/schema/auth-schema";

export async function signupService(input: SignupInput) {
  const userRepository = new UserRepository();

  try {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      return { code: 400, status: "error", message: "Email already exists" };
    }

    const createdUser = await userRepository.create({
      ...input,
      password: (await bcrypt.hash(input.password, 10)) as string,
    });

    return {
      code: 200,
      status: "success",
      message: "Created account successfully!",
      data: { user: createdUser },
    };
  } catch (error) {
    console.error("signupService error", error);
    return { code: 500, status: "error", message: "Unable to create account" };
  }
}
