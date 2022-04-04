import { Response } from "express";
import { level, logger } from "../../config/logger";
import * as accountRepo from "../../repository/account/account.repo";

import { IGetUserAuthInfoRequest } from "../../middleware/authentication";


import {
  badRequestError,
  serverError,
  successfulRequest
} from "../../utils/utility";

export const myAccount = async (
    req: IGetUserAuthInfoRequest,
    res: Response
  ) => {
    logger.log(level.debug, `>> myAccount()`);
    const { id } = req.currentUser;
    try {
      const result = await accountRepo.userAccount(id);
      if (result.error) {
        return badRequestError(res, result.message);
      }
      //return res.status(201).json({ data: result });
        return successfulRequest(res, result)

    } catch (error) {
      logger.log(level.error, `<< myAccount() error=${error}`);
      serverError(res);
    }
  };
  
  export const editProfile = async (
    req: IGetUserAuthInfoRequest,
    res: Response
  ) => {
    logger.log(level.info, `>> editProfile()`);
    const { id } = req.currentUser;
  
    try {
      const result = await accountRepo.editProfile(id, req.body);
      if (result.error) {
        return badRequestError(res, result.message);
      }
      return res.status(201).json({ data: result });
    } catch (error) {
      logger.log(level.error, `<< editProfile() error=${error}`);
      serverError(res);
    }
  };