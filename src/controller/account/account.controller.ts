import { Request,Response } from "express";
import { level, logger } from "../../config/logger";
import * as accountRepo from "../../repository/account/account.repo";

import { IGetUserAuthInfoRequest } from "../../middleware/authentication";

import {
  badRequestError,
  serverError,
  successfulRequest
} from "../../utils/utility";

import { MulterRequest } from "../../service/multer/profile";
import * as fs from "fs";

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

export const getUserDetails = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> getUserDetails()`);
  try {
    const result = await accountRepo.getUserProfile(req.params.userId);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< getUserDetails() error=${error}`);
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
    let result =  await uploadProfile(req)
    if (result.error) {
      return badRequestError(res, result.message);
    }
    result =  await uploadCoverImage(req)
    if (result.error) {
      return badRequestError(res, result.message);
    }
    result = await accountRepo.editProfile(id, req.body);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< editProfile() error=${error}`);
    serverError(res);
  }
};

export const connectWallet = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.info, `>> editProfile()`);
  const { id } = req.currentUser;
  try {
    const result = await accountRepo.connectWallet(id, req.body);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< editProfile() error=${error}`);
    serverError(res);
  }
};

export const uploadProfile = async (
  req: IGetUserAuthInfoRequest,
) => {
  logger.log(level.info, `>> uploadProfile()`);
  const { id } = req.currentUser;
  try {
    const files: any = (req as MulterRequest).files;
    const file: any = files.avatar[0];

    if (
      file &&
      file.mimetype !== "image/webp" &&
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/png"
    ) {
      const data = {
        error: true,
        message: "Only webp, jpeg ,png"
      };
      return data;
      //return badRequestError(res, "Only webp, jpeg ,png");
    }
    const result = await accountRepo.uploadProfile(
      id,
      file,
      req.body
    );
    if (result.error) {
      if (req.body.isAvatar === "false" || req.body.isAvatar === false) {
        fs.unlink(file.path, () => {
          console.log("successfully Deleted");
        });
      }
      const data = {
        error: true,
        message: result.message
      };
      return data;
    }

    return result

  } catch (error) {
    logger.log(level.error, `<< uploadProfile() error=${error}`);
    const data = {
      error: false,
      message: ""
    };
    return data;
  }
};

export const uploadCoverImage = async (
  req: IGetUserAuthInfoRequest,
) => {
  logger.log(level.info, `>> uploadCoverImage()`);
  const { id } = req.currentUser;
  try {
    const files: any = (req as MulterRequest).files;
    const file: any = files.coverImage[0];
    const result = await accountRepo.uploadCoverImage(
      id,
      file
    );
    if (result.error) {
      fs.unlink(file.path, () => {
        console.log("successfully Deleted");
      });
      return result;
    }
    return result
  } catch (error) {
    logger.log(level.error, `<< uploadCoverImage() error=${error}`);
    const data = {
      error: false,
      message: ""
    };
    return data;
  }
};