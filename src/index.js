// require('dotenv').config({path:'./env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`server is Running at Port : ${process.env.PORT}`);
  })
})
.catch((err) => console.log("Mongo DB connection failed!!!!!",err));









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
