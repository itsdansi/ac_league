export const mutations = `#graphql
    createUserHandler(firstName: String!, lastName: String!, email: String!, password: String!): String
    resetPasswordHandler(password: String!, newPassword: String!, confirmPassword: String!): String
    forgetPasswordHandler(email: String!, otp: String!, newPassword: String): String
`;
