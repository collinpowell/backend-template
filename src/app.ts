import express from "express";


import { config } from "dotenv";
config() // Configure .env

import "./config/database";

import apiRoutes from "./routes/index";

import { constants as APP_CONST } from "./constant/application";
const port = APP_CONST.PORT || 4000;

const app = express();

const PATH = {
    API: "/api",
    API_DOC: "/api-doc",
};

app.use(PATH.API, apiRoutes);

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );