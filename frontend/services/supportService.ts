import { request } from "./api";
import type { ISupportMessage } from "@/types";

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError"))
  );
}

interface SupportThread {
  userId: string;
  user: { name: string; email: string; _id?: string };
  latestMessage: { text: string; createdAt: string };
}

// Fetch user's own support messages
export async function fetchSupportMessages(
  token: string
): Promise<ISupportMessage[]> {
  try {
    return await request<ISupportMessage[]>("/support");
  } catch (error) {
    if (isNetworkError(error)) {
      const messages = JSON.parse(
        localStorage.getItem("mock_support_messages") || "[]"
      ) as ISupportMessage[];
      const userId = token.replace("mock_token_", "");
      return messages.filter((m) => m.userId === userId);
    }
    throw error;
  }
}

// Send a support message (user side)
export async function sendSupportMessage(
  text: string,
  token: string
): Promise<ISupportMessage> {
  try {
    return await request<ISupportMessage>("/support", {
      method: "POST",
      body: { text },
    });
  } catch (error) {
    if (isNetworkError(error)) {
      const messages = JSON.parse(
        localStorage.getItem("mock_support_messages") || "[]"
      ) as ISupportMessage[];
      const userId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(
        localStorage.getItem("mock_users") || "[]"
      ) as Array<{ _id: string; name: string }>;
      const user = mockUsers.find((u) => u._id === userId) || {
        name: "Guest User",
      };

      const newMessage: ISupportMessage = {
        _id: `msg_${Date.now()}`,
        userId,
        senderId: userId,
        senderName: user.name,
        text,
        createdAt: new Date().toISOString(),
      };

      messages.push(newMessage);
      localStorage.setItem(
        "mock_support_messages",
        JSON.stringify(messages)
      );
      return newMessage;
    }
    throw error;
  }
}

// Fetch all support threads (admin side)
export async function fetchAdminThreads(
  _token: string
): Promise<SupportThread[]> {
  try {
    return await request<SupportThread[]>("/support/admin/threads");
  } catch (error) {
    if (isNetworkError(error)) {
      const messages = JSON.parse(
        localStorage.getItem("mock_support_messages") || "[]"
      ) as ISupportMessage[];
      const mockUsers = JSON.parse(
        localStorage.getItem("mock_users") || "[]"
      ) as Array<{ _id: string; name: string; email: string }>;

      const threadUserIds = [...new Set(messages.map((m) => m.userId))];

      const threads: SupportThread[] = threadUserIds.map((userId) => {
        const user = mockUsers.find((u) => u._id === userId) || {
          name: "Deleted User",
          email: "N/A",
        };
        const userMessages = messages.filter((m) => m.userId === userId);
        const latestMessage =
          userMessages[userMessages.length - 1] || {
            text: "",
            createdAt: new Date().toISOString(),
          };

        return {
          userId,
          user,
          latestMessage,
        };
      });

      threads.sort(
        (a, b) =>
          new Date(b.latestMessage.createdAt).getTime() -
          new Date(a.latestMessage.createdAt).getTime()
      );
      return threads;
    }
    throw error;
  }
}

// Fetch a single support thread's messages (admin side)
export async function fetchAdminThreadMessages(
  userId: string,
  _token: string
): Promise<ISupportMessage[]> {
  try {
    return await request<ISupportMessage[]>(
      `/support/admin/threads/${userId}`
    );
  } catch (error) {
    if (isNetworkError(error)) {
      const messages = JSON.parse(
        localStorage.getItem("mock_support_messages") || "[]"
      ) as ISupportMessage[];
      return messages.filter((m) => m.userId === userId);
    }
    throw error;
  }
}

// Send support reply (admin side)
export async function sendAdminReply(
  userId: string,
  text: string,
  token: string
): Promise<ISupportMessage> {
  try {
    return await request<ISupportMessage>(
      `/support/admin/reply/${userId}`,
      {
        method: "POST",
        body: { text },
      }
    );
  } catch (error) {
    if (isNetworkError(error)) {
      const messages = JSON.parse(
        localStorage.getItem("mock_support_messages") || "[]"
      ) as ISupportMessage[];
      const adminId = token.replace("mock_token_", "");
      const mockUsers = JSON.parse(
        localStorage.getItem("mock_users") || "[]"
      ) as Array<{ _id: string; name: string }>;
      const adminUser = mockUsers.find((u) => u._id === adminId) || {
        name: "System Admin",
      };

      const newMessage: ISupportMessage = {
        _id: `msg_${Date.now()}`,
        userId,
        senderId: adminId,
        senderName: `Support Admin (${adminUser.name})`,
        text,
        createdAt: new Date().toISOString(),
      };

      messages.push(newMessage);
      localStorage.setItem(
        "mock_support_messages",
        JSON.stringify(messages)
      );
      return newMessage;
    }
    throw error;
  }
}
