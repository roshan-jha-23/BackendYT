import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (content === "") {
    throw new ApiError(400, "Content cannot be empty");
  }
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "No defined User for this request ");
  }
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });
  if (!tweet) {
    throw new ApiError(400, "No Such Tweet Made");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, " Tweet Created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!isValidObjectId(userId) || !userId?.trim()) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Invalid,REQUEST USER NOT FOUND");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  if (tweets.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No Tweets Found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tweets.reverse(),
        "Successfuly Retrieved Your Tweets"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { newContent } = req.body;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }
  if (newContent === "") {
    throw new ApiError(400, "content field cannot be empty");
  }
  let tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    {
      new: true,
    }
  );
  if (!tweet) {
    throw new ApiError(404, "Tweet not found!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Updated Successfully!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }
  await Tweet.findByIdAndDelete(tweetId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Deleted Successfully!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
