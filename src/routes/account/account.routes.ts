import { Router } from "express";
import * as accountController from "../../controller/account/account.controller";
const routes = Router({ mergeParams: true });
import { UserAuthenticationMiddleware } from "../../middleware/authentication";
import { upload } from "../../service/multer/profile";

const PATH = {
  ROOT: "/",
  MYPROFILE: "/myprofile",
  CONNECTWALLET: "/connectwallet",
  USERPROFILE: "/getuserprofile",
  UPLOADAVATAR: "/uploadavatar",
  UPLOADCOVER: "/uploadcover",

};

/**
 * * User Authorization middleware
 */
routes.use(UserAuthenticationMiddleware);

/**
* @api {GET} /api/account/myprofile
* @desc User Details
* @access Private
* **/
routes
  .route(PATH.MYPROFILE)
  .get(accountController.myAccount)
  /**
   * @api {PUT} /api/account/myprofile
   * @desc Update User Details
   * @access Private
   * **/
  .put(upload.fields([{
    name: 'avatar', maxCount: 1
  }, {
    name: 'coverImage', maxCount: 1
  }]),accountController.editProfile);
  
/**
* @api {GET} /api/account/getuserprofile
* @desc User Details
* @access Public
* **/
routes
  .route(PATH.USERPROFILE +"/:userId")
  .get(accountController.getUserDetails)

/**
* @api {GET} /api/account/connectwallet
* @desc Wallet
* @access Private
* **/
routes
  .route(PATH.CONNECTWALLET)
  .put(accountController.connectWallet)


// /**
// * @api {PUT} /api/account/uploadavatar
// * @desc User AVATAR
// * @access Private
// * **/
// routes
//   .route(PATH.UPLOADAVATAR)
//   .put(upload.single("avatar"), accountController.uploadProfile)

// /**
// * @api {PUT} /api/account/uploadcover
// * @desc User AVATAR
// * @access Private
// * **/
// routes
//   .route(PATH.UPLOADCOVER)
//   .put(upload.single("coverImage"), accountController.uploadCoverImage)

export default routes;
