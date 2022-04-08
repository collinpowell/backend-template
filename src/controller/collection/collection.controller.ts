import { Request, Response } from "express";
import { level, logger } from "../../config/logger";
import {
  authError,
  badRequestError,
  successfulRequest,
  getOptionsPipelineJson,
  serverError,
  standardStructureStringToJson,
} from "../../utils/utility";
import * as fs from "fs";
import * as collectionRepo from "../../repository/collection/collection.repo";
import {
  DecodedToken,
  IGetUserAuthInfoRequest,
} from "../../middleware/authentication";
import { validationResult } from "express-validator";
import { MulterRequest } from "../../service/multer/profile";

import JWTAuth from "../../service/jwt_auth/jwt_auth";
const auth = new JWTAuth();
import userModel from "../../model/user";

export const createCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> createCollection()`);
  const { id } = req.currentUser;
  try {
    const file: any = (req as MulterRequest).file;
    if (
      file &&
      file.mimetype !== "image/webp" &&
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/png"
    ) {
      return badRequestError(res, "Only webp, jpeg ,png");
    }

    const result = await collectionRepo.createCollection(
      id,
      req.body,
      (req as MulterRequest).file
    );
    if (result.error) {
      fs.unlink(file.path, () => {
        console.log("successfully Deleted");
      });
      return badRequestError(res, result.message);
    }
    //res.status(201).json({ data: result });
    return successfulRequest(res, result)
  } catch (error) {
    logger.log(level.error, `<< createCollection() error=${error}`);
    serverError(res);
  }
};

export const getMyCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> getMyCollection()`);
  const { id } = req.currentUser;
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  try {
    const result = await collectionRepo.getMyCollection(
      id,
      req.query,
      options
    );

    //res.status(201).json({ data: result });
    return successfulRequest(res, Object(result))
  } catch (error) {
    logger.log(level.error, `<< getMyCollection()`);
    serverError(res);
  }
};

export const editCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> editCollection()`);
  const { id } = req.currentUser;
  try {
    const result = await collectionRepo.editCollection(
      id,
      req.query.collectionid,
      req.body
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< editCollection() error=${error}`);
    serverError(res);
  }
};

export const deleteCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> deleteCollection()`);
  const { id } = req.currentUser;
  console.log(req.params.collectionid)
  try {
    const result = await collectionRepo.deleteCollection(
      id,
      req.params.collectionid
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< deleteCollection() error=${error}`);
    serverError(res);
  }
};

export const likeCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> likeCollection()`);
  const { id } = req.currentUser;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await collectionRepo.likeCollection(
      id,
      req.query.collection_id
    );
    return res.status(201).json({ data: result });
  } catch (error) {
    logger.log(level.error, `<< likeCollection() error=${error}`);
    serverError(res);
  }
};