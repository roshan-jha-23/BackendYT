import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const videoAlreadyLiked = await Like.findOne({
    video: video._id,
    likedBy: req.user?._id,
  });
  if (videoAlreadyLiked) {
    await Like.findByIdAndDelete(videoAlreadyLiked._id);
    return res.status(200).json(new ApiResponse(200, {}, "Unliked the video"));
  } else {
    await Like.create({
      video: video._id,
      likedBy: req.user?._id,
    });
  }
  //returning response final
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Liked Successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  const commentAlreadyLiked = await Like.findOne({
    comment: comment._id,
    likedBy: req.user?._id,
  });
  if (commentAlreadyLiked) {
    await Like.findByIdAndDelete(commentAlreadyLiked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Disliked the comment"));
  } else {
    await Like.create({
      comment: comment._id,
      likedBy: req.user?._id,
    });
  }
  //returning response final
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment Liked Successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  const tweetAlreadyLiked = await Like.findOne({
    tweet: tweet._id,
    likedBy: req.user?._id,
  });
  if (tweetAlreadyLiked) {
    await Like.findByIdAndDelete(tweetAlreadyLiked._id);
    return res.status(200).json(new ApiResponse(200, {}, "Disliked the tweet"));
  } else {
    await Like.create({
      tweet: tweet._id,
      likedBy: req.user?._id,
    });
  }
  //returning response final
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet Liked Successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideo = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?.id),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        views: 1,
        owner: 1,
      },
    },
  ]);
  if (likedVideo?.length === 0) {
    throw new ApiError(404, "No Video Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "Liked Video Fetched"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
