// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

connectDB();









/*
import express from  'express';
const app=express()

(async () => {
  try {
    mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on('error',()=>{
        console.log("db cannot talk bruv",error);
        throw error;
    })
    app.listen(process.env.PORT,()=>{
        console.log("app is listening on port");
    })
  } catch (error) {
    console.log("ERROR::", error);
  }
})();*/
