import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to avoid crashes if API key is not present on start
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Agent Skill: Coping Toolkit — activates structured coping exercises based on mood triggers.
function invokeCopingToolkit(moodLabel: string, rawMoodKey?: string): { active: boolean; exercise?: string } {
  const m = (rawMoodKey || moodLabel || "").toLowerCase();
  
  if (m.includes("anxious") || m.includes("anxiety") || m.includes("panic")) {
    return {
      active: true,
      exercise: `### 5-4-3-2-1 Grounding Practice\nTo help soothe anxiety and return to the present moment, pause and focus on your physical surroundings:\n1. 👁️ **5 things you can see**: A picture on the wall, a leaf outside, or a spot of light on the floor.\n2. 🖐️ **4 things you can touch**: The texture of your sleeves, the cool desk, a pen, or your hands.\n3. 👂 **3 things you can hear**: The gentle hum of a fan, birds outside, or distant traffic.\n4. 👃 **2 things you can smell**: Soap, coffee, fresh air, or your favorite scent.\n5. 👅 **1 thing you can taste**: A sip of cool water, or just notice the air.\n\nNow, slowly trace your breath in, and gently let it float away.`
    };
  } else if (m.includes("stressed") || m.includes("stress") || m.includes("overwhelmed")) {
    return {
      active: true,
      exercise: `### Progressive Tension Release\nLet's release the physiological hold that stress has on your body right now:\n1. 🧘 **Unclench your jaw**: Let your tongue rest gently away from the roof of your mouth.\n2. 🌊 **Drop your shoulders**: Inhale deeply, lift them, and let them drop completely on the exhale.\n3. 🌀 **Open your hands**: Unfurl your fingers and rest them palms-up on your knees or desk.\n4. 💨 **Exhale longer than you inhale**: Try breathing in for a count of 4, and exhaling slowly for 6.\n\nThis simple shift activates your body's relaxation response, letting you rest.`
    };
  } else if (m.includes("sad") || m.includes("sadness") || m.includes("depressed") || m.includes("gloom")) {
    return {
      active: true,
      exercise: `### Heart-Centered Compassion Check-In\nWhen sadness settles in, it deserves gentle space rather than quick fixes:\n1. ❤️ **Hand on Heart**: Place a hand gently over your chest or wrap your arms in a warm embrace.\n2. 🕯️ **Validate the feeling**: Silently say to yourself, *"It is okay to feel sad. Sadness is just care looking for a home."*\n3. 🍃 **A Comforting Promise**: Ask yourself, *"What is the gentlest thing I can do for myself in the next hour?"* (Maybe a hot cup of tea, resting under a soft blanket, or taking a screen break).\n\nYour feelings are fully allowed to be here. Take all the time you need.`
    };
  }
  
  return { active: false };
}

// API Routes
app.post("/api/generate-reflection", async (req: express.Request, res: express.Response) => {
  try {
    const { mood, moodKey, notes, history } = req.body;
    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }

    // Security Guardrail: Crisis detection — overrides normal response with safety resources if distress signals are found.
    const crisisKeywords = [
      "suicide", "self-harm", "self harm", "kill myself", "end my life", 
      "want to die", "better off dead", "cutting myself", "cut myself",
      "hopelessness", "giving up on life", "no point in living", "want to end it",
      "ending my life", "suicidal", "not want to live", "cannot go on", "dont want to live", "don't want to live",
      "end things", "end it all", "giving up", "give up", "wanna die", "hurt myself", "harm myself", "no point anymore", "can't go on", "cant go on"
    ];
    
    const notesLower = (notes || "").toLowerCase();
    const containsCrisisSignal = crisisKeywords.some(keyword => notesLower.includes(keyword));

    if (containsCrisisSignal) {
      return res.json({
        isCrisis: true,
        reflection: "It sounds like you are experiencing an incredibly heavy or difficult moment, and your safety is the most important thing. Please know that you do not have to carry this alone. We strongly encourage you to connect with real support immediately: call or text the Suicide & Crisis Lifeline at 988 (free, confidential, and available 24/7) or contact a trusted friend, family member, or healthcare professional right away. There is hope, and help is always available.",
        copingSkillActivated: false
      });
    }

    // Check if the Coping Toolkit should be triggered
    const coping = invokeCopingToolkit(mood, moodKey);

    const ai = getGeminiClient();

    let historyText = "";
    if (history && Array.isArray(history) && history.length > 0) {
      historyText = "Recent mood logs:\n" + history
        .slice(0, 5)
        .map((h: any) => `- ${new Date(h.date).toLocaleDateString()}: Felt ${h.mood}${h.notes ? ` (${h.notes})` : ""}`)
        .join("\n");
    }

    const prompt = `You are a compassionate, gentle, and warm emotional wellness companion. Your role is to validate the user's feelings and offer a supportive reflection or a practical, calming coping tip.
    
Current Mood: ${mood}
User's Personal Note: ${notes || "No extra note was provided."}

${historyText ? `Recent Mood History context to see patterns (if relevant):\n${historyText}\n` : ""}

Guidelines for your response:
1. Be extremely warm, supportive, and validating.
2. Keep it short (2 to 3 sentences maximum).
3. Do not sound clinical, diagnostic, or preachy. Use friendly, conversational, soothing language.
4. Focus on grounding, deep breaths, gentle self-compassion, or celebrating their calm/happiness.
5. Do not output any markdown formatting other than plain text (no bold asterisks like '**' if possible, just clear, comforting text).
6. Never say you are a therapist or a medical AI. Just be a supportive listener.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reflection = response.text || "I'm here for you. Take a gentle breath and remember you're doing the best you can.";
    
    res.json({ 
      reflection,
      copingSkillActivated: coping.active,
      copingExercise: coping.exercise
    });
  } catch (error: any) {
    console.error("Error generating reflection:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating reflection." });
  }
});

// Vite / static file serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();
