import { Router } from "express";
const routes = Router({ mergeParams: true });
import { upload } from "../../service/multer/profile";
import { UserAuthenticationMiddleware } from "../../middleware/authentication";
import * as collectionController from "../../controller/collection/collection.controller";
const PATH = {
    ROOT: "/",
    LIKE: "/checkusername",
    BROWSE: "/browse",
    NFT: "/nft",
};


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
 .post(upload.single("image"),collectionController.createCollection)

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
  .route(PATH.ROOT+":collectionid")
  .put(upload.single("image"),collectionController.editCollection)
  /**
   * @api {DELETE} /api/collection
   * @desc Update Collection
   * @access Private
   * **/
  .delete(collectionController.deleteCollection);

export default routes;
