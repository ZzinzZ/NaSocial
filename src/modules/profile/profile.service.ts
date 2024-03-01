import IUser from "@modules/users/user.interface";
import { IEducation, IExperience, IProfile, ISocial } from "./profile.interface";
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
  public addEducation = async (
    userId: string,
    education: AddEducation
  ) => {
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
}

export default ProfileService;
