import { Router } from "express";
const routes = Router({ mergeParams: true });
import * as miscController from "../../controller/misc/misc.controller";


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
 routes.route(PATH.CONTACTUS).post(miscController.saveContactUsDetails);

export default routes;


