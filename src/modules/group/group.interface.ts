
export interface IGroup {
    _id: string;
    creator: string;
    name: string;
    code: string;
    description: string;
    members: IMember[];
    member_requests: IMember[];
    manager: IManager[];
    date: Date;
};

export interface IMember {
    user: string;
    join_date: Date;
}

export interface IManager {
    user: string;
    role: string;
}