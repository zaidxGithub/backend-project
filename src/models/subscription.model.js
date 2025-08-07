import mongoose, { Schema} from "mongoose";
const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,// one who is sbcribing 
        ref:"User"

    },
    channel:{
          type:Schema.Types.ObjectId,// one who is Subcribedd 
          ref:"User"

    }
},{timestamps:true})
export const Subscription=mongoose.model(Subscription,subscriptionSchema);