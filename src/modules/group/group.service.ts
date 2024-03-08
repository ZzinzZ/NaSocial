import IUser from "@modules/users/user.interface";
import { HttpException } from "@core/exceptions";
import normalize from "normalize-url";
import { UserSchema } from "@modules/users";
import { IGroup, IManager, IMember } from "./group.interface";
import CreateGroupDto from "./dtos/createGroup.dto";
import { GroupSchema } from ".";
import setManagerDto from "./dtos/setManager.dto";

export default class GroupService {
  //Create Group
  public async createGroup(
    userId: string,
    groupDto: CreateGroupDto
  ): Promise<IGroup> {
    const user = await UserSchema.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const existedGroup = await GroupSchema.find({
      code: groupDto.code,
    });

    if (existedGroup && existedGroup.length > 0) {
      throw new HttpException(400, "Group already exists");
    }

    const newGroup = new GroupSchema({
      ...groupDto,
    });

    const group = await newGroup.save();
    return group;
  }

  //Get all groups
  public async getAllGroups(): Promise<IGroup[]> {
    const groups = await GroupSchema.find().exec();
    return groups;
  }

  //Update group
  public async updateGroup(
    groupId: string,
    groupDto: CreateGroupDto
  ): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const groupField = { ...groupDto };

    const existedGroup = await GroupSchema.find({
      $and: [
        { $or: [{ name: groupDto.name }, { code: groupDto.code }] },
        { _id: { $ne: groupId } },
      ],
    }).exec();

    if (existedGroup.length > 0) {
      throw new HttpException(400, "Group already exists");
    }

    const updateGroup = await GroupSchema.findOneAndUpdate(
      { _id: groupId },
      { $set: groupField },
      { new: true }
    );

    if (!updateGroup) {
      throw new HttpException(400, "Update failed!");
    }

    return updateGroup;
  }

  //Delete a group
  public async deleteGroup(groupId: string): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const deleteGroup = await GroupSchema.findByIdAndDelete(groupId).exec();
    if (!deleteGroup) {
      throw new HttpException(400, "Delete failed!");
    }
    return deleteGroup;
  }

  //Request to join a group
  public async requestJoinGroup(
    userId: string,
    groupId: string
  ): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (
      group.member_requests &&
      group.member_requests.some(
        (item: IMember) => item.user.toString() === userId
      )
    ) {
      throw new HttpException(400, "You have requested to join this group");
    }

    if (
      group.members &&
      group.members.some((item: IMember) => item.user.toString() === userId)
    ) {
      throw new HttpException(400, "You are already a member of this group");
    }

    group.member_requests.unshift({ user: userId } as IMember);
    await group.save();
    return group;
  }

  //Accept join request
  public async acceptJoinRequest(
    userId: string,
    groupId: string
  ): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (
      group.member_requests &&
      group.member_requests.some(
        (item: IMember) => item.user.toString() !== userId
      )
    ) {
      throw new HttpException(400, "There are no requests from this user");
    }

    group.member_requests = group.member_requests.filter(
      (item: IMember) => item.user.toString() !== userId
    );
    group.members.unshift({ user: userId } as IMember);
    await group.save();
    return group;
  }

  //Set manager
  public async setManager(
    managerDto: setManagerDto,
    groupId: string
  ): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const user = await UserSchema.findById(managerDto.userId)
      .select("-password")
      .exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (
      group.members &&
      group.members.some(
        (item: IMember) => item.user.toString() !== managerDto.userId
      )
    ) {
      throw new HttpException(400, "This user is not a member of this group");
    }

    if (
      group.manager &&
      group.manager.some(
        (item: IManager) => item.user.toString() === managerDto.userId
      )
    ) {
      throw new HttpException(
        400,
        "You have been set to be manager this group"
      );
    }

    group.manager.unshift({
      user: managerDto.userId,
      role: managerDto.role,
    } as IManager);
    await group.save();
    return group;
  }

  //Remove manager
  public async removeManager(userId: string, groupId: string): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (
      group.manager &&
      group.manager.some((item: IManager) => item.user.toString() !== userId)
    ) {
      throw new HttpException(400, "This user is not an manager of this group");
    }

    group.manager = group.manager.filter(
      (item: IManager) => item.user.toString() !== userId
    );
    await group.save();
    return group;
  }

  //Get all group's members
  public async getAllGroupMembers(groupId: string): Promise<IUser[]> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const userId = await group.members.map((member) => {
      return member.user;
    });

    const members = await UserSchema.find({ _id: userId })
      .select("-password")
      .exec();

    return members;
  }

  //Remove members from group
  public async removeMember(groupId: string, userId: string): Promise<IGroup> {
    const group = await GroupSchema.findById(groupId).exec();
    if (!group) {
      throw new HttpException(404, "Group not found");
    }

    const user = await UserSchema.findById(userId).select("-password").exec();
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if(group.members && group.members.some((item: IMember) => {item.user.toString() !== userId})) {
        throw new HttpException(400, "This user is not a member of this group");
    }

    if (
      group.members.length == 1
    ) {
      throw new HttpException(400, "You are the only member of this group");
    }

    group.members = group.members.filter((item: IMember) => item.user.toString() !== userId );
    await group.save();
    
    return group;
  }
}
