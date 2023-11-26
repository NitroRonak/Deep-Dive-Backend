import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser=asyncHandler(async (req,res)=>{
    const {username,password,email,fullName}=req.body;
    if([username,password,email,fullName].some((field)=>
    field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
    const exitedUser=await User.findOne({
        $or:[{username},{email}]
    });
    if(exitedUser){
        throw new ApiError(409,"User with username and email already exists");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    //upload avatar on cloudinary
    const avatar=await uploadCloudinary(avatarLocalPath);
    const coverImage=await uploadCoverImage(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Somthing went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})