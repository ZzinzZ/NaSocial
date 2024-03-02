import { NextFunction, Request, Response } from "express";
import PostService from "./post.service";
import CreatePostDto from "./dtos/createPostDto.dto";
import CreateCommentDto from "./dtos/createCommentDto.dto";

export default class PostController {
  private postService = new PostService();

  //Create new post controller
  public createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: CreatePostDto = req.body;
      const userId = req.user.id;
      const newPost = await this.postService.createPost(userId, model);
      res.status(200).json(newPost);
    } catch (error) {
      next(error);
    }
  };

  //Update post by Id
  public updatePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const model: CreatePostDto = req.body;
      const postId = req.params.id;
      const post = await this.postService.updatePost(postId, model);
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  //Get all posts
  public getAllPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const posts = await this.postService.getAllPosts();
      res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  //Get post by id
  public getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = req.params.id;
      const post = await this.postService.getById(postId);
      res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  //Get get all post paging
  public getAllPostPaging = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page: number = Number(req.params.page);
      const keyword = req.query.keyword || "";
      const paginationResult = await this.postService.getAllPostsPaging(
        keyword.toString(),
        page
      );
      res.status(200).json(paginationResult);
    } catch (error) {
      next(error);
    }
  };

  //Delete post
  public deletePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const post = await this.postService.deletePost(userId, postId);
      res.status(200).json({ message: "delete post successfully" });
    } catch (error) {
      next(error);
    }
  };

  //Like post
  public likePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const likePost = await this.postService.likePost(userId, postId);
      res.status(200).json(likePost);
    } catch (error) {
      next(error);
    }
  };

  //Un Like post
  public unLikePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const likePost = await this.postService.unLikePost(userId, postId);
      res.status(200).json(likePost);
    } catch (error) {
      next(error);
    }
  };

  //Create new comment to post
  public createComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const text = req.body.text;
      const userId = req.user.id;
      const postId = req.params.id;
      const comment = await this.postService.createComment({
        text: text,
        userId: userId,
        postId: postId,
      });
      res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  };

  //Create new comment to post
  public removeComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const commentId = req.params.comment_id;
      const userId = req.user.id;
      const postId = req.params.id;
      const result = await this.postService.removeComment(
        commentId,
        postId,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  //Share post
  public sharePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const shared = await this.postService.sharePost(userId, postId);
      res.status(200).json(shared);
    } catch (error) {
      next(error);
    }
  };

  //Un share post
  public unSharePost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const shared = await this.postService.unSharePost(userId, postId);
      res.status(200).json(shared);
    } catch (error) {
      next(error);
    }
  };
}