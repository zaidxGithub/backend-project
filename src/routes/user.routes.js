import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'
const router = Router()
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controllers.js";

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",maxCount:1
        },
        {
            name:"coverImage",maxCount:1
        }
    ])
    
,registerUser)
router.route("/login").post(loginUser);
//secur routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken)


// router.route("/login").get(registerUser)




export default router;