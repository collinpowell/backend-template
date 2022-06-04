import httpContext from "express-http-context";
import express from "express";
import middlewaresConfig from "./config/middlewares";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

import * as bodyParser from "body-parser";
import { config } from "dotenv";
config() // Configure .env

import "./config/database";

import apiRoutes from "./routes/index";

import { constants as APP_CONST } from "./constant/application";
import "./pre-data/category";
import "./service/sm_eventListener"


const app = express();

Sentry.init({
  dsn: "https://a84bdb8bfbe84a199ff502924f1089e1@o1015251.ingest.sentry.io/6382715",
  // or pull from params
  // dsn: params.SENTRY_DSN,
  environment: "Minto",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  // or pull from params
  // tracesSampleRate: parseFloat(params.SENTRY_TRACES_SAMPLE_RATE),
});

app.use(
  Sentry.Handlers.requestHandler({
    serverName: false,
    user: ["email"],
  })
);

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// All controllers should live here
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});


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


