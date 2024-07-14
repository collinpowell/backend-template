import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { logger, level } from "../config/logger";
import { constants as EMAIL_CONST } from "../constant/nodemailer";

const USER = EMAIL_CONST.USER;
const PASS = EMAIL_CONST.PASS;
const SERVICE = EMAIL_CONST.SERVICE;
const FROM = EMAIL_CONST.FROM;

const transporter: Mail = nodemailer.createTransport({
  service: SERVICE,
  from: USER,
  secure: true,
  auth: {
    user: USER,
    pass: PASS,
  },
});


transporter.verify((error, _success) => {
  if (error) {
    logger.log(level.error, error);
  } else {
    logger.log(level.info, "Server is ready to take our messages");
  }
});

export default transporter;
