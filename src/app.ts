import express from "express";
import { config } from "dotenv";
config()
const app = express();
const port = process.env.APP_PORT || 8000; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );