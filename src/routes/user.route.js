import express from 'express';
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loggedOutUser, loginUser, refereshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js';
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
router.route("/refresh-token").post(refereshAccessToken);
router.route("/change-password").post(verifyUser,changePassword);
router.route("/current-user").get(verifyUser,getCurrentUser);
router.route("/update-account").patch(verifyUser,updateAccountDetails);
router.route("/avatar").patch(verifyUser,upload.single("avatar"),updateUserAvatar);
router.route("/cover-image").patch(verifyUser,upload.single("/coverImage"),updateUserCoverImage);
router.route("/c/:username").get(verifyUser,getUserChannelProfile);
router.route("/history").get(verifyUser,getWatchHistory);

export default router;