import { Request, Response } from "express";
import { level, logger } from "../../config/logger";
import * as authRepo from "../../repository/auth/auth.repo";


import { validationResult } from "express-validator";
import { UserInput } from "../../model/user";

import {
    badRequestError,
    serverError,
  } from "../../utils/utility";




export const registerUser = async (req: Request, res: Response) => {
    logger.log(level.debug, `>> registerUser()`);
    console.log(req)

    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        return badRequestError(res, errors.array()[0].msg);
      }
  
      const { email, password,fullName, confirmPassword,username } = req.body;
      const registerInput: UserInput = {
        email: email.toLowerCase(),
        fullName,
        username,
        password,
        confirmPassword,
      };
      const result = await authRepo.registerUser(registerInput);
      if (result.statuscode !== 200) {
        return badRequestError(res, result.message);
      }
      return res.status(201).json({ data: result });
    } catch (error) {
      logger.log(level.error, `<< registerUser() error=${error}`);
      serverError(res);
    }
  };