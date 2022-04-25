import { Router } from "express";
const routes = Router({ mergeParams: true });
import * as miscController from "../../controller/misc/misc.controller";
import { body } from "express-validator";


const PATH = {
    COIN: "/coin",
    CATEGORY: "/category",
    CONTACTUS: "/contactus",
  };

/**
 * @api {GET} /api/misc/category
 * @desc Get Category List
 * @access Public
 * **/
 routes.route(PATH.CATEGORY).get(miscController.getCategory);

 /**
 * @api {GET} /api/misc/category
 * @desc Get Coin List
 * @access Public
 * **/
routes.route(PATH.COIN).get(miscController.getCoin);

/**
 * @api {POST} /api/misc/contactus
 * @desc Save contact us details
 * @access Public
 * **/
 routes.route(PATH.CONTACTUS).post(
   [
    body("email", "Valid Email Address is Required").isEmail(),
    body("subject","Subject length must be less than 200 characters")
    .isLength({ max: 200 }),
    body("message","Message length must be less than 500 characters")
    .isLength({ max: 500 })
   ],miscController.saveContactUsDetails);

export default routes;


