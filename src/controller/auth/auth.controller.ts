import { Request, Response } from "express";
import { level, logger } from "../../config/logger";
import * as authRepo from "../../repository/auth/auth.repo";

import { IGetUserAuthInfoRequest } from "../../middleware/authentication";

import { validationResult } from "express-validator";
import { UserInput, VerificationInput, LoginInput } from "../../model/user";

import {
  badRequestError,
  serverError,
  successfulRequest
} from "../../utils/utility";




export const registerUser = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> registerUser()`);
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

export const resetPassword = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> resetPassword()`);
  const { email } = req.body;
  try {
    const result = await authRepo.forgotPassword(email);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< resetPassword() error=${error}`);
    serverError(res);
  }
};

export const checkUsername = async (
  req: Request, res: Response
) => {
  logger.log(level.debug, `>> checkUsername()`);
  const errors = validationResult(req);
  try {

    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }

    const result = await authRepo.checkUsername(
      req.query.username.toString(),
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< checkUsername() error=${error}`);
    serverError(res);
  }

};

export const resetPasswordChange = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> resetPasswordChange()`);
  const { newPassword, confirmPassword, resetPasswordToken } = req.body;
  const errors = validationResult(req);
  try {

    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await authRepo.resetPassword(
      newPassword,
      confirmPassword,
      resetPasswordToken
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< resetPasswordChange() error=${error}`);
    serverError(res);
  }
};

export const changePassword = async (req: IGetUserAuthInfoRequest, res: Response) => {
  logger.log(level.debug, `>> passwordChange()`);
  const { id } = req.currentUser;
  const { newPassword, confirmPassword, currentPassword } = req.body;
  const errors = validationResult(req);
  try {

    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await authRepo.changePassword(
      id,
      currentPassword,
      newPassword,
      confirmPassword
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< passwordChange() error=${error}`);
    serverError(res);
  }
};


export const sendChangeEmail = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> sendChangeEmail()`);
  const { id } = req.currentUser;
  const { newEmail } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await authRepo.sendChangeEmail(id, newEmail);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< sendChangeEmail() error=${error}`);
    serverError(res);
  }
};

export const verifyChangeEmail = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> verifyChangeEmail()`);
  const { id } = req.currentUser;
  const { newEmail, verificationCode } = req.body;
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await authRepo.verifyChangeEmail(
      id,
      newEmail,
      verificationCode
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< verifyChangeEmail() error=${error}`);
    serverError(res);
  }
};