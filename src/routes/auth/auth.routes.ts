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
  RESRTPASSWORD: "/reset-account-password",
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
 * @api {POST} /api/auth/googlelogin
 * @desc User Login API
 * @access Public
 * **/
routes.route(PATH.GOOGLELOGIN).post(authController.googleLogin);

/**
 * * User Authorization middleware
 */
routes.use(UserAuthenticationMiddleware);

export default routes;
