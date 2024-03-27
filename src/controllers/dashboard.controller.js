import mongoose, { Mongoose } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  //getting the channel first from the req from user
  const channel = await User.findById(req.user?._id);
  if (!channel) {
    throw new ApiError(404, "User not found!");
  }
  const channelStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channel),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "video_likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "total_Subscriber",
      },
    },
    {
      $group: {
        _id: null,
        TotalVideos: { $sum: 1 }, // sum to get all videos of the user
        TotalViews: { $sum: "$views" },
        TotalSubscribers: {
          $first: {
            $size: "$total_subscribers",
          },
        },
        TotalLikes: {
          $first: {
            $size: "$video_likes",
          },
        },
      },
    },
    {
      $project: {
        TotalVideos: 1,
        TotalSubscribers: 1,
        TotalViews: 1,
        TotalLikes: 1,
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200,channelStats,"channel stats fetched successfully"))
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channel=await User.findById(req.user?._id);
  if(!channel){
    throw new ApiError(404,'User not found');
  }
  const channelVids = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channel),
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        createdAt: 1,
      },
    },
  ]);
  if(!channelVids){
    throw new ApiError(400,"problem while fetching");
  }
  return  res.status(200).json(new ApiResponse(200,channelVids,"videos of this channel"));
});

export { getChannelStats, getChannelVideos };
