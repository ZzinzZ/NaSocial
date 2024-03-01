import { Route } from "@core/interfaces";
import { Router } from "express";
import ProfileController from "./profile.controller";
import { authMiddleware } from "@core/middlewares";
import validationMiddleware from "@core/middlewares/validation.middleware";
import CreateProfileDto from "./dtos/createProfile.dto";
import AddExperienceDto from "./dtos/addExperience.dto";
import AddEducationDto from "./dtos/addEducation.dto";


class ProfileRoute implements Route {
  public path = "/api/v1/profile";
  public router = Router();
  public profileController = new ProfileController();

  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    // GET all profile route
    this.router.get(`${this.path}`, this.profileController.getAllProfiles);
    // http://localhost:5000/api/v1/profile

    //GET profile by user id
    this.router.get(
      `${this.path}/user/:id`,
      this.profileController.getProfileByID
    );
    // http://localhost:5000/api/v1/profile/user/:id

    //GET current profile
    this.router.get(
      `${this.path}/me`,
      authMiddleware,
      this.profileController.getCurrentProfile
    );
    // http://localhost:5000/api/v1/profile/me

    //POST create profile
    this.router.post(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(CreateProfileDto),
      this.profileController.createProfile
    );
    // http://localhost:5000/api/v1/profile

    //DELETE Profile
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      this.profileController.deleteProfile
    );

    //PUT create profile experience
    this.router.put(
      `${this.path}/experience`,
      authMiddleware,
      validationMiddleware(AddExperienceDto),
      this.profileController.addExperience
    );
    // http://localhost:5000/api/v1/profile/experience

    //PUT remove Profile experience
    this.router.put(
      `${this.path}/experience/:exp_id`,
      authMiddleware,
      this.profileController.deleteProfileExperience
    );
    // http://localhost:5000/api/v1/profile/experience/exp_id

    //PUT create profile education
    this.router.put(
      `${this.path}/education`,
      authMiddleware,
      validationMiddleware(AddEducationDto),
      this.profileController.addEducation
    );
    // http://localhost:5000/api/v1/profile/education

    //PUT remove Profile experience
    this.router.put(
      `${this.path}/experience/:edu_id`,
      authMiddleware,
      this.profileController.deleteProfileEducation
    );
    // http://localhost:5000/api/v1/profile/education/edu_id
  }
}

export default ProfileRoute;