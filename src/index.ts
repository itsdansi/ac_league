import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import { prismaClient } from "./lib/db";
import createApolloGraphqlServer from "./graphql";
import UserService from "./services/users";

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use(
    "/graphql",
    expressMiddleware(await createApolloGraphqlServer(), {
      context: async ({ req }) => {
        // @ts-ignore
        const token = req.headers["token"];
        console.log({ token });
        try {
          const user = UserService.decodeJWTToken(token as string);
          return { user };
        } catch (error: unknown) {}
        return {};
      },
    })
  );
  app.listen(8000, () => console.log("Server is started at 8000"));
}

startServer();
