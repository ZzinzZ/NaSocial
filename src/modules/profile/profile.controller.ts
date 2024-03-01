import ProfileService from "./profile.service";
import { NextFunction, Request, Response } from "express";
import IUser from "@modules/users/user.interface";
import CreateProfileDto from "./dtos/createProfile.dto";
import { IProfile } from "./profile.interface";
import AddExperienceDto from "./dtos/addExperience.dto";
import AddEducation from "./dtos/addEducation.dto";
import AddEducationDto from "./dtos/addEducation.dto";

class ProfileController {
  private profileService = new ProfileService();

  //Get current profile controller
  public getCurrentProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const resultObject: Partial<IUser> =
        await this.profileService.getCurrentProfile(userId);
      res.status(200).json(resultObject);
    } catch (error) {
      next(error);
    }
  };

  //Get current profile controller by userId
  public getProfileByID = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.id;
      const updateUserData: Partial<IUser> =
        await this.profileService.getCurrentProfile(userId);
      res.status(200).json({ data: updateUserData, message: "Updated" });
    } catch (error) {
      next(error);
    }
  };

  // Get all profiles controller
  public getAllProfiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resultObject: Partial<IUser>[] =
        await this.profileService.getAllProfiles();
      res.status(200).json(resultObject);
    } catch (error) {
      next(error);
    }
  };

  // Create a new profile controller
  public createProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userData: CreateProfileDto = req.body;
    const userId = req.user.id;

    try {
      const createUserData: IProfile = await this.profileService.createProfile(
        userId,
        userData
      );
      res.status(201).json({ data: createUserData });
    } catch (error) {
      next(error);
    }
  };

  //Delete profile
  public deleteProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId: string = req.user.id;
    try {
      await this.profileService.deleteProfile(userId);
      res.status(200);
    } catch (error) {
      next(error);
    }
  };

  // Create a new profile experience
  public addExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data: AddExperienceDto = req.body;
    const userId = req.user.id;

    try {
      const createUserData: IProfile = await this.profileService.addExperience(
        userId,
        data
      );
      res.status(201).json(createUserData);
    } catch (error) {
      next(error);
    }
  };

  //Delete profile experience
  public deleteProfileExperience = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const expId: string = req.params.exp_id;
    try {
      const profile = await this.profileService.deleteProfileExperience(
        req.user.id,
        expId
      );
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };

  // Create a new profile education
  public addEducation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data: AddEducationDto = req.body;
    const userId = req.user.id;

    try {
      const createUserData: IProfile = await this.profileService.addEducation(
        userId,
        data
      );
      res.status(201).json(createUserData);
    } catch (error) {
      next(error);
    }
  };

  //Delete profile experience
  public deleteProfileEducation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const eduId: string = req.params.exp_id;
    try {
      const profile = await this.profileService.deleteProfileEducation(
        req.user.id,
        eduId
      );
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  };
}

export default ProfileController;
