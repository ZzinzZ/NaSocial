import IUser from "@modules/users/user.interface";
import {
  IEducation,
  IExperience,
  IFollower,
  IFollowing,
  IFriend,
  IProfile,
  ISocial,
} from "./profile.interface";
import ProfileSchema from "./profile.model";
import { HttpException } from "@core/exceptions";
import normalize from "normalize-url";
import CreateProfileDto from "./dtos/createProfile.dto";
import { UserSchema } from "@modules/users";
import AddExperienceDto from "./dtos/addExperience.dto";
import AddEducation from "./dtos/addEducation.dto";

class ProfileService {
  // Get current profile
  public async getCurrentProfile(userId: string): Promise<Partial<IUser>> {
    const user = await ProfileSchema.findOne({
      user: userId,
    })
      .populate("user", ["name", "avatar"])
      .exec();

    if (!user) {
      throw new HttpException(400, "There is no profile found");
    }
    return user;
  }

  // Create a new profile
  public async createProfile(
    userId: string,
    profileDto: CreateProfileDto
  ): Promise<IProfile> {
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      youtube,
      twitter,
      facebook,
      instagram,
      linkedin,
    } = profileDto;

    const profileFields: Partial<IProfile> = {
      user: userId,
      company,
      location,
      website:
        website && website != ""
          ? normalize(website.toString(), { forceHttps: true })
          : "",
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill: string) => " " + skill.trim()),
      status,
    };

    const socialFields: ISocial = {
      youtube,
      twitter,
      facebook,
      instagram,
      linkedin,
    };

    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0) {
        socialFields[key] = normalize(value, { forceHttps: true });
      }
    }

    profileFields.social = socialFields;

    const profile = await ProfileSchema.findOneAndUpdate(
      {
        user: userId,
      },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return profile;
  }

  // Delete profile
  public async deleteProfile(userId: string) {
    // Remove profile
    await ProfileSchema.findOneAndDelete({ user: userId }).exec();
    //Remove user
    await UserSchema.findOneAndDelete({ user: userId }).exec();
  }

  //Get all profiles
  public async getAllProfiles(): Promise<Partial<IUser>[]> {
    const profiles = await ProfileSchema.find()
      .populate("user", ["name", "avatar"])
      .exec();

    return profiles;
  }

  // Add experience to profile
  public addExperience = async (
    userId: string,
    experience: AddExperienceDto
  ) => {
    const newExperience = {
      ...experience,
    };

    const profile = await ProfileSchema.findOne({ user: userId }).exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.experience.unshift(newExperience as IExperience);
    await profile.save();
    return profile;
  };

  //Delete profile experience
  public deleteProfileExperience = async (
    userId: string,
    experienceId: string
  ) => {
    const profile = await ProfileSchema.findOne({ user: userId }).exec();

    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== experienceId
    );
    await profile.save();
    return profile;
  };

  // Add education to profile
  public addEducation = async (userId: string, education: AddEducation) => {
    const newEducation = {
      ...education,
    };

    const profile = await ProfileSchema.findOne({ user: userId }).exec();
    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.education.unshift(newEducation as IEducation);
    await profile.save();
    return profile;
  };

  // Delete a profile education
  public deleteProfileEducation = async (
    userId: string,
    educationId: string
  ) => {
    const profile = await ProfileSchema.findOne({ user: userId }).exec();

    if (!profile) {
      throw new HttpException(400, "There is not profile for this user");
    }
    profile.education = profile.education.filter(
      (edu) => edu._id.toString() !== educationId
    );
    await profile.save();
    return profile;
  };

  // Follow profile
  public follow = async (followingUserId: string, followedUserId: string) => {
    const followingUserProfile = await ProfileSchema.findOne({
      user: followingUserId,
    }).exec();

    if (!followingUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check following
    if (
      followingUserProfile.followings &&
      followingUserProfile.followings.some(
        (follow: IFollowing) => follow.user.toString() === followingUserId
      )
    ) {
      throw new HttpException(400, "You has been already followed this user");
    }

    const followedUserProfile = await ProfileSchema.findOne({
      user: followedUserId,
    }).exec();

    if (!followedUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check follower
    if (
      followingUserProfile.followers &&
      followingUserProfile.followers.some(
        (follow: IFollower) => follow.user.toString() === followedUserId
      )
    ) {
      throw new HttpException(400, "You have been followed by this user");
    }

    followingUserProfile.followings.unshift({ user: followedUserId });
    followedUserProfile.followers.unshift({ user: followingUserId });

    if (!followingUserProfile.followings) followingUserProfile.followings = [];
    await followingUserProfile.save();
    if (!followedUserProfile.followers) followedUserProfile.followers = [];
    await followedUserProfile.save();
    return followingUserProfile;
  };

  public unFollow = async (followingUserId: string, followedUserId: string) => {
    const followingUserProfile = await ProfileSchema.findOne({
      user: followingUserId,
    }).exec();

    if (!followingUserProfile) {
      throw new HttpException(400, "There is no profile for this user");
    }

    // Check if followingUserId is following followedUserId
    const isFollowing = followingUserProfile.followings.some(
      (follow: IFollowing) => follow.user.toString() === followedUserId
    );

    if (!isFollowing) {
      throw new HttpException(400, "You are not following this user");
    }

    const followedUserProfile = await ProfileSchema.findOne({
      user: followedUserId,
    }).exec();

    if (!followedUserProfile) {
      throw new HttpException(
        400,
        "There is no profile for the user being followed"
      );
    }

    // Remove followedUserId from the following list of followingUserId
    followingUserProfile.followings = followingUserProfile.followings.filter(
      (follow: IFollowing) => follow.user.toString() !== followedUserId
    );

    // Remove followingUserId from the followers list of followedUserId
    followedUserProfile.followers = followedUserProfile.followers.filter(
      (follow: IFollower) => follow.user.toString() !== followingUserId
    );

    // Save changes to the database
    await followingUserProfile.save();
    await followedUserProfile.save();

    return followingUserProfile;
  };

  // Add friends
  public addFriend = async (fromUserId: string, toUserId: string) => {
    const FromUserProfile = await ProfileSchema.findOne({
      user: fromUserId,
    }).exec();

    if (!FromUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check friend_requests
    if (
      FromUserProfile.friend_requests &&
      FromUserProfile.friend_requests.some(
        (friend: IFriend) => friend.user.toString() === fromUserId
      )
    ) {
      throw new HttpException(400, "You has been already request to this user");
    }

    const toUserProfile = await ProfileSchema.findOne({
      user: toUserId,
    }).exec();

    if (!toUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check friend
    if (
      toUserProfile.friends &&
      toUserProfile.friends.some(
        (friend: IFriend) => friend.user.toString() === toUserId
      )
    ) {
      throw new HttpException(400, "You have been added friend by this user");
    }

    if (!toUserProfile.friend_requests) toUserProfile.friend_requests = [];
    toUserProfile.friend_requests.unshift({ user: fromUserId } as IFriend);

    await toUserProfile.save();

    return toUserProfile;
  };

  //  Unfriends
  public unFriend = async (fromUserId: string, toUserId: string) => {
    const FromUserProfile = await ProfileSchema.findOne({
      user: fromUserId,
    }).exec();

    if (!FromUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check friend_requests
    if (
      FromUserProfile.friend_requests &&
      FromUserProfile.friend_requests.some(
        (friend: IFriend) => friend.user.toString() === fromUserId
      )
    ) {
      throw new HttpException(400, "You has been already request to this user");
    }

    const toUserProfile = await ProfileSchema.findOne({
      user: toUserId,
    }).exec();

    if (!toUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check friend
    if (
      toUserProfile.friends &&
      toUserProfile.friends.some(
        (friend: IFriend) => friend.user.toString() === toUserId
      )
    ) {
      throw new HttpException(400, "You have been added friend by this user");
    }

    if (!FromUserProfile.friend_requests) FromUserProfile.friend_requests = [];
    FromUserProfile.friend_requests.filter(
      ({ user }) => user.toString() !== toUserId
    );

    if (!toUserProfile.friends) toUserProfile.friends = [];
    toUserProfile.friends.filter(({ user }) => user.toString() !== fromUserId);

    await toUserProfile.save();
    await FromUserProfile.save();
    return FromUserProfile;
  };

  // Add friends
  public acceptFriendRequest = async (currentUserId: string, requestUserId: string) => {
    const currentUserProfile = await ProfileSchema.findOne({
      user: currentUserId,
    }).exec();

    if (!currentUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check friend_requests
    if (
      currentUserProfile.friends &&
      currentUserProfile.friends.some(
        (friend: IFriend) => friend.user.toString() !== requestUserId
      )
    ) {
      throw new HttpException(400, "You has not any friend request related to this user");
    }

    const requestUserProfile = await ProfileSchema.findOne({
      user: requestUserId,
    }).exec();

    if (!requestUserProfile) {
      throw new HttpException(400, "There is not profile for this user");
    }

    //Check friend
    if (
      requestUserProfile.friends &&
      requestUserProfile.friends.some(
        (friend: IFriend) => friend.user.toString() === currentUserId
      )
    ) {
      throw new HttpException(400, "You has already be friends with this user");
    }

    if (!currentUserProfile.friend_requests) currentUserProfile.friend_requests = [];
    currentUserProfile.friend_requests = currentUserProfile.friend_requests.filter(
      ({ user }) => user.toString() !== requestUserId
    );
    if (!currentUserProfile.friends) currentUserProfile.friends = [];
    currentUserProfile.friends.unshift({user: requestUserId} as IFriend);

    if (!requestUserProfile.friends) requestUserProfile.friends = [];
    requestUserProfile.friends.unshift({ user: currentUserId } as IFriend);

    await currentUserProfile.save();
    await requestUserProfile.save();

    return currentUserProfile;
  };
}

export default ProfileService;
