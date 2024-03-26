import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import {Playlist} from '../models/playlist.model.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  if (page < 1 && limit > 10) {
    throw new ApiError(400, "Invalid Page no and limit");
  }
  if (!query && !query.trim()) {
    throw new ApiError(400, "Please provide a valid search query!");
  }
  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "User ID must be a valid ObjectID");
  }
  //finding user from the database
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User Not Found");
  }
  // defining search criteria
  const searchCriteria = {};
  if (sortBy && sortType) {
    searchCriteria[sortBy] = sortType === "asc" ? 1 : -1; //assigning the search criteria
  } else {
    searchCriteria["createdAt"] = -1;
  }
  //defining the options to paginate
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: searchCriteria,
  };

  const videoAggregation = Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user),
      },
    },
    {
      $match: {
        title: {
          $regex: query,
        },
      },
    },
  ]);
  //using aggregate paginate
  const videos = await Video.paginate(videoAggregation, options).catch(
    (err) => {
      console.log("error in pagination", err);
    }
  );
  if (videos.totalDocs === 0) {
    // totalDocs is available as we are using aggregate paginate
    throw new ApiError(400, "No videos matched the searched query.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Fetched  Videos Successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  const userID = req.user?._id;
  if (!userID) {
    throw new ApiError(403, "User is Not Allowed To Publish A Video");
  }
  if (title === "" || description === "") {
    throw new ApiError(400, "Title and Description are required fields!");
  }

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video  && Thumbnail is required");
  }
  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Avatar is required");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: { url: thumbnail.url, public_id: thumbnail.public_id },
    duration: videoFile.duration,
    owner: req.user?._id,
  });
  if (!video) {
    throw new ApiError(400, "Something went error");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video has been published"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId) && !videoId?.trim()) {
    throw new ApiError(400, "Invalid video ID");
  }
  const videoSearched = await Video.findById(videoId).select(
    "-videoFile._id -thumbnail._id -updatedAt"
  );

  if (!videoSearched) {
    throw new ApiError(404, "This video does not exist");
  }
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $addToSet: { watchHistory: videoSearched._id },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoSearched,
        "Successfully got the video information"
      )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail
  if (!isValidObjectId(videoId) && !videoId?.trim()) {
    throw new ApiError(400, "Invalid video ID");
  }
  if (title === "" || description === "") {
    throw new ApiError(
      400,
      "Please provide a valid title and description for the video."
    );
  }
  let newThumbnailLocalPath = req.file?.path;
  if (!newThumbnailLocalPath) {
    throw new ApiError(400, "No file provided.");
  }
  const thumbnailNew = await uploadOnCloudinary(newThumbnailLocalPath);
  if (!thumbnailNew) {
    throw new ApiError(400, "Failed to save image on cloudinary server.");
  }
  const updateVideo = await Video.findById(videoId);

  if (!updateVideo) {
    throw new ApiError(404, "Video not found.");
  }
  const oldThumbnailPublicId = updateVideo?.thumbnail.public_id;
  let updatedVideo;

  if (updateVideo.owner.toString() === req.user._id.toString()) {
    updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
          thumbnail: {
            url: newThumbnail.url,
            public_id: newThumbnail.public_id,
          },
        },
      },
      { new: true }
    );
  } else {
    await deleteOnCloudinary(newThumbnail.public_id);
    throw new ApiError(
      404,
      "Unauthorized access. You are not the creator of the video."
    );
  }

  // deleting old thumbnail from cloudinary
  const oldThumbnailDeleted = await deleteOnCloudinary(oldThumbnailPublicId);

  if (!oldThumbnailDeleted) {
    throw new ApiError(404, "Old thumbnail not deleted");
  }

  // returning response
  return res
    .status(200)
    .json(new ApiResponse(201, updatedVideo, "Video updated successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId) && !videoId?.trim()) {
    throw new ApiError(400, "Invalid ID");
  }
  const deleteVideo = await Video.findById(videoId);
  if (!deleteVideo) {
    throw new ApiError(400, "No video with this id found");
  }
  //extracting out the videoFile and thumbnail
  const deleteVideoFile = deleteVideo.videoFile.public_id;
  const deleteThumbnail = deleteVideo.thumbnail.public_id;
  if (deleteVideo.owner.toString() === req.user._id.toString()) {
    await deleteOnCloudinary(deleteVideoFile);
    await deleteOnCloudinary(deleteThumbnail);
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    const comments = await Comment.find({ video: deletedVideo._id });
    const commentsIds = comments.map((comment) => comment._id);
    if (deletedVideo) {
      await Like.deleteMany({
        video: deletedVideo._id,
      });
      await Like.deleteMany({ comment: { $in: commentsIds } });
      await Comment.deleteMany({ video: deletedVideo._id });
      const playlists = await Playlist.find({ videos: deletedVideo._id });
      const users = await User.find({ watchHistory: deletedVideo._id });

      for (const playlist of playlists) {
        await Playlist.findByIdAndUpdate(
          playlist._id,
          {
            $pull: { videos: deletedVideo._id },
          },
          { new: true }
        );
      }

      for (const user of users) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $pull: { watchHistory: deletedVideo._id },
          },
          { new: true }
        );
      }
    } else {
      throw new ApiError(400, "Something went wrong while deleting the video.");
    }
  } else {
    throw new ApiError(
      400,
      "Unauthorized access. You are not the owner of the video."
    );
  }
  return res.status(200).json(new ApiResponse(200,{},"Successfully deleted the video"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId) && !videoId?.trim()) {
    throw new ApiError(400, "Invalid ID");
  }
  const toggleVideo = await Video.findById(videoId);
  if (!toggleVideo) {
    throw new ApiError(404, "No video found with this id.");
  }
  let toggledVideo;
  if (toggleVideo.owner.toString() === req.user._id.toString()) {
    toggledVideo = await Video.aggregate([
      videoId,
      {
        $set: { isPublished: !toggleVideo.isPublished },
      },
      {
        new: true,
      },
    ]);
  } else {
    throw new ApiError(400, "Unauthorized  access.");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, toggledVideo, "publish status changed successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
