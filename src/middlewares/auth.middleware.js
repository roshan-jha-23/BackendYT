import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJwt=asyncHandler(async (req,res,next)=>{
   try {
    const token=req.cookies?.accessToken || req.header('Authorization')?.replace( 'Bearer ', '' )
 
    if(!token){
     throw new ApiError(401, 'You are not logged in!');
    }
 
   const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
   const user=await User.findById(decodedToken?._id).select('-password -refreshToken')
   if( !user ){
     //todo discuss abt frntend
     throw new  ApiError(401,'User does not exist!')
   }
   req.user = user;
   next();
   } catch (error) {
    throw new ApiError(400, error?._message||'Invalid Token!');
   }

})