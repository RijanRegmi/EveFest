import mongoose from "mongoose";
import { IUserDocument } from "../models/User.js";
interface AuthResult {
    token: string;
    user: {
        _id: mongoose.Types.ObjectId;
        name: string;
        username: string;
        email: string;
        phoneNumber: string;
        role: string;
    };
}
interface ProfileUpdateData {
    name?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
}
export declare const registerUser: (name: string, username: string, email: string, phoneNumber: string, password: string) => Promise<AuthResult>;
export declare const loginUser: (email: string, password: string) => Promise<AuthResult>;
export declare const getUserProfile: (userId: string) => Promise<IUserDocument>;
export declare const checkAvailability: (field: string, value: string) => Promise<boolean>;
export declare const updateUserProfile: (userId: string, updates: ProfileUpdateData) => Promise<Omit<AuthResult["user"], "_id"> & {
    _id: unknown;
}>;
export {};
//# sourceMappingURL=authService.d.ts.map