
export interface IConversation {
    user1: string;
    user2: string;
    messages: IMessage[];
    date: Date;
    recentDate: Date;
}

export interface IMessage {
    from: string;
    to: string;
    read: boolean;
    text: string;
    showOnFrom: boolean;
    showOnTo: boolean;
    date: Date;
}