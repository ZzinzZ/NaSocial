export interface IProfile {
  _id: string;
  user: string;
  company: string;
  website: string;
  location: string;
  status: string;
  skills: string[];
  bio: string;
  experience: IExperience[];
  education: IEducation[];
  followings: IFollowing[];
  followers: IFollower[];
  friends: IFriend[];
  friend_requests: IFriendRequests[];
  social: ISocial;
  date: Date;
}

export interface IExperience {
    _id: string;
    title: string;
    company: string;
    location: string;
    from: Date;
    to: Date;
    current: boolean;
    description: string;
}

export interface IEducation {
    _id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    from: Date;
    to: Date;
    current: boolean;
    description: string;
}

export interface ISocial extends Record<string, string> {
    youtube: string;
    twitter: string;
    facebook: string;
    instagram:string;
    linkedin: string;
}

export interface IFollowing {
    user: string;
}

export interface IFollower {
    user: string;
}

export interface IFriend {
  user: string;
  date: Date;
}

export interface IFriendRequests {
  user: string;
  date: Date;
}