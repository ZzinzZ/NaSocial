import PostController from "./post.controller";
import { Route } from "@core/interfaces";
import validationMiddleware from "@core/middlewares/validation.middleware";
import { Router } from "express";
import CreatePostDto from "./dtos/createPostDto.dto";
import { authMiddleware } from "@core/middlewares";
import CreateCommentDto from "./dtos/createCommentDto.dto";

export default class PostRoute implements Route {
  public path = "/api/v1/posts";
  public router = Router();

  public postController = new PostController();
  
  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    //POST Create new post
    this.router.post(
      this.path,
      authMiddleware,
      validationMiddleware(CreatePostDto, true),
      this.postController.createPost
    );

    //PUT update post
    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationMiddleware(CreatePostDto, true),
      this.postController.updatePost
    );

    //GET get all posts
    this.router.get(this.path, this.postController.getAllPost);

    //GET get post by id
    this.router.get(this.path + "/:postId", this.postController.getPostById);

    //GET get all posts paging
    this.router.get(
      this.path + "/paging/:page",
      this.postController.getAllPostPaging
    );

    //DELETE delete post
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.postController.deletePost
    );

    //POST like post
    this.router.post(
      this.path + "/like/:id",
      authMiddleware,
      this.postController.likePost
    );

    //DELETE unlike post
    this.router.delete(
      this.path + "/like/:id",
      authMiddleware,
      this.postController.unLikePost
    );

    //POST comment post
    this.router.post(
      this.path + "/comments/:id",
      authMiddleware,
      validationMiddleware(CreateCommentDto, true),
      this.postController.createComment
    );

    //DELETE comment post
    this.router.delete(
      this.path + "/comments/:id/:comment_id",
      authMiddleware,
      this.postController.removeComment
    );

    //POST share post
    this.router.post(
      this.path + "/shares/:id",
      authMiddleware,
      this.postController.sharePost
    );

    //DELETE unlike post
    this.router.delete(
      this.path + "/shares/:id",
      authMiddleware,
      this.postController.unSharePost
    );
  }

  
}