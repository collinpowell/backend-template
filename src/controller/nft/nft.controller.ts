import { level, logger } from "../../config/logger";
import { Response, Request } from "express";
import {
  DecodedToken,
  IGetUserAuthInfoRequest,
} from "../../middleware/authentication";
import userModel from "../../model/user";
import * as nftRepo from "../../repository/nft/nft.repo";
import { validationResult } from "express-validator";
import fs from "fs";
import { MulterRequest } from "../../service/multer/multer";
import {
  getOptionsPipelineJson,
  badRequestError,
  serverError,
  successfulRequest,
  standardStructureStringToJson,
  authError,
} from "../../utils/utility";
import mongoose from 'mongoose'
import { FileTypes } from "../../model/nft"
import JWTAuth from "../../service/jwt_auth/jwt_auth";
const auth = new JWTAuth();



export const addArtWork = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> addArtWork()`);
  try {

    const { id } = req.currentUser;

    const result = await nftRepo.addArtWork(
      id,
      req.body,
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    // return res.status(201).json({ data: result });
    return successfulRequest(res, result)

  } catch (error) {
    logger.log(level.error, `<< addArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const editArtWork = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> editArtWork()`);
  const { id } = req.currentUser;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequestError(res, "Invalid User Id");
  }

  try {

    const result = await nftRepo.editArtWork(
      id,
      req.params.nftid,
      req.body
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result);
  } catch (error) {
    logger.log(level.error, `<< editArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const stopArtWorkSale = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> stopArtWorkSale()`);
  const { id } = req.currentUser;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequestError(res, "Invalid User Id");
  }
  try {


    const result = await nftRepo.stopArtWorkSale(
      id,
      req.params.nftid,
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result);

  } catch (error) {
    logger.log(level.error, `<< stopArtWorkSale() error=${error}`);
    serverError(res, error);
  }
};

export const burnNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> stopArtWorkSale()`);
  const { id } = req.currentUser;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequestError(res, "Invalid User Id");
  }
  try {

    const result = await nftRepo.burnNFT(
      id,
      req.params.nftid,
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result);

  } catch (error) {
    logger.log(level.error, `<< stopArtWorkSale() error=${error}`);
    serverError(res, error);
  }
};

