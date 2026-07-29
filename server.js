import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const profiles = [
  {
    id: 1,
    name: "Mateo",
    age: 31,
    distance: "4.7 km away",
    badge: "Love & Friends",
    bio: "Architect who builds things and breaks routines. Let's get coffee and get lost in a new neighborhood.",
    tags: ["Architecture", "Coffee", "Travel"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    name: "Isabelle",
    age: 28,
    distance: "2.1 km away",
    badge: "Romance",
    bio: "Sommelier by day, stargazer by night. Looking for someone who appreciates slow evenings and good conversation.",
    tags: ["Wine", "Astronomy", "Hiking"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000"
  }
];

const matches = [
  {
    id: 1,
    name: "Isabelle",
    age: 28,
    badge: "Romance",
    verified: true,
    timeAgo: "2 days ago",
    distance: "2.1 km away",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    isLocked: true
  },
  {
    id: 2,
    name: "Nora",
    age: 26,
    badge: "Friends",
    verified: false,
    timeAgo: "5 hours ago",
    distance: "1.4 km away",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    isLocked: false
  },
  {
    id: 3,
    name: "Remy",
    age: 34,
    badge: "Romance",
    verified: true,
    timeAgo: "Yesterday",
    distance: "6.2 km away",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
    isLocked: true
  }
];

const conversations = [
  {
    id: 1,
    name: "Isabelle",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    lastMessage: "Say hello!",
    isLastMessageUser: false,
    timestamp: "",
    unreadCount: 2
  },
  {
    id: 2,
    name: "Nora",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    lastMessage: "Exactly. Do you have a favorite director whose work you always go back to?",
    isLastMessageUser: true,
    timestamp: "4:40 PM",
    unreadCount: 0
  }
];

const messages = {
  1: [
    { id: 1, fromUser: false, text: "Hey there!", timestamp: "4:20 PM" },
    { id: 2, fromUser: true, text: "Hello! How are you?", timestamp: "4:22 PM" }
  ],
  2: [
    { id: 1, fromUser: true, text: "Have you watched any good movies lately?", timestamp: "4:30 PM" },
    { id: 2, fromUser: false, text: "Yes — I just finished a great thriller.", timestamp: "4:32 PM" }
  ]
};

app.get("/api/profiles", (req, res) => {
  res.json(profiles);
});

app.get("/api/profiles/:id", (req, res) => {
  const profile = profiles.find((item) => item.id === Number(req.params.id));
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  res.json(profile);
});

app.get("/api/matches", (req, res) => {
  res.json(matches);
});

app.get("/api/matches/:id", (req, res) => {
  const match = matches.find((item) => item.id === Number(req.params.id));
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }
  res.json(match);
});

app.get("/api/conversations", (req, res) => {
  res.json(conversations);
});

app.get("/api/conversations/:id", (req, res) => {
  const conversation = conversations.find((item) => item.id === Number(req.params.id));
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json(conversation);
});

app.get("/api/conversations/:id/messages", (req, res) => {
  const conversationId = Number(req.params.id);
  res.json(messages[conversationId] || []);
});

app.post("/api/conversations/:id/messages", (req, res) => {
  const conversationId = Number(req.params.id);
  const { text, fromUser = true } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Message text is required" });
  }

  const nextId = (messages[conversationId]?.length ?? 0) + 1;
  const newMessage = {
    id: nextId,
    fromUser,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  messages[conversationId] = [...(messages[conversationId] || []), newMessage];
  res.status(201).json(newMessage);
});

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", version: "1.0" });
});

app.listen(port, () => {
  console.log(`Love Links backend listening on http://localhost:${port}`);
});
