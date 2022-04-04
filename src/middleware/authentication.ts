import httpContext from "express-http-context";
import { logger, level } from "../config/logger";
import JWTAuth from "../service/jwt_auth/jwt_auth";
import userModel from "../model/user";
import { NextFunction, Request, Response } from "express";
import { authError } from "../utils/utility";

const auth = new JWTAuth();
const tokenLength = 2;
const AUTH_TYPE = "bearer";
const tokenSplitBy = " ";
const AUTHORIZATION_HEADER_NAME = "authorization";
const CURRENT_USER = "currentUser";

export interface DecodedToken {
  id?: string;
  email?: string;
  role?: string;
}

export interface IGetUserAuthInfoRequest extends Request {
  currentUser: DecodedToken;
}

export const UserAuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers[AUTHORIZATION_HEADER_NAME];
  if (authorization) {

    let token = authorization.split(tokenSplitBy);
    let length = token.length;

    if (length == tokenLength && token[0].toLowerCase() === AUTH_TYPE) {
      let accessToken = token[1];
      try {

        const userData: DecodedToken = await auth.verifyToken(accessToken);
        logger.log(level.debug, `UserAuthenticationMiddleware()`);

        const [userDoc] = await userModel.find({ email: userData.email });

        if (userDoc && userDoc.status.toString() === "ACTIVE") {
          httpContext.set("email", userData.email);

          req[CURRENT_USER] = userData;
          next();

          return;
        } else {

          logger.log(
            level.debug,
            `appAuthMiddleware userDoc=${JSON.stringify(userDoc)}`
          );
        }
      } catch (error) {
        if (error.toString().includes("jwt expired")) {
          res.status(410).json({ statuscode: 410, body: "", message: "Token is expired" });
        }
        logger.log(level.error, `appAuthMiddleware ${error}`);
      }
    }
  }
  authError(res);
};
