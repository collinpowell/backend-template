import express from "express";

import * as bodyParser from "body-parser";
import { config } from "dotenv";
config() // Configure .env

import "./config/database";

import apiRoutes from "./routes/index";

import { constants as APP_CONST } from "./constant/application";
const port = APP_CONST.PORT || 4000;

const app = express();

app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 50000
  })
);

const PATH = {
    API: "/api",
    API_DOC: "/api-doc",
};

app.use(PATH.API, apiRoutes);

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );