import { request } from "./api";

// Fetch user's own support messages
export async function fetchSupportMessages(token) {
  try {
    return await request("/support");
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const messages = JSON.parse(localStorage.getItem("mock_support_messages") || "[]");
      const userId = token.replace("mock_token_", "");
      return messages.filter(m => m.userId === userId);
    }
    throw error;
  }
}

// Send a support message (user side)
export async function sendSupportMessage(text, token) {
  try {
    return await request("/support", {
      method: "POST",
      body: { text },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const messages = JSON.parse(localStorage.getItem("mock_support_messages") || "[]");
      const userId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const user = mockUsers.find(u => u._id === userId) || { name: "Guest User" };

      const newMessage = {
        _id: `msg_${Date.now()}`,
        userId,
        senderId: userId,
        senderName: user.name,
        text,
        createdAt: new Date().toISOString(),
      };

      messages.push(newMessage);
      localStorage.setItem("mock_support_messages", JSON.stringify(messages));
      return newMessage;
    }
    throw error;
  }
}

// Fetch all support threads (admin side)
export async function fetchAdminThreads(token) {
  try {
    return await request("/support/admin/threads");
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const messages = JSON.parse(localStorage.getItem("mock_support_messages") || "[]");
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      
      const threadUserIds = [...new Set(messages.map(m => m.userId))];
      
      const threads = threadUserIds.map(userId => {
        const user = mockUsers.find(u => u._id === userId) || { name: "Deleted User", email: "N/A" };
        const userMessages = messages.filter(m => m.userId === userId);
        const latestMessage = userMessages[userMessages.length - 1] || { text: "", createdAt: new Date().toISOString() };
        
        return {
          userId,
          user,
          latestMessage,
        };
      });

      threads.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));
      return threads;
    }
    throw error;
  }
}

// Fetch a single support thread's messages (admin side)
export async function fetchAdminThreadMessages(userId, token) {
  try {
    return await request(`/support/admin/threads/${userId}`);
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const messages = JSON.parse(localStorage.getItem("mock_support_messages") || "[]");
      return messages.filter(m => m.userId === userId);
    }
    throw error;
  }
}

// Send support reply (admin side)
export async function sendAdminReply(userId, text, token) {
  try {
    return await request(`/support/admin/reply/${userId}`, {
      method: "POST",
      body: { text },
    });
  } catch (error) {
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      const messages = JSON.parse(localStorage.getItem("mock_support_messages") || "[]");
      const adminId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const adminUser = mockUsers.find(u => u._id === adminId) || { name: "System Admin" };

      const newMessage = {
        _id: `msg_${Date.now()}`,
        userId,
        senderId: adminId,
        senderName: `Support Admin (${adminUser.name})`,
        text,
        createdAt: new Date().toISOString(),
      };

      messages.push(newMessage);
      localStorage.setItem("mock_support_messages", JSON.stringify(messages));
      return newMessage;
    }
    throw error;
  }
}
