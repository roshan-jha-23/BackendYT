import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(videoId)) {
    throw new ApiError("Invalid video ID", 400);
  }
  if(page<1 ||limit>10){
    throw new ApiError(400,"Invalid page and limit no")
  }
  const video=await Video.findById(videoId);
  if(!video){
    throw new ApiError(404,"Video not found");
  }
  const videoComment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(video),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "commentLikes",
      },
    },
    {
      $addFields: {
        commentLikesCount: {
          $size: "$commentLikes",
        },
        commentOwner: {
          $first: "$commentOwner",
        },
        isLiked: {
          if: { $in: [req.user?._id, "$commentLikes.likedBy"] },
          then: true,
          else: false,
        },
      },
    },
    {
      $project: {
        $project: {
          content: 1,
          createdAt: 1,
          commentLikesCount: 1,
          commentOwner: {
            username: 1,
            avatar: 1,
          },
          isLiked: 1,
        },
      },
    },
  ]);
 if (!comments) {
   return res
     .status(200)
     .json(new apiResponse(200, {}, "Video has no comments."));
 }

 // returning response
 return res
   .status(200)
   .json(
     new apiResponse(200, comments, "Video comments fetched successfully.")
   );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (content === "") {
    throw new ApiError(
      400,
      "This field is empty it cannot be proccessed further"
    );
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }
  const commentdone = await Comment.create({
    content,
    video: video._id,
    owner: req.user?._id,
  });
  if (!commentdone) {
    throw new ApiError(400, "Error while adding comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, commentdone, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content } = req.body;
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  if (content === "") {
    throw new ApiError(400, "Content can't be empty");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment cannot be found");
  }
  let updatedComment;
  if (updateComment.owner.toString() === req.user?._id.toString()) {
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: { content },
      },
      { new: true }
    );
  }

  // returning response
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment updated successfully.")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID.");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (comment.owner.toString() !== req.user?._id.toString()) {
    await Comment.findByIdAndDelete(commentId);
    await Like.deleteMany({
      comment: comment._id,
    });
  } else {
    throw new ApiError(
      400,
      "Comment cannot be deleted as u are not authorized"
    );
  }
  return res.status(200).json(new ApiResponse(200, {}, "Deleted the comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
