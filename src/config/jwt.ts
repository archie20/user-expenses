import dotenv from "dotenv";

dotenv.config();

export const tokenSecret =
  process.env.TOKEN_SECRET ?? "GH74339FSA9XAKZAL5QJxsTWik@wd5W";
export const tokenExpire = process.env.TOKEN_EXPIRY ?? "15d";
