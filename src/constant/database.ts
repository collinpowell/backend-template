import {environments,NODE_ENV} from "./environments"

export const constants = {
  MONGODB_URI: 
  environments.DEV == NODE_ENV ? process.env.MONGODB_URI:
    environments.PROD == NODE_ENV ? process.env.MONGODB_URI:
      environments.TEST == NODE_ENV ? process.env.MONGODB_URI :
        process.env.MONGODB_URI
};
