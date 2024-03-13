import IUser from "@modules/users/user.interface";
import CreateGroupDto from "./dtos/createGroup.dto";
import setManagerDto from "./dtos/setManager.dto";
import { IGroup } from "./group.interface";
import GroupService from "./group.service";
import { NextFunction, Request, Response } from "express";

export default class GroupController {
  private groupService = new GroupService();

  // Create a new group
  public createGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.id;
      const groupData: CreateGroupDto = req.body;

      const group: IGroup = await this.groupService.createGroup(
        userId,
        groupData
      );
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  };

  //Get all groups
  public getAllGroups = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groups: IGroup[] = await this.groupService.getAllGroups();
      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  };

  //Update group
  public updateGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const groupDto: CreateGroupDto = req.body;
      const group: IGroup = await this.groupService.updateGroup(
        groupId,
        groupDto
      );
      res.status(202).json(group);
    } catch (error) {
      next(error);
    }
  };

  //Get all groups
  public deleteGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      await this.groupService.deleteGroup(groupId);
      res.status(200).json("Delete successfully!");
    } catch (error) {
      next(error);
    }
  };

  //Request join group
  public requestJoinGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const userId = req.user.id;
      const group: IGroup = await this.groupService.requestJoinGroup(
        userId,
        groupId
      );
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };

  //Request join group
  public acceptJoinRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const userId = req.params.user_id;
      const group: IGroup = await this.groupService.acceptJoinRequest(
        userId,
        groupId
      );
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };

  //set manager of group
  public setManager = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const model: setManagerDto = req.body;
      const group: IGroup = await this.groupService.setManager(model, groupId);
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };

  //remove manager of group
  public removeManager = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const userId = req.params.user_id;
      const group: IGroup = await this.groupService.removeManager(
        userId,
        groupId
      );
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };

  //get all members
  public getAllGroupMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const group = await this.groupService.getAllGroupMembers(groupId);
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };

  //get all members
  public removeMember = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = req.params.id;
      const userId = req.params.user_id;
      const group = await this.groupService.removeMember(groupId, userId);
      res.status(200).json(group);
    } catch (error) {
      next(error);
    }
  };
}
