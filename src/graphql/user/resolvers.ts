import UserService, {
  CreateUserPayload,
  ForgetPasswordPayload,
  ResetUserPasswordPayload,
} from "../../services/users";

const queries = {
  getUserTokenHandler: async (
    _: any,
    payload: { email: string; password: string }
  ) => {
    const token = await UserService.getUserToken({
      email: payload.email,
      password: payload.password,
    });
    return token;
  },

  getCurrentLoggedInUserHandler: async (
    _: any,
    parameters: any,
    contex: any
  ) => {
    console.log({ contex });
    if (contex && contex.user) {
      const id = contex.user.id;
      const user = UserService.getUserById(id);
      return user;
    }
    throw new Error("User not logged-in.");
  },

  sendOTP: async (_: any, payload: any) => {
    const { email, act } = payload;
    const otpResult = await UserService.sendOpt(email, act);
    return otpResult;
  },
};

const mutations = {
  createUserHandler: async (_: any, payload: CreateUserPayload) => {
    await UserService.createUser(payload);
    return "User created successfully!";
  },

  resetPasswordHandler: async (
    _: any,
    payload: ResetUserPasswordPayload,
    contex: any
  ) => {
    if (!contex.user) throw new Error("Unauthorized!");
    const userId = contex.user.id;
    await UserService.resetPassword(userId, payload);
    return "Password updated successfully!";
  },

  forgetPasswordHandler: async (_: any, payload: ForgetPasswordPayload) => {
    await UserService.forgetPassword(payload);
    return "Password recovered successfully!";
  },
};

export const resolvers = { queries, mutations };
