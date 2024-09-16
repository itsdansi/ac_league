export const queries = `#graphql
getUserTokenHandler(email: String!, password: String!): String
getCurrentLoggedInUserHandler: User
sendOTP(email: String!, act: String!): String
`;
