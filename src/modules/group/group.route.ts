import { Route } from "@core/interfaces";
import { Router } from "express";
import GroupController from "./group.controller";
import { authMiddleware } from "@core/middlewares";
import validationMiddleware from "@core/middlewares/validation.middleware";
import CreateGroupDto from "./dtos/createGroup.dto";
import setManagerDto from "./dtos/setManager.dto";

class GroupRoute implements Route {
  public path = "/api/v1/groups";
  public router = Router();
  public groupController = new GroupController();

  constructor() {
    this.initializeRoute();
  }

  private initializeRoute() {
    //POST create new group
    this.router.post(
      this.path,
      authMiddleware,
      validationMiddleware(CreateGroupDto, true),
      this.groupController.createGroup
    );

    //GET get all groups
    this.router.get(this.path, this.groupController.getAllGroups);

    //PUT update group
    this.router.put(
      this.path + "/:id",
      authMiddleware,
      validationMiddleware(CreateGroupDto, true),
      this.groupController.updateGroup
    );

    //DELETE delete group
    this.router.delete(
      this.path + "/:id",
      authMiddleware,
      this.groupController.deleteGroup
    );

    //POST request join group
    this.router.post(
      this.path + "/members/join/:id",
      authMiddleware,
      this.groupController.requestJoinGroup
    );

    //PUT accept request join group
    this.router.put(
      this.path + "/members/:id/:user_id",
      authMiddleware,
      this.groupController.acceptJoinRequest
    );

    //POST set manager
    this.router.post(
      this.path + "/managers/:id",
      authMiddleware,
      validationMiddleware(setManagerDto, true),
      this.groupController.setManager
    );

    //DELETE remove manager
    this.router.delete(
      this.path + "/managers/:id/:user_id",
      authMiddleware,
      this.groupController.removeManager
    );

    //GET get all members
    this.router.get(
      this.path + "/members/:id/",
      this.groupController.getAllGroupMembers
    );

    //DELETE remove member
    this.router.delete(
      this.path + "/members/:id/:user_id",
      authMiddleware,
      this.groupController.removeMember
    );
  }
}

export default GroupRoute;
