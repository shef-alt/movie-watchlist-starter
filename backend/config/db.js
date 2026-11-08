import "dotenv/config";
import { Sequelize } from "sequelize";

const isProduction = process.env.NODE_ENV === "production";

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
  logging: false,
});
