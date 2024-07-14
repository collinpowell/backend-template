import httpContext from "express-http-context";
import express from "express";


import { config } from "dotenv";
config() // Configure .env
import middlewaresConfig from "./config/middlewares";

import "./config/database";

import apiRoutes from "./routes/index";

import { constants as APP_CONST } from "./constant/application";
//import "./pre-data/externalUser";


const app = express();

// All controllers should live here
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

app.use(express.static("public"));

const port = APP_CONST.PORT || 4000;

middlewaresConfig(app);
app.use(httpContext.middleware);


const PATH = {
    API: "/api",
};

app.use(PATH.API, apiRoutes);

app.get('*', function (req, res) {
  res.status(400).json({ statuscode: 400, body: "", message: "Bad Request (Invalid Route)" });
})
app.put('*', function (req, res) {
  res.status(400).json({ statuscode: 400, body: "", message: "Bad Request (Invalid Route)" });
})
app.delete('*', function (req, res) {
  res.status(400).json({ statuscode: 400, body: "", message: "Bad Request (Invalid Route)" });
})

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});


/**
 * 
 * git remote add origin https://gitlab.com/minto-nft-marketplace/minto-nft-marketplace-backend.git
git branch -M main
git push -uf origin main

git remote add origin1 https://github.com/collinpowell/minto-backend.git
git branch -M main
git push -u origin1 main

 */


