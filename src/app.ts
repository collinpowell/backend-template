import httpContext from "express-http-context";
import express from "express";
import middlewaresConfig from "./config/middlewares";

import * as bodyParser from "body-parser";
import { config } from "dotenv";
config() // Configure .env

import "./config/database";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { constants as SWAGGER } from "./constant/swagger";

import apiRoutes from "./routes/index";

import { constants as APP_CONST } from "./constant/application";
import "./pre-data/category";
const options = SWAGGER;
const specs = swaggerJsDoc(options);

const app = express();

app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 50000
  })
);

app.use(express.static("public"));

const port = APP_CONST.PORT || 4000;

middlewaresConfig(app);
app.use(httpContext.middleware);


const PATH = {
    API: "/api",
    API_DOC: "/api-doc",
};

app.use(PATH.API, apiRoutes);
app.use(PATH.API_DOC, swaggerUI.serve, swaggerUI.setup(specs));

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});
