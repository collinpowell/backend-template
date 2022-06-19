import { environments, NODE_ENV } from "./environments"

export const constants = {
  PORT: process.env.PORT || 4000,
  FRONTENDURL: environments.DEV == NODE_ENV ?  process.env.USER_END_POINT_DEV:
    environments.PROD == NODE_ENV ? process.env.USER_END_POINT_MAINNET :
      environments.TEST == NODE_ENV ? process.env.USER_END_POINT_TESTNET :
        process.env.USER_END_POINT_TESTNET
};
