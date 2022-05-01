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

//import "./rabbitSend";
//import "./rabbitReceive";



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

//import { ethers } from "ethers";
//var ethers = require("ethers");
//import { auctionContract } from "./service/web3/auction_contract";
//var auctionContract = require("./service/web3/auction_contract");

//var auctionContract = require("./service/web3/web3_eth");


// const filter = {
//   address:  "0x335A6a7fB26dd4450d30271d4fbcEe79b774160F",
//   topics: [
//       // the name of the event, parnetheses containing the data type of each event, no spaces
//       ethers.utils.id("Transfer(address,address,uint256)")
//   ]
// }
// ethProvider.on(filter, (log, event) => {
//   //console.log(log);
//   console.log(event);
//   return;
//   // do whatever you want here
//   // I'm pretty sure this returns a promise, so don't forget to resolve it
// })

