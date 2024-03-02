import { UserSchema } from "@modules/users";
import { PostSchema } from ".";
import CreatePostDto from "./dtos/createPostDto.dto";
import { IComment, ILike, IPost, IShare } from "./post.interface";
import { HttpException } from "@core/exceptions";
import { IPagination } from "@core/interfaces";
import CreateCommentDto from "./dtos/createCommentDto.dto";

export default class PostService {
  //Create new post
  public async createPost(
    userId: string,
    postDto: CreatePostDto
  ): Promise<IPost> {
    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) {
      throw new HttpException(400, "User is not exist");
    }

    const newPost = new PostSchema({
      text: postDto.text,
      name: user.first_name + " " + user.last_name,
      avatar: user.avatar,
      user: userId,
    });

    const post = await newPost.save();
    return post;
  }

  //Update post
  public async updatePost(
    postId: string,
    postDto: CreatePostDto
  ): Promise<IPost> {
    const updatePostById = await PostSchema.findByIdAndUpdate(
      postId,
      { ...postDto },
      { new: true }
    ).exec();

    if (!updatePostById) {
      throw new HttpException(404, "Post is not found");
    }

    return updatePostById;
  }

  //Get all posts
  public async getAllPosts(): Promise<IPost[]> {
    const post: IPost[] = await PostSchema.find().exec();
    return post;
  }

  //get post by id
  public async getById(postId: string): Promise<IPost> {
    const post = await PostSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }
    return post;
  }

  //get all posts paging
  public async getAllPostsPaging(
    keyword: string,
    page: number
  ): Promise<IPagination<IPost>> {
    const pageSize: number = Number(process.env.PAGE_SIZE) || 10;

    let query = {};
    if (keyword) {
      query = {
        $or: [{ text: keyword }],
      };
    }
    const posts = await PostSchema.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const rowCount = await PostSchema.find(query).countDocuments().exec();

    return {
      total: rowCount,
      page: page,
      pageSize: pageSize,
      items: posts,
    } as IPagination<IPost>;
  }

  //delete post
  public async deletePost(userId: string, postId: string) {
    const post = await PostSchema.findByIdAndDelete(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }
    if (post.user.toString() !== userId) {
      throw new HttpException(400, "User is not authorized");
    }
  }

  //Like post
  public async likePost(userId: string, postId: string): Promise<ILike[]> {
    const post = await PostSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    if (post.likes.some((like: ILike) => like.user.toString() === userId)) {
      throw new HttpException(400, "Post already liked");
    }

    post.likes.unshift({ user: userId });

    await post.save();

    return post.likes;
  }

  public async unLikePost(userId: string, postId: string): Promise<ILike[]> {
    const post = await PostSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    if (!post.likes.some((like: ILike) => like.user.toString() === userId)) {
      throw new HttpException(400, "The post has not been liked yet");
    }

    post.likes = post.likes.filter(({ user }) => user.toString() !== userId);

    await post.save();

    return post.likes;
  }

  //Create a new comment
  public async createComment(comment: CreateCommentDto): Promise<IComment[]> {
    const post = await PostSchema.findById(comment.postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    const user = await UserSchema.findById(comment.userId)
      .select("-password")
      .exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const newComment = {
      text: comment.text!,
      name: user.first_name + " " + user.last_name,
      avatar: user.avatar,
      user: comment.userId!,
    };

    post.comments.unshift(newComment as IComment);
    post.save();

    return post.comments;
  }

  // Delete comment
  public async removeComment(
    commentId: string,
    postId: string,
    userId: string
  ): Promise<IComment[]> {
    const post = await PostSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }
    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId
    );

    if (!comment) {
      throw new HttpException(404, "Comment not found");
    }

    if (comment.user.toString() !== userId) {
      throw new HttpException(401, "User is not authorized");
    }

    post.comments = post.comments.filter(
      ({ _id }) => _id.toString() !== commentId
    );
    post.save();
    return post.comments;
  }

  //Share post
  public async sharePost(userId: string, postId: string): Promise<IShare[]> {
    const post = await PostSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }
    
    if (post.shares && post.shares.some((share: IShare) => share.user.toString() === userId)) {
      throw new HttpException(400, "Post already shared");
    }
    // if(!post.shares) {
    //     post.shares = [];
    // }

    post.shares.unshift({ user: userId });
    await post.save();

    return post.shares;
  }

  //unshare post
  public async unSharePost(userId: string, postId: string): Promise<IShare[]> {
    const post = await PostSchema.findById(postId).exec();
    if (!post) {
      throw new HttpException(404, "Post not found");
    }

    if (post.shares && !post.shares.some((share: IShare) => share.user.toString() === userId)) {
      throw new HttpException(400, "The post has not been shared yet");
    }
    if(!post.shares) {
        post.shares = [];
    }
    post.shares = post.shares.filter(({ user }) => user.toString() !== userId);

    await post.save();

    return post.shares;
  }
}
