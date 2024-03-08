import { Router } from "express";
const routes = Router();
import accountRoutes from "./account/account.routes";
import authRoutes from "./auth/auth.routes";

const PATH = {
  ROOT: "/",
  ACCOUNT: "/account",
  AUTH: "/auth"
};

routes.use(PATH.ACCOUNT, accountRoutes);
routes.use(PATH.AUTH, authRoutes);

export default routes;