import { request } from "./api";

// LocalStorage Database Fallback for offline demo
const getLocalUsers = () => JSON.parse(localStorage.getItem("mock_users") || "[]");
const saveLocalUsers = (users) => localStorage.setItem("mock_users", JSON.stringify(users));

export async function loginApi(email, password) {
  try {
    return await request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      // Fallback
      const users = getLocalUsers();
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) {
        throw new Error("Invalid email or password (Local Database Mode)");
      }
      
      const { password: _, ...userWithoutPassword } = user;
      
      // Get user bookings
      const localBookings = JSON.parse(localStorage.getItem("mock_bookings") || "[]");
      const userBookings = localBookings.filter((b) => b.user === userWithoutPassword._id);

      return {
        token: `mock_token_${userWithoutPassword._id}`,
        user: { ...userWithoutPassword, bookings: userBookings },
      };
    }
    throw error;
  }
}

export async function registerApi(name, username, email, phoneNumber, password) {
  try {
    return await request("/auth/register", {
      method: "POST",
      body: { name, username, email, phoneNumber, password },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      // Fallback
      const users = getLocalUsers();
      if (users.some((u) => u.email === email)) {
        throw new Error("Email already registered (Local Database Mode)");
      }
      if (users.some((u) => u.username === username.toLowerCase())) {
        throw new Error("Username already taken (Local Database Mode)");
      }

      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        username: username.toLowerCase(),
        email,
        phoneNumber,
        password, // stored directly for mock simplicity
        role: (email.toLowerCase().includes("admin") || name.toLowerCase().includes("admin")) ? "admin" : "user",
      };

      users.push(newUser);
      saveLocalUsers(users);

      const { password: _, ...userWithoutPassword } = newUser;
      return {
        token: `mock_token_${userWithoutPassword._id}`,
        user: { ...userWithoutPassword, bookings: [] },
      };
    }
    throw error;
  }
}

export async function getProfileApi(token) {
  try {
    return await request("/auth/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      if (!token.startsWith("mock_token_")) {
        throw new Error("Invalid mock session token");
      }
      const userId = token.replace("mock_token_", "");
      const users = getLocalUsers();
      const user = users.find((u) => u._id === userId);
      if (!user) {
        throw new Error("User profile not found");
      }

      // Get bookings for this user
      const localBookings = JSON.parse(localStorage.getItem("mock_bookings") || "[]");
      const userBookings = localBookings.filter((b) => b.user === userId);

      const { password: _, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, bookings: userBookings };
    }
    throw error;
  }
}

export async function checkAvailabilityApi(field, value) {
  try {
    return await request("/auth/check-availability", {
      method: "POST",
      body: { field, value },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
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
