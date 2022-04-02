import { Router } from "express";
const routes = Router();
import accountRoutes from "./account/account.routes";
import authRoutes from "./auth/auth.routes";
import collectionRoutes from "./collection/collection.routes";
import miscRoutes from "./misc/misc.routes";
import nftRoutes from "./nft/nft.routes";
import statsRoutes from "./stats/stats.routes";


const PATH = {
    ROOT: "/",
    ACCOUNT: "/account",
    AUTH: "/auth",
    COLLECTION: "/collection",
    MISC: "/misc",
    NFT: "/nft",
    STATS: "/stats",
  };

  routes.use(PATH.ACCOUNT, accountRoutes);
  routes.use(PATH.AUTH, authRoutes);
  routes.use(PATH.COLLECTION, collectionRoutes);
  routes.use(PATH.MISC, miscRoutes);
  routes.use(PATH.NFT, nftRoutes);
  routes.use(PATH.STATS, statsRoutes);


  export default routes;