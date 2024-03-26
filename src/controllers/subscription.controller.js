import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId) || !channelId?.trim()) {
    throw new ApiError(400, "Invalid Channel ID");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  if (channel._id.toString() === req.user?._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }
  const channelAlreadySubscribed = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channel._id,
  });
  if (channelAlreadySubscribed) {
    await Subscription.findByIdAndDelete(channelAlreadySubscribed);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unfollowed the user"));
  } else {
    await Subscription.create({
      subscriber: req.user?._id,
      channel: channel._id,
    });
  }
  return res
    .status(201)
    .json(new ApiResponse(201, {}, "Channel Subscribed SuccessFully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId) || !channelId?.trim()) {
    throw new ApiError(400, "Invalid Channel ID");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "Subscriber",
      },
    },
    {
      $project: {
        subscriber: {
          _id: 1,
          username: 1,
          email: 1,
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully.")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(404, "Invalid subscriber Id");
  }

  const subscriber = await User.findById(subscriberId);

  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
      },
    },
    {
      $project: {
        subscribedChannel: {
          _id: 1,
          fullname: 1,
          username: 1,
          email: 1,
          avatar: 1,
          coverImage: 1,
        },
      },
    },
  ]);
  if (!subscribedChannels.length) {
    throw new ApiError(400, "no channel subscribed");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Channel Subscribed SuccessFully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
