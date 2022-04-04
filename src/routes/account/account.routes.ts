import { Router } from "express";
import * as accountController from "../../controller/account/account.controller";
const routes = Router({ mergeParams: true });

const PATH = {
    ROOT: "/",
    MYPROFILE: "/myprofile",
    CONNECTWALLET: "/connectwallet",
    USERPROFILE:"/getuserprofile"
  };

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
.put(accountController.editProfile);
export default routes;
