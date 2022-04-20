import { Router } from "express";
const routes = Router({ mergeParams: true });
import { upload } from "../../service/multer/profile";
import { UserAuthenticationMiddleware } from "../../middleware/authentication";
import * as collectionController from "../../controller/collection/collection.controller";
import { validate } from "../../validator/collection.validator";
import { constants as VALIDATOR } from "../../constant/validator/collection.constant";
const PATH = {
  ROOT: "/",
  ROOTX: "/root",
  LIKE: "/like",
  BROWSE: "/browse",
  NFT: "/nft",
};

routes
  .route(PATH.BROWSE + "/:collectionid")
  .get(collectionController.getUserCollection)

routes
  .route(PATH.BROWSE)
  .get(collectionController.getAllUsersCollection)

/**
 * * User Authorization middleware
 */
routes.use(UserAuthenticationMiddleware);

/**
 * @api {POST} /api/collection
 * @desc Create Collection
 * @access Private
 * **/
routes
  .route(PATH.ROOT)
  .post(upload.single("image"), collectionController.createCollection)

  /**
   * @api {GET} /api/collection
   * @desc Get My Collection
   * @access Private
   * **/
  .get(collectionController.getMyCollection)
/**
  * @api {PUT} /api/collection
  * @desc Update Collection
  * @access Private
  * **/

routes
  .route(PATH.ROOT + ":collectionid")
  .put(upload.single("image"), collectionController.editCollection)
  /**
   * @api {DELETE} /api/collection
   * @desc Update Collection
   * @access Private
   * **/
  .delete(collectionController.deleteCollection);

routes
  .route(PATH.LIKE + "/:collectionid")
  .put(collectionController.likeCollection)

routes
  .route(PATH.NFT + "/:collectionid")
  .put(collectionController.addNFT)

routes
  .route(PATH.NFT + "/:collectionid/:nftid")
  .put(collectionController.removeNFT)

routes
  .route(PATH.NFT + "/:collectionid/:nftid")
  .put(collectionController.removeNFT)

export default routes;
