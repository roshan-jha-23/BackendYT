import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // Check if userId is provided and exists
  if (userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(400, "User Not Found");
    }
  }

  const pipeline = [];

  // Match videos based on userId
  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // Match videos based on query
  if (query) {
    pipeline.push({
      $match: {
        isPublished: false,
        // You may need to adjust this to match your actual query condition
        // For example, to match against video titles or descriptions
        // { $or: [ { title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } } ] }
      },
    });
  }

  // Sort videos
  let sortField = { createdAt: -1 }; // Default sort by createdAt
  if (sortBy && sortType) {
    sortField = { [sortBy]: sortType === "asc" ? 1 : -1 };
  }
  pipeline.push({ $sort: sortField });

  // Pagination
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  console.log(pipeline);
  // Execute aggregation pipeline
  const videos = await Video.aggregate(pipeline);

  // Check if any videos found
  if (videos.length === 0) {
    return res.status(404).json(new ApiResponse(404, null, "No videos found"));
  }

  // Send response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        `All videos retrieved. Count: ${videos.length}`
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
