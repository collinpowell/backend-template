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
import { validationResult } from "express-validator";
//import collectionModel from "../../model/collection";

import * as collectionRepo from "../../repository/collection/collection.repo";
import {
  DecodedToken,
  IGetUserAuthInfoRequest,
} from "../../middleware/authentication";
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
    if (!file) {
      return badRequestError(res, "No file Found");
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
    serverError(res, error);
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
  const errors = validationResult(req);
  try {

    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await collectionRepo.getMyCollection(
      id,
      req.query,
      options
    );

    //res.status(201).json({ data: result });
    return successfulRequest(res, Object(result))
  } catch (error) {
    logger.log(level.error, `<< getMyCollection()`);
    serverError(res, error);
  }
};

export const editCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> editCollection()`);
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
    const result = await collectionRepo.editCollection(
      id,
      req.params.collectionid,
      req.body,
      (req as MulterRequest).file
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< editCollection() error=${error}`);
    serverError(res, error);
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
    serverError(res, error);
  }
};

export const likeCollection = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> likeCollection()`);
  const { id } = req.currentUser;

  try {
    const result = await collectionRepo.likeCollection(
      id,
      req.params.collectionid
    );
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< likeCollection() error=${error}`);
    serverError(res, error);
  }
};

export const addNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> likeCollection()`);
  const { id } = req.currentUser;

  console.log(req.body)
  console.log(req.params.collectionid)
  console.log(req.params.nftid)


  try {
    const result = await collectionRepo.addNFT(
      id,
      req.params.collectionid,
      req.body
    );
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< likeCollection() error=${error}`);
    serverError(res, error);
  }
};

export const removeNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> likeCollection()`);
  const { id } = req.currentUser;
  console.log(req.body)
  console.log(req.params.collectionid)
  console.log(req.params.nftid)
  try {
    const result = await collectionRepo.removeNFT(
      id,
      req.params.collectionid,
      req.params.nftid
    );
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< likeCollection() error=${error}`);
    serverError(res, error);
  }
};

export const getAllUsersCollection = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> getMyCollection()`);
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  if (
    req.headers["authorization"] === undefined ||
    !req.headers["authorization"]
  ) {
    const errors = validationResult(req);
    try {

      if (!errors.isEmpty()) {
        return badRequestError(res, errors.array()[0].msg);
      }
      const result = await collectionRepo.getAllUsersCollection(
        req.query,
        options
      );

      //res.status(201).json({ data: result });
      return successfulRequest(res, Object(result))

    } catch (error) {
      logger.log(level.error, `<< getMyCollection()`);
      serverError(res, error);
    }
  } else {
    const authorization = req.headers["authorization"];
    const tokenSplitBy = " ";
    if (authorization) {

      let token = authorization.split(tokenSplitBy);
      let length = token.length;
      const tokenLength = 2;

      if (length == tokenLength && token[0].toLowerCase() === "bearer") {
        let accessToken = token[1];
        const errors = validationResult(req);
        try {

          if (!errors.isEmpty()) {
            return badRequestError(res, errors.array()[0].msg);
          }
          console.log(authorization)

          const userData: DecodedToken = await auth.verifyToken(accessToken);

          logger.log(level.debug, `UserAuthenticationMiddleware()`);

          const [userDoc] = await userModel.find({ email: userData.email });
          console.log(userDoc)

          if (userDoc && userDoc.status.toString() === "ACTIVE") {
            let query = { ...req.query, authUserId: userDoc.id };
            const result = await collectionRepo.getAllUsersCollection(
              query,
              options
            );
      
            //return res.status(201).json({ data: result });
            return successfulRequest(res, Object(result))

          }
        } catch (error) {
          if (error.toString().includes("jwt expired")) {
            //res.status(410).json({ error: { message: "Token is expired" } });
            res.status(410).json({ statuscode: 410, body: "", message: "Token is expired" });

          }
          logger.log(level.error, `appAuthMiddleware ${error}`);
        }
        authError(res);
      }
    }
  }
};


export const getUserCollection = async (
  req: Request,
  res: Response
) => {
  logger.log(level.debug, `>> getMyCollection()`);
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  try {
    const result = await collectionRepo.getUserCollection(
      req.params.collectionid
    );

    //res.status(201).json({ data: result });
    return successfulRequest(res, Object(result))
  } catch (error) {
    logger.log(level.error, `<< getMyCollection()`);
    serverError(res, error);
  }
};




