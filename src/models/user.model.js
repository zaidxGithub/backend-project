import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cludnary url will be used.
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String, // we will store encrypted pass as string
      required: [true, "Password is required"],
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// this code is for encrypting the password only when it is  changed
userSchema.pre("save",async function(next){ 
    // if password is changed only then run the code if not then return next... isModified is builtin to check if something is changed or not
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password,8)
    next()
})
// creating our builtin methods 

userSchema.methods.isPasswordCorrect= async function(password){  
    /* it will return true or false if 
    string password  of user is === encrypted password in tge db*/
 return  await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { 
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }


    )

    

}
userSchema.methods.generateRefreshToken=function(){
     return jwt.sign(
        {
            _id:this._id
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        { 
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }


    )


}


export const User = mongoose.model("User", userSchema);
