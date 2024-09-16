import { ApolloServer } from "@apollo/server";
import { User } from "./user";

async function createApolloGraphqlServer() {
  const gqlServer = new ApolloServer({
    // cache: "bounded",
    typeDefs: `
          ${User.typeDefs}
          type Query {
          ${User.queries}
          }
          type Mutation {
            ${User.mutations}
          }
        `,

    resolvers: {
      Query: {
        ...User.resolvers.queries,
        // getContex: (_: any, parameters: any, contex) => {
        //   console.log("Contex", contex);
        //   return "Working";
        // },
      },
      Mutation: {
        // getContex: (_: any, parameters: any, contex) => {
        //   console.log("Contex", contex);
        //   return "Working";
        // },
        ...User.resolvers.mutations,
      },
    },
  });

  await gqlServer.start();

  return gqlServer;
}

export default createApolloGraphqlServer;
