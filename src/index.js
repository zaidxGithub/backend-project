import express from "express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import {app} from"./app.js";




connectDB()
  .then(() => {
    app.listen(process.env.PORT || 6000, () => {
      console.log(`APPLICATION RUNNING ON PORT: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO DB connection Failed !!!", error);
  });


