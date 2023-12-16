import express from 'express';
import { loggedOutUser, loginUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
const router=express.Router();

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]), registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyUser,loggedOutUser);
export default router;