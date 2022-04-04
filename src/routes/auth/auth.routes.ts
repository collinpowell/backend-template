import { Router } from "express";
import * as authController from "../../controller/auth/auth.controller";
const routes = Router({ mergeParams: true });
import { UserAuthenticationMiddleware } from "../../middleware/authentication";
import { validate } from "../../validator/user.validator";
import { constants as VALIDATOR } from "../../constant/validator/user.constant";

const PATH = {
  ROOT: "/",
  CHECKUSERNAME: "/checkusername",
  REGISTER: "/register",
  VERIFY: "/verifyaccount",
  LOGIN: "/login",
  GOOGLELOGIN: "/googlelogin",
  RESETPASSWORD: "/reset-account-password",
  RESETCHANGEPASSWORD: "/resetpassword-changepassword",
  CHANGEPASSWORD: "/change-account-password",
  CHANGEEMAIL: "/changeemail",
  VERIFYEMAILCHANGE: "/verifyemailchange",
};

/**
 * @api {POST} /api/auth/register
 * @desc User Registration API
 * @access Public
 * **/
routes
  .route(PATH.REGISTER)
  .post(validate(VALIDATOR.REGISTER_USER), authController.registerUser);

/**
* @api {POST} /api/auth/verifyaccount
* @desc User Verification API
* @access Public
* **/
routes
  .route(PATH.VERIFY)
  .post(validate(VALIDATOR.VERIFY_USER), authController.verifyUser);

/**
 * @api {POST} /api/auth/login
 * @desc User Login API
 * @access Public
 * **/
routes
  .route(PATH.LOGIN)
  .post(validate(VALIDATOR.LOGIN), authController.loginUser);

/**
* @api {POST} /api/auth/checkusername
* @desc Username Check API
* @access Public
* **/
routes
  .route(PATH.CHECKUSERNAME)
  .get(validate(VALIDATOR.CHECKUSERNAME), authController.checkUsername);

/**
 * @api {PUT} /api/auth/reset-account-password
 * @desc User Reset Password API
 * @access Public
 * **/
routes.route(PATH.RESETPASSWORD).put(authController.resetPassword);

/**
* @api {PUT} /api/auth/resetpassword-changepassword
* @desc User Reset Password API
* @access Public
* **/
routes.route(PATH.RESETCHANGEPASSWORD).put(validate(VALIDATOR.RESETCHANGEPASSWORD),authController.resetPasswordChange);


/**
* @api {POST} /api/auth/googlelogin
* @desc User Login API
* @access Public
* **/
routes.route(PATH.GOOGLELOGIN).post(authController.googleLogin);

/**
 * * User Authorization middleware
 */
routes.use(UserAuthenticationMiddleware);


/**
 * @api {PUT} /api/auth/changeemail
 * @desc Change Email Send
 * @access Private
 * **/
routes
  .route(PATH.CHANGEEMAIL)
  .put(validate(VALIDATOR.SEND_CHANGE_EMAIL), authController.sendChangeEmail);

/**
 * @api {PUT} /api/auth/verifyemailchange
 * @desc Update Email
 * @access Private
 * **/
routes
  .route(PATH.VERIFYEMAILCHANGE)
  .put(
    validate(VALIDATOR.VERIFY_CHANGE_EMAIL),
    authController.verifyChangeEmail
  );

  /**
 * @api {PUT} /api/auth/change-account-password
 * @desc Update Email
 * @access Private
 * **/
routes
.route(PATH.CHANGEPASSWORD)
.put(
  validate(VALIDATOR.VERIFY_CHANGE_PASSWORD),
  authController.changePassword
);

export default routes;
