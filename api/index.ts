import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const POPUP_FILE_PATH = path.join(process.cwd(), "popup_config.json");

// Helper to get popup configuration
function getPopupConfig() {
  try {
    if (fs.existsSync(POPUP_FILE_PATH)) {
      const data = fs.readFileSync(POPUP_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading popup config", e);
  }
  // Default values
  return {
    text: "Welcome to Telegram Blaster! This is a dynamic text announcement. You can close this message once the timer finishes.",
    duration: 19,
    enabled: true,
  };
}

// Helper to save popup configuration
function savePopupConfig(config: any) {
  try {
    fs.writeFileSync(POPUP_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error saving popup config", e);
    return false;
  }
}

// API Route to fetch active popup configuration
app.get("/api/telegram/popup", (req, res) => {
  const config = getPopupConfig();
  res.json(config);
});

// API Route to save popup configuration (discreetly named)
app.post("/api/telegram/popup", (req, res) => {
  const { text, duration, enabled } = req.body;
  if (text === undefined || duration === undefined || enabled === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newConfig = {
    text: String(text),
    duration: Number(duration),
    enabled: Boolean(enabled),
  };

  const success = savePopupConfig(newConfig);
  if (success) {
    res.json({ success: true, config: newConfig });
  } else {
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

// API Route to validate a bot token and get bot details
app.post("/api/telegram/validate-bot", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();

    if (data.ok) {
      return res.json({
        valid: true,
        bot: {
          id: data.result.id,
          first_name: data.result.first_name,
          username: data.result.username,
        },
      });
    } else {
      return res.status(400).json({
        valid: false,
        error: data.description || "Invalid bot token",
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      valid: false,
      error: err.message || "Failed to communicate with Telegram API",
    });
  }
});

// Helper function to extract chat destination from link/username/id
function resolveChatId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If it's a numeric ID (potentially with negative sign)
  if (/^-?\d+$/.test(trimmed)) {
    return trimmed;
  }

  // If it's a direct username starting with @
  if (trimmed.startsWith("@")) {
    return trimmed;
  }

  // If it's a Telegram link like https://t.me/c/123456789/456
  // Private channel links format: t.me/c/123456789/12
  const privateLinkMatch = trimmed.match(/t\.me\/c\/(\d+)/);
  if (privateLinkMatch) {
    const id = privateLinkMatch[1];
    // Telegram private supergroup/channel IDs start with -100
    return `-100${id}`;
  }

  // If it's a Telegram link like https://t.me/username
  const publicLinkMatch = trimmed.match(/t\.me\/([a-zA-Z0-9_]{5,})/);
  if (publicLinkMatch) {
    return `@${publicLinkMatch[1]}`;
  }

  // Default: if it doesn't start with @ and is letters/numbers, treat as username by prefixing @
  if (/^[a-zA-Z0-9_]{5,}$/.test(trimmed)) {
    return `@${trimmed}`;
  }

  return trimmed;
}

// API Route to send a message to multiple groups
app.post("/api/telegram/send", async (req, res) => {
  const { token, chats, message } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Bot token is required" });
  }
  if (!chats || !Array.isArray(chats) || chats.length === 0) {
    return res.status(400).json({ error: "At least one chat/group is required" });
  }
  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }

  const sendPromises = chats.map(async (chatInput: string) => {
    const resolvedChat = resolveChatId(chatInput);

    if (!resolvedChat) {
      return {
        originalInput: chatInput,
        resolvedChat: "",
        success: false,
        error: "Invalid or empty chat identifier",
      };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: resolvedChat,
          text: message,
          parse_mode: "HTML", // Support HTML styling (bold, italic, etc.)
          disable_web_page_preview: false,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        return {
          originalInput: chatInput,
          resolvedChat,
          success: true,
          messageId: data.result.message_id,
          chatTitle: data.result.chat?.title || data.result.chat?.first_name || resolvedChat,
        };
      } else {
        return {
          originalInput: chatInput,
          resolvedChat,
          success: false,
          error: data.description || "Telegram API returned an error",
          errorCode: data.error_code,
        };
      }
    } catch (err: any) {
      return {
        originalInput: chatInput,
        resolvedChat,
        success: false,
        error: err.message || "Failed to make request to Telegram API",
      };
    }
  });

  try {
    const resolvedResults = await Promise.all(sendPromises);
    return res.json({
      success: true,
      results: resolvedResults,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred during delivery",
    });
  }
});

// For local/development usage, we will export `app`
export default app;
