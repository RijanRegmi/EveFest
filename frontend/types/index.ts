// Shared TypeScript interfaces matching the backend models

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserWithBookings extends IUser {
  bookings: IBooking[];
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  limit: number | "unlimited";
  registeredCount: number;
  isOnline: boolean;
  location: string;
  mapLink: string;
  locationDescription: string;
  image: string;
  category: string;
  hostName: string;
  hostId: string;
  proofDoc: string | null;
  rules: string;
  logo: string;
  isTakedown: boolean;
  maxSeatsPerUser: number;
  takedownReason: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBooking {
  _id: string;
  user: string;
  event: IEvent | string;
  paymentStatus: "Paid" | "Free";
  ticketCode: string;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGroupChatMessage {
  _id: string;
  eventId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IDirectMessage {
  _id: string;
  eventId: string;
  attendeeId: string;
  attendeeName: string;
  senderId: string;
  senderName: string;
  text: string;
  seen: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ISupportMessage {
  _id: string;
  userId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResult {
  token: string;
  user: IUserWithBookings;
}

export interface EventStats {
  liveEvents: number;
  ticketsIssued: number;
  societiesOnboard: number;
}
