import { request } from "./api";
import type { AuthResult, IUserWithBookings } from "@/types";

interface LocalUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "user" | "admin";
}

// LocalStorage Database Fallback for offline demo
const getLocalUsers = (): LocalUser[] =>
  JSON.parse(localStorage.getItem("mock_users") || "[]");
const saveLocalUsers = (users: LocalUser[]): void =>
  localStorage.setItem("mock_users", JSON.stringify(users));

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError"))
  );
}

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    return await request<AuthResult>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const users = getLocalUsers();
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
      if (!user) {
        throw new Error("Invalid email or password (Local Database Mode)");
      }

      const { password: _, ...userWithoutPassword } = user;
      const localBookings = JSON.parse(
        localStorage.getItem("mock_bookings") || "[]"
      ) as Array<{ user: string }>;
      const userBookings = localBookings.filter(
        (b) => b.user === userWithoutPassword._id
      );

      return {
        token: `mock_token_${userWithoutPassword._id}`,
        user: { ...userWithoutPassword, bookings: userBookings } as IUserWithBookings,
      };
    }
    throw error;
  }
}

export async function registerApi(
  name: string,
  username: string,
  email: string,
  phoneNumber: string,
  password: string
): Promise<AuthResult> {
  try {
    return await request<AuthResult>("/auth/register", {
      method: "POST",
      body: { name, username, email, phoneNumber, password },
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const users = getLocalUsers();
      if (users.some((u) => u.email === email)) {
        throw new Error("Email already registered (Local Database Mode)");
      }
      if (users.some((u) => u.username === username.toLowerCase())) {
        throw new Error("Username already taken (Local Database Mode)");
      }

      const newUser: LocalUser = {
        _id: `user_${Date.now()}`,
        name,
        username: username.toLowerCase(),
        email,
        phoneNumber,
        password,
        role:
          email.toLowerCase().includes("admin") ||
          name.toLowerCase().includes("admin")
            ? "admin"
            : "user",
      };

      users.push(newUser);
      saveLocalUsers(users);

      const { password: _, ...userWithoutPassword } = newUser;
      return {
        token: `mock_token_${userWithoutPassword._id}`,
        user: { ...userWithoutPassword, bookings: [] } as IUserWithBookings,
      };
    }
    throw error;
  }
}

export async function getProfileApi(token: string): Promise<IUserWithBookings> {
  try {
    return await request<IUserWithBookings>("/auth/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (isNetworkError(error)) {
      if (!token.startsWith("mock_token_")) {
        throw new Error("Invalid mock session token");
      }
      const userId = token.replace("mock_token_", "");
      const users = getLocalUsers();
      const user = users.find((u) => u._id === userId);
      if (!user) {
        throw new Error("User profile not found");
      }

      const localBookings = JSON.parse(
        localStorage.getItem("mock_bookings") || "[]"
      ) as Array<{ user: string }>;
      const userBookings = localBookings.filter((b) => b.user === userId);

      const { password: _, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, bookings: userBookings } as IUserWithBookings;
    }
    throw error;
  }
}

export async function updateProfileApi(
  userData: Partial<LocalUser>,
  token: string
): Promise<Omit<LocalUser, "password">> {
  try {
    return await request<Omit<LocalUser, "password">>("/auth/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: userData,
    });
  } catch (error) {
    if (isNetworkError(error)) {
      if (!token.startsWith("mock_token_")) {
        throw new Error("Invalid mock session token");
      }
      const userId = token.replace("mock_token_", "");
      const users = getLocalUsers();
      const userIndex = users.findIndex((u) => u._id === userId);
      if (userIndex === -1) {
        throw new Error("User profile not found");
      }

      if (userData.email && userData.email !== users[userIndex].email) {
        if (users.some((u) => u.email === userData.email)) {
          throw new Error("Email already in use");
        }
      }
      if (
        userData.username &&
        userData.username.toLowerCase() !== users[userIndex].username
      ) {
        if (
          users.some((u) => u.username === userData.username!.toLowerCase())
        ) {
          throw new Error("Username already taken");
        }
      }

      users[userIndex] = {
        ...users[userIndex],
        ...userData,
        username: userData.username
          ? userData.username.toLowerCase()
          : users[userIndex].username,
      };
      saveLocalUsers(users);

      const { password: _, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    }
    throw error;
  }
}

export async function checkAvailabilityApi(
  field: string,
  value: string
): Promise<{ available: boolean }> {
  try {
    return await request<{ available: boolean }>("/auth/check-availability", {
      method: "POST",
      body: { field, value },
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const users = getLocalUsers();
      let isAvailable = true;
      if (field === "username") {
        isAvailable = !users.some((u) => u.username === value.toLowerCase());
      } else if (field === "email") {
        isAvailable = !users.some((u) => u.email === value.toLowerCase());
      } else if (field === "phoneNumber") {
        isAvailable = !users.some((u) => u.phoneNumber === value);
      }
      return { available: isAvailable };
    }
    throw error;
  }
}
