import { prismaClient } from "../lib/db";
import { createHmac, randomBytes, randomInt } from "crypto";
import JWT from "jsonwebtoken";
// import { OTPType } from "../types/enum";
import { OTPType } from "@prisma/client";

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

export interface ResetUserPasswordPayload {
  password: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

const JWT_SECRET = "Justastrongtextaroundtheapp";

class UserService {
  private static generateHash(salt: string, password: string) {
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    return hashedPassword;
  }

  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(32).toString("hex");

    const hashedPassword = UserService.generateHash(salt, password);
    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hashedPassword,
      },
    });
  }

  private static getUserByEmail(email: string) {
    return prismaClient.user.findUnique({ where: { email } });
  }

  public static getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }

  private static comparePassword(
    inputPassword: string,
    currentPassword: string,
    salt: string
  ) {
    const userHashedPassword = UserService.generateHash(salt, inputPassword);

    console.log({ inputPassword });
    console.log({ userHashedPassword });

    if (userHashedPassword !== currentPassword)
      throw new Error("Invalid credentials!");

    return userHashedPassword;
  }

  private static async updateUserPassword(
    userId: string,
    hashedPassword: string
  ) {
    // Update the user object in the database
    return await prismaClient.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error("User not found!");

    const { salt } = user;
    UserService.comparePassword(password, user.password, salt);

    // Gen Token
    const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return token;
  }

  public static async resetPassword(
    userId: string,
    payload: ResetUserPasswordPayload
  ) {
    const { password, newPassword, confirmPassword } = payload;

    console.log({ userId });

    const user = await UserService.getUserById(userId);
    if (!user) throw new Error("User not found!");

    const { salt } = user;
    UserService.comparePassword(password, user.password, salt);

    if (newPassword !== confirmPassword)
      throw new Error("Confirm password doesn't match!");

    const hashedPassword = UserService.generateHash(salt, newPassword);

    UserService.updateUserPassword(userId, hashedPassword);

    return true;
  }

  public static decodeJWTToken(token: string) {
    return JWT.verify(token, JWT_SECRET);
  }

  private static async getOtpDetails(otp: string, type: OTPType) {
    const otpDetails = await prismaClient.oTP.findFirst({
      where: {
        otpCode: otp,
        type: type,
        activationStatus: true,
      },
    });

    return otpDetails;
  }

  public static generateOTP() {
    return randomInt(100000, 999999);
  }

  public static async sendOpt(email: string, act: OTPType) {
    const userExists = await UserService.getUserByEmail(email);
    console.log({ userExists });
    if (!userExists) throw new Error("User with given email doesn't exists!");
    const opt = UserService.generateOTP();

    await prismaClient.oTP.create({
      data: {
        email,
        type: act,
        otpCode: String(opt),
        activationStatus: true,
      },
    });

    return "Otp send send successfully!";
  }

  public static async forgetPassword(payload: ForgetPasswordPayload) {
    const { email, otp, newPassword } = payload;

    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error("User not found!");

    const otpExists = await UserService.getOtpDetails(
      otp,
      OTPType.RESET_PASSWORD
    );

    if (!otpExists) throw new Error("Invalid otp!");

    const { salt } = user;

    const hashedPassword = UserService.generateHash(salt, newPassword);
    UserService.updateUserPassword(user.id, hashedPassword);

    return true;
  }
}

export default UserService;
