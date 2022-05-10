import {environments,NODE_ENV} from "./environments"

export const constants = {
  MONGO_URL: 
  environments.DEV == NODE_ENV ? process.env.MONGO_URL_DEV :
    environments.PROD == NODE_ENV ? process.env.MONGO_URL_PROD :
      environments.TEST == NODE_ENV ? process.env.MONGO_URL_TEST :
        process.env.MONGO_URL_PROD
};