export const getMyAllArtWork = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> getMyAllArtWork()`);
  const { id } = req.currentUser;
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.getMyAllArtWork(id, req.query, options, false);
    //return res.status(201).json({ data: result });
    //return res.status(201).json({ data: result });
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getMyAllArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const getMyAllCreatedArtWork = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> getMyAllArtWork()`);
  const { id } = req.currentUser;
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.getMyAllArtWork(id, req.query, options, true);
    //return res.status(201).json({ data: result });
    //return res.status(201).json({ data: result });
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getMyAllArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const getUserCreatedArtWork = async (
  req: Request,
  res: Response
) => {
  logger.log(level.debug, `>> getMyAllArtWork()`);
  const id = req.params.userid;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequestError(res, "Invalid User Id");
  }
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.getMyAllArtWork(id, req.query, options, true);
    //return res.status(201).json({ data: result });
    //return res.status(201).json({ data: result });
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getMyAllArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const getUserAllOwnedNFT = async (
  req: Request,
  res: Response
) => {
  logger.log(level.debug, `>> getMyAllArtWork()`);
  const id = req.params.userid;
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequestError(res, "Invalid User Id");
  }
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.getMyAllArtWork(id, req.query, options, false);
    //return res.status(201).json({ data: result });
    //return res.status(201).json({ data: result });
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getMyAllArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const uploadToIPFS = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> addArtWork()`);
  try {
    if (!req.body.title) {
      return badRequestError(res, "Title is Required");
    }
    if (!req.body.description) {
      return badRequestError(res, "Description is Required");
    }
    if (!req.body.nftCategory) {
      return badRequestError(res, "Nft Category is Required");
    }
    if (!req.body.properties) {
      return badRequestError(res, "Properties is Required");
    }
    const files: any = (req as MulterRequest).files;

    files.map((file) => {
      if (
        file.mimetype !== "image/webp" &&
        file.mimetype !== "image/jpeg" &&
        file.mimetype !== "image/gif" &&
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/jpg" &&
        file.mimetype !== "video/mp4" &&
        file.mimetype !== "audio/mp3" &&
        file.mimetype !== "application/pdf" &&
        file.mimetype !== "audio/mpeg"
      ) {
        fs.unlink(file.path, () => {
          console.log("successfully Deleted");
        });
        return badRequestError(
          res,
          "Only webp, jpeg, gif, png, mp4, mp3, mpeg, pdf"
        );
      }
    });
    const { id } = req.currentUser;
    const result = await nftRepo.uploadToIPFS(
      id,
      req.body,
      (req as MulterRequest).files
    );
    if (result.error) {
      files.map((file: FileTypes) => {
        fs.unlink(file.path, () => {
          console.log("successfully Deleted");
        });
      });
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    console.log(result.data);
    return successfulRequest(res, result);
  } catch (error) {
    logger.log(level.error, `<< addArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const likeNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> likeArtWork()`);
  const { id } = req.currentUser;
  if (!mongoose.Types.ObjectId.isValid(req.params.nftid)) {
    return badRequestError(res, "Invalid NFT Id");
  }
  try {
    const result = await nftRepo.likeNFT(id, req.params.nftid);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result);

  } catch (error) {
    logger.log(level.error, `<< likeArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const bookmarkNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> likeArtWork()`);
  const { id } = req.currentUser;
  const errors = validationResult(req);
  if (!mongoose.Types.ObjectId.isValid(req.params.nftid)) {
    return badRequestError(res, "Invalid NFT Id");
  }
  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.bookmarkNFT(id, req.params.nftid);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result);

  } catch (error) {
    logger.log(level.error, `<< likeArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const purchaseArtWork = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> purchaseArtWork()`);
  const { id } = req.currentUser;

  try {
    const result = await nftRepo.purchaseArtWork(id, req.body);
    if (result.error) {
      return badRequestError(res, result.message);
    }
    //return res.status(201).json({ data: result });
    return successfulRequest(res, result);

  } catch (error) {

    logger.log(level.error, `<< purchaseArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const browseByCollection = async (
  req: Request,
  res: Response
) => {
  logger.log(level.debug, `>> browseByCollection()`);
  const id = req.params.collectionid;
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequestError(res, "Invalid Collection Id");
  }
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.browseByCollection(id, req.query, options);
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getMyAllArtWork() error=${error}`);
    serverError(res, error);
  }
};

export const browseByBookmarkedNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> browseByBookmarkedNFT()`);
  const { id } = req.currentUser;
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.browseByBookmarkedNFT(id, req.query, options);

    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< browseByBookmarkedNFT() error=${error}`);
    serverError(res, error);
  }
};

export const getAllArtWork = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> getAllWithoutUserIdArtWork()`);
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  if (
    req.headers["authorization"] === undefined ||
    !req.headers["authorization"] ||
    req.headers["authorization"].trim() === ""
  ) {
    const errors = validationResult(req);

    try {
      if (!errors.isEmpty()) {
        return badRequestError(res, errors.array()[0].msg);
      }
      const result = await nftRepo.getAllWithoutUserIdArtWork(
        req.query,
        options
      );
      if (result.error) {
        return badRequestError(res, result.message);
      }
      // return res.status(201).json({ data: result });
      return successfulRequest(res, Object(result));

    } catch (error) {
      logger.log(level.error, `<< getAllWithoutUserIdArtWork() error=${error}`);
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
          const userData: DecodedToken = await auth.verifyToken(accessToken);
          logger.log(level.debug, `UserAuthenticationMiddleware()`);

          const [userDoc] = await userModel.find({ email: userData.email });

          if (userDoc && userDoc.status.toString() === "ACTIVE") {
            const result = await nftRepo.getAllArtWork(
              userDoc.id,
              req.query,
              options
            );/*  */
            if (result.error) {
              return badRequestError(res, result.message);
            }
            // return res.status(201).json({ data: result });
            return successfulRequest(res, Object(result));

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

export const getTrendingNFT = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> getAllWithoutUserIdArtWork()`);
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return badRequestError(res, errors.array()[0].msg);
    }
    const result = await nftRepo.getTrendingArtWork(
      req.query,
      options
    );
    if (result.error) {
      return badRequestError(res, result.message);
    }
    // return res.status(201).json({ data: result });
    return successfulRequest(res, Object(result));

  } catch (error) {
    logger.log(level.error, `<< getAllWithoutUserIdArtWork() error=${error}`);
    serverError(res, error);
  }

};

export const getArtWorkDetails = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> getArtWorkDetails()`);
  if (!mongoose.Types.ObjectId.isValid(req.params.nftid)) {
    return badRequestError(res, "Invalid NFT Id");
  }
  if (
    req.headers["authorization"] === undefined ||
    !req.headers["authorization"]
  ) {
    try {

      let filter = {};

      filter = { ...filter, _id: req.params.nftid };
      const result = await nftRepo.getArtWorkDetails(filter);

      if (result.error) {
        return badRequestError(res, result.message);
      }

      const sellerOtherArtworks = await nftRepo.getSellerOtherArtworks(req.params.nftid);
      // return res.status(201).json({ data: { ...result, seller_other_artworks: sellerOtherArtworks } });
      result.data.sellerOtherArtworks = sellerOtherArtworks
      return successfulRequest(res, Object(result));
    } catch (error) {
      logger.log(level.error, `<< getArtWorkDetails() error=${error}`);
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
        try {
          const userData: DecodedToken = await auth.verifyToken(accessToken);
          logger.log(level.debug, `UserAuthenticationMiddleware()`);

          const [userDoc] = await userModel.find({ email: userData.email });

          if (userDoc && userDoc.status.toString() === "ACTIVE") {
            let filter = {};
            filter = {
              ...filter,
              _id: req.params.nftid,
              userId: userDoc.id,
            };

            const result = await nftRepo.getArtWorkDetails(filter);
            if (result.error) {
              return badRequestError(res, result.message);
            }
            const sellerOtherArtworks = await nftRepo.getSellerOtherArtworks(req.params.nftid);
            return res.status(201).json({ data: { ...result, seller_other_artworks: sellerOtherArtworks } });
          }
        } catch (error) {
          if (error.toString().includes("jwt expired")) {
            res.status(410).json({ statuscode: 410, body: "", message: "Token is expired" });

          } else {
            return badRequestError(res, error.message);
          }
          logger.log(level.error, `appAuthMiddleware ${error}`);
        }
        authError(res);
      }
    }
  }
};

export const getAuctionDetails = async (req: Request, res: Response) => {
  logger.log(level.debug, `>> getAuctionDetails()`);
  try {

    let filter = {};
    if (!mongoose.Types.ObjectId.isValid(req.params.nftid)) {
      return badRequestError(res, "Invalid NFT Id");
    }
    filter = { ...filter, _id: req.params.nftid };
    const result = await nftRepo.getAuctionDetails(filter);

    if (result.error) {
      return badRequestError(res, result.message);
    }
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getAuctionDetails() error=${error}`);
    serverError(res, error);
  }
}


export const getMyAllBids = async (
  req: IGetUserAuthInfoRequest,
  res: Response
) => {
  logger.log(level.debug, `>> getMyAllBids()`);
  const extraParams = standardStructureStringToJson(req.query);
  const options = getOptionsPipelineJson(extraParams);
  const { id } = req.currentUser;
  try {
    const result = await nftRepo.getMyAllBids(id, req.query, options);
    //return res.status(201).json({ data: result });
    return successfulRequest(res, Object(result));
  } catch (error) {
    logger.log(level.error, `<< getMyAllBids() error=${error}`);
    serverError(res, error);
  }
};
