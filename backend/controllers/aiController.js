import OpenAI from "openai";

const MODEL = "llama-3.3-70b-versatile";

// ✅ FIXED: create client inside a function so it reads
// process.env AFTER dotenv.config() has already run in server.js
const getClient = () => {
  return new OpenAI({
    apiKey:  process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
};

// ─── GENERATE POST FROM TOPIC ─────────────────────────────
export const generatePost = async (req, res) => {
  const { topic } = req.body;

  if (!topic) return res.status(400).json({ error: "Topic is required." });

  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role:    "user",
          content: `Write a short professional post about ${topic}`,
        },
      ],
    });

    res.json({ content: response.choices[0].message.content });
  } catch (err) {
    console.error("AI generate error:", err.message);
    res.status(500).json({ error: "AI request failed." });
  }
};

// ─── IMPROVE EXISTING POST ────────────────────────────────
export const improvePost = async (req, res) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: "Content is required." });

  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role:    "user",
          content: `Improve this post in clear, professional language:\n\n${content}`,
        },
      ],
    });

    res.json({ content: response.choices[0].message.content });
  } catch (err) {
    console.error("AI improve error:", err.message);
    res.status(500).json({ error: "AI request failed." });
  }
};