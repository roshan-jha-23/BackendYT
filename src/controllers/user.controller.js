import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validations lagane padenge
  // like user ka naam >0 like email
  //check if user alreday exists:username and email
  //check if file present or not (avatar ko karo compulsary)
  //upload them cloudinary
  //create user object-create entry from db
  //remove pass word and refresh token field from response
  //check for user creation
  //return response
  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "Email or Username already in use");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  const user=await User.create({
    fullname,
    avatar: avatar.url,
    coverImage:coverImage?.url||"",
    email,
    username:username.toLowerCase(),
    password,
  })

  const createdUser=await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new ApiError(500,"Something Went Wrong Try Again Later")
  }
return res.status(201).json(
    new ApiResponse(200, createdUser,"User Created Successfully")
)


});

export { registerUser };
