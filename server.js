const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in the environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/interview", async (req, res) => {
  const { jobTitle, userResponse, conversationHistory: clientHistory } = req.body;

  if (!jobTitle || !userResponse) {
    return res.status(400).json({ error: "Job title and user response are required." });
  }

  const conversationHistory = clientHistory || [];
  conversationHistory.push({ role: "user", parts: [{ text: userResponse }] });

  const aiResponses = conversationHistory.filter((msg) => msg.role === "model").length;

  let prompt;
  if (aiResponses === 0) {
    prompt = `
      You are a professional interviewer for the role "${jobTitle}".
      Start the interview by asking: "Tell me about yourself." Provide only this one question without additional commentary.
    `;
  } else if (aiResponses < 6) {
    prompt = `
      You are a professional interviewer for the role "${jobTitle}".
      The conversation history so far is as follows:
      ${conversationHistory.map((msg) => `${msg.role}: ${msg.parts[0].text}`).join("\n")}
      Based on the user's responses so far, ask the next interview question. Provide only this one question without additional commentary.
    `;
  } else {
    prompt = `
      You are a professional interviewer. The user has completed their interview for the role "${jobTitle}".
      The conversation history is as follows:
      ${conversationHistory.map((msg) => `${msg.role}: ${msg.parts[0].text}`).join("\n")}
      Provide concise feedback on the candidate's performance and suggest areas for improvement. Avoid any additional commentary.
    `;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const aiResponse = result.response.text();
    conversationHistory.push({ role: "model", parts: [{ text: aiResponse }] });

    res.json({ aiResponse, conversationHistory });
  } catch (error) {
    console.error("Error during AI generation:", error.message);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
