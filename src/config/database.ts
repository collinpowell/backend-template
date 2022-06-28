import mongoose from "mongoose";
import { logger, level } from "./logger";
import { constants as DB_CONST } from "../constant/database";

const URL = DB_CONST.MONGO_URL;

const MONGO_OPTIONS = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  socketTimeoutMS: 30000,
  autoIndex: false,
};

mongoose
  .connect(URL, MONGO_OPTIONS)
  .then((result) => {
    logger.log(level.info, `Successfully connected to db at ${URL}`);
  })
  .catch((err) => {
    logger.log(level.error, `connection error while connection at ${URL}`);
  });
