import mongoose, { Document, Model } from "mongoose";
export interface ISupportMessage {
    userId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderName: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ISupportMessageDocument extends ISupportMessage, Document {
}
export interface ISupportMessageModel extends Model<ISupportMessageDocument> {
}
declare const SupportMessage: ISupportMessageModel;
export default SupportMessage;
//# sourceMappingURL=SupportMessage.d.ts.map