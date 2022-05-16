import { Router } from "express";
const routes = Router();
import accountRoutes from "./account/account.routes";
import authRoutes from "./auth/auth.routes";
import collectionRoutes from "./collection/collection.routes";
import miscRoutes from "./misc/misc.routes";
import nftRoutes from "./nft/nft.routes";
import * as accountController from "./../controller/account/account.controller";


const PATH = {
  ROOT: "/",
  ACCOUNT: "/account",
  AUTH: "/auth",
  COLLECTION: "/collection",
  MISC: "/misc",
  NFT: "/nft",
};

routes.use(PATH.ACCOUNT, accountRoutes);
routes.use(PATH.AUTH, authRoutes);
routes.use(PATH.COLLECTION, collectionRoutes);
routes.use(PATH.MISC, miscRoutes);
routes.use(PATH.NFT, nftRoutes);
/**
 * Statistics
 */
routes.use(PATH.ROOT + "trendingcreators", accountController.getTrendingUsers);

export default routes;