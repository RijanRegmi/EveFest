import mongoose, { Document, Model } from "mongoose";
export interface IGroupChatMessage {
    eventId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IGroupChatMessageDocument extends IGroupChatMessage, Document {
}
export interface IGroupChatMessageModel extends Model<IGroupChatMessageDocument> {
}
declare const GroupChatMessage: IGroupChatMessageModel;
export default GroupChatMessage;
//# sourceMappingURL=GroupChatMessage.d.ts.map