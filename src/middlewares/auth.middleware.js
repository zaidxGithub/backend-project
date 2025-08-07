import { apiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const verifyJWT=asyncHandler(async(req,res,next)=>{
    // cookies se ya header se token lo, header me token eaise ata h 
    // Authorization :Bearer <token>  ,hame sirf token cchye to hamne replce method use kiya js ka ,agr Bearer keyword mile to empty string se replace kare
try {
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer","").trim();
    
    if(!token) { throw new apiError(401,"unauthorized request")};
    //vberify the token
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user){
        throw new apiError(401,"Invalid access Token")
    }
    req.user=user;
    next();
} catch (error) {
    throw new apiError(401,error?.message||"invalid accesToken")
    
}
 
})