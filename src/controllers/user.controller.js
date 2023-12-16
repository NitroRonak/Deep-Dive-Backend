import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefreshToken = async (userID)=>{
    const user=await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}

}
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
    const coverImage=await uploadCloudinary(coverImageLocalPath);
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

export const loginUser=asyncHandler(async (req,res)=>{
    const {username,email,password}=req.body
    if(!username || !email){
        throw new ApiError(400,"username and email does not exist");
    }
    const user=User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist");
    }

    const isPasswordValid=await user.comparePassword(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credential");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    
    const loggedInUser=User.findById(user._id)
    .select("-password -refreshToken");

    return res.status(200)
    .cookie("accessToken",accessToken)
    .cookie("refreshToken",refreshToken)
    .json(new ApiResponse(200,{
        user:loggedInUser , accessToken ,refreshToken
    },
    "User Successfully logged In"
    ))

})