import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema({

    videoFile:{
        type:String,// cludnery url
        required:[true,"Video is required"]
    },
    thumbnmail:{
        type:String,// cludnary 
        required:true,
    },
    title:{
        type:String, 
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,// cludnery will send this
        required:true,
    },
    views:{
        type:Number,// cludnery will send this
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    videoOwner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    



},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)