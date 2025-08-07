import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//importing user schema to check for duplicay
import {User} from "../models/user.model.js"
// to uplaod the files in cloudinary 
import{uploadOnCLoudinary} from "../utils/cloudinary.js"
import { JWT } from "jsonwebtoken";

const generateRefreshAndAccessToken= async(userId)=>{
    try {
        const user=await User.findById(userId);
      const accessToken=  user.generateAccessToken();
     const refreshToken= user.generateRefreshToken();
     user.refreshToken=refreshToken; // save in mongo db
     await user.save({validateBeforeSave:false});
     return {accessToken,refreshToken};
        
    } catch (error) {
        throw new apiError(500,"Something went wrong genrating the access or refresh token:")
        
    }

}

 // 1.get user details from frontend
    // 2 .validaton -not empty
    // 3.check if user already exists:username,email
    // 4.check for images and avatar
    // 5.upload then to cloudinary,avatar is uploaded or not
    // 6.Create User Object- create entry in db
    // 7.remove the password and refresh token field from response
    // 8.check  for user Creation 
    // 9.return res
    // we can take the data by req.body
    // but we cant take any file directly from front end so we use multer as a middleware in the /register Route

const registerUser = asyncHandler( async (req,res)=>{
   
    const {username,password,email,fullName }=req.body
    console.log("email:",email,"password:",password);

 
//VALIDATION
   if( 
     [fullName,username,password,email].some((field)=>
    field ?.trim()==="")
    ){
        throw new apiError(400,"All fields are required!");
        
    }
    //DUPLICATE USER OR NOT
   const userExists= await User.findOne({
        $or:[{username},{email}]
    })

    if(userExists)
        {
        throw new apiError(409,"User with same username or email already exits!")
    }

    // GETTIN THE PATH OF AVATAR AND IMAGE AND VEROFYING THE AVATAR
    
    //   console.log(req.files)

    const avatarLocalPath=req.files?.avatar[0]?.path;
    console.log(avatarLocalPath)


//  console.log("All received files:", Object.keys(req.files));
//   console.log("Avatar file:", req.files?.avatar?.[0]);
//   console.log("Cover image file:", req.files?.coverImage?.[0]);

 

    
      const coverImageLocalPath= req.files?.coverImage[0]?.path;
      console.log("COVERIMAGE LOCAL PATH:",coverImageLocalPath)



     
    
     if(!avatarLocalPath) throw new apiError(400,"Avatar Required for Register");
     if(!coverImageLocalPath) throw new apiError(400,`coverImage is required`);

    const avatarUploadResult = await uploadOnCLoudinary(avatarLocalPath) // wait till uplaod
    const coverImageUplaodResult= await uploadOnCLoudinary(coverImageLocalPath);
    if(!avatarUploadResult)
        {
        throw new apiError(400,"Avatar Required for Register");
    }



    if(!coverImageUplaodResult)
        {
        throw new apiError(400,"coverImage Required for Register: inside the suer controoler.js");

    }
    // 6.Create User Object- create entry in db

   const user=await User.create({
        fullName,
        username:username.toLowerCase(),
        avatar:avatarUploadResult.url ,
        coverImage:coverImageUplaodResult?.url||"",// coverimage hai to lo nahi to blank choro;
        email,
        password

    })
    // 7.remove the password and refresh token field from response

        const createdUser= await User.findById(user._id).select(
            "-password -refreshToken"
        );// user created + 2 fields removed from the response (password,refrteshToken)
    // 8.check  for user Creation 

        if(!createdUser){
            throw new apiError(500,"Something went wrong while registering the user");
        }
    // 9.return res

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Created Successfully")
    )


})

const loginUser=asyncHandler(async (req,res)=>{
    //1. Req body ->data
    //2.check user email and or username
    //3. find user
    //2. verify the password ;
    //4.acces and refresh token
    //send these tokens using cookies.

    const {email,password,username}=req.body;
    console.log('email :>> ', email);
    console.log('UserName :>> ', username);

    if(!(username ||email)){
        throw new apiError(400," Username or password required")
    }
   const user= await User.findOne({
        $or:[{username},{email}] // any usename or password
    })
    if(!user){
        throw new apiError(404,"User Not found");
    } // user register tha hi nahi kabi

   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid) {throw new apiError(401,"Invalid User Credentials")}

  const{accessToken,refreshToken} =await generateRefreshAndAccessToken(user._id);

   const loggedInUser=await User.findById(user._id).select("-password -refreshToken"); // databasew call again to get the details of this user except the password and refresh token

   const options={ // now cookis only modifiable at the server ":"
    httpOnly:true,
    secure:true

   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },
    {
        message:"User LoggedIn Successfully..."
    }
)
   )
    


})
const logoutUser= asyncHandler(async (req,res)=>{
   await User.findByIdAndUpdate( req.user._id,
        {  $set:{ refreshToken:undefined}

        },{
            new:true
        }
    )

    const options={
    httpOnly:true,
    secure:true

   } 
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshtoken",options)
   .json( new ApiResponse(200,"userLoggedOut Successfully"));



})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken|| req.body
    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized Request")
    }
   try {
    const decodedToken= JWT.verify(incomingRefreshToken
         ,process.env.REFRESH_TOKEN_SECRET)
      const userDetail=  await User.findById(decodedToken?._id)
        if(!userDetail){
         throw new apiError(401,"Invalid TRefreshToken")
     }
     if(incomingRefreshToken !==userDetail?.refreshToken){
         throw new apiError("401","refresh token expired or Used")
     }
    const options={
     httpOnly:true,
     secure:true
    }
    const {newRefreshToken,accessToken}= await generateRefreshAndAccessToken(userDetail._id);
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
     new ApiResponse(200,
         {
             accessToken,
            refreshToken:newRefreshToken },
            "Access Token Refreshed"
         ))
   } catch (error) {
    throw new apiError(401,error?.message||"Invalid refresh Token")
    
   }

}
)



export {registerUser,loginUser,logoutUser,refreshAccessToken};



