

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from './routes/user.routes.js'

console.log("Roiuter Loaded")

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
// url encoder
app.use(express.urlencoded({limit: "16kb" },{extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

// routes import here 
console.log("Router Loaded");


app.use("/api/v1/users",userRouter);


export { app };


