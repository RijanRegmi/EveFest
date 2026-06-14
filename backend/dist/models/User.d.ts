import { Document, Model } from "mongoose";
export interface IUser {
    name: string;
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface IUserModel extends Model<IUserDocument> {
}
declare const User: IUserModel;
export default User;
//# sourceMappingURL=User.d.ts.map