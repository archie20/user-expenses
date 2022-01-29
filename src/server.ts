import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import mongoose from "mongoose";
import routes from './routes/route';
import dotenv from 'dotenv';

(async () => {
const router: Express = express();
dotenv.config();
const isDev = process.env.NODE_ENV === "development";

/** Logging */
router.use(morgan('dev'));
/** Request parser */
router.use(express.urlencoded({ extended: false }));

router.use(express.json());

//=====================SETUP MONGOOSE===============================
const mongoUrl = process.env.MONGO_DB_URL?? 'none';
    mongoose.connect(mongoUrl)
        .then(() => console.log("Connected to Mongo!"))
        .catch(() => console.error("Mongo connection error"));


router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH POST');
        return res.status(200).json({});
    }
    next();
});

/** Routes */
router.use('/', routes);

/** Error handling */
router.use((error:any, req:any, res:any, next:any) => {
    console.log(error);
    return res.status(404).json({
        message: error.message
    });
});


const normalizePort = (val: string): boolean | string | number => {
    const port = parseInt(val, 10);

    // named pipe
    if (isNaN(port)) return val;

    // port number
    if (port >= 0) return port;

    return false;
};


/* Event listener for HTTP server "error" event */
const onError = (error: any): void => {
    if (error.syscall !== "listen") throw error;

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
        default:
            throw error;
    }
};


/* Event listener for HTTP server "listening" event */
const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
    if (isDev) console.log("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
    router.set("port", port);

/** Server */
const server = http.createServer(router);
server.on("error", onError);
server.on("listening", onListening);


server.listen(port);
})();