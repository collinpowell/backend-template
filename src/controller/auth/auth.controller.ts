import { Request, Response } from "express";
import { level, logger } from "../../config/logger";
import * as authRepo from "../../repository/auth/auth.repo";


import { validationResult } from "express-validator";
import { UserInput,VerificationInput,LoginInput } from "../../model/user";

import {
  badRequestError,
  serverError,
  successfulRequest
} from "../../utils/utility";




export const registerUser = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> registerUser()`);
  console.log(req)
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }

    const { email, password, fullName, confirmPassword, username } = req.body;
    const registerInput: UserInput = {
      email: email.toLowerCase(),
      fullName,
      username,
      password,
      confirmPassword,
    };

    const result = await authRepo.registerUser(registerInput);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< registerUser() error=${error}`);
    serverError(res);
  }
};


export const verifyUser = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> verifyUser()`);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }

    const { email, verificationCode } = req.body;
    const verificationInput: VerificationInput = {
      email: email.toLowerCase(),
      verificationCode,
    };
    const result = await authRepo.verifyUser(verificationInput);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< verifyUser() error=${error}`);
    serverError(res);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> loginUser()`);
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }

    const { email, password } = req.body;
    const loginInput: LoginInput = {
      email: email.toLowerCase(),
      password,
    };
    const result = await authRepo.loginUser(loginInput);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< loginUser() error=${error}`);
    serverError(res);
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> googleLogin()`);
  try {
    const { username, email, googleId, idToken } = req.body;
    const result = await authRepo.googleLogin(
      username,
      email,
      googleId,
      idToken
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< googleLogin() error=${error}`);
    serverError(res);
  }
};