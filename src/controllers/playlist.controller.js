import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (name === "" || description === "") {
    throw new ApiError(400, "name and description are  required fields");
  }

  //TODO: create playlist

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });
  if (!playlist) {
    throw new ApiError(400, "error creating the playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  //TODO: get user playlists
  const { userId } = req.params;
  if (!isValidObjectId(userId) || !userId?.trim()) {
    throw new ApiError(400, "Invalid User ID");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user._id),
      },
    },
  ]);
  if (!playlist || playlist.length === 0) {
    throw new ApiError(400, "No playlist found for this user.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched Successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId) || !playlistId?.trim()) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist Not Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !playlistId?.trim()) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  if (!isValidObjectId(videoId) || !videoId?.trim()) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  let videoPlaylist;
  if (playlist.owner.toString() === req.user?._id.toString()) {
    videoPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $addToSet: { videos: videoId },
      },
      {
        new: true,
      }
    );
  } else {
    throw new ApiError(400, "Unauthorized access to playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoPlaylist, "Added to the playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !playlistId?.trim()) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  if (!isValidObjectId(videoId) || !videoId?.trim()) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const video = await Video.findById(videoId);
  const playlist = await Playlist.findById(playlistId);
  if (!video || !playlist) {
    throw new ApiError(400, "The provided info is not matching  our records");
  }
  //Checking whether user has permission or not
  let newPlaylist;
  if (playlist.owner.toString() === req.user?._id.toString()) {
    newPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: videoId,
        },
      },
      {
        new: true,
      }
    );
  } else {
    throw new ApiError(400, "you are not authorized to perform this actions");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newPlaylist, "video deleted from the playlist"));
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletePlaylist) {
    throw new ApiError(404, "Playlist Not Found");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Deleted The Playlist"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (name === "" || description === "") {
    throw new ApiError(400, "Name and  Description are required fields.");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist Id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist is not found");
  }
  let updatedPlaylist;
  if (playlist.owner.toString() === req.user?._id.toString()) {
    updatePlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          name,
          description,
        },
      },
      {
        new: true,
      }
    );
  } else {
    throw new ApiError(400, "You are not allowed this  action.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatePlaylist, "Playlist updated Successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
