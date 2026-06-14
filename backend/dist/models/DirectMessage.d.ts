import mongoose, { Document, Model } from "mongoose";
export interface IDirectMessage {
    eventId: mongoose.Types.ObjectId;
    attendeeId: mongoose.Types.ObjectId;
    attendeeName: string;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    text: string;
    seen: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IDirectMessageDocument extends IDirectMessage, Document {
}
export interface IDirectMessageModel extends Model<IDirectMessageDocument> {
}
declare const DirectMessage: IDirectMessageModel;
export default DirectMessage;
//# sourceMappingURL=DirectMessage.d.ts.map