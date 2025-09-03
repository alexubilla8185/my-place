import { GoogleGenAI, Type } from "@google/genai";

// Helper function to get the AI client instance on-demand
const getAiClient = () => {
  const API_KEY = process.env.API_KEY;
  if (!API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const summarizeText = async (text: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "AI features are disabled. Please configure your API key.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text in a few key points:\n\n---\n${text}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Could not generate summary. Please check the console for errors.";
  }
};

export const scheduleTaskWithAI = async (prompt: string): Promise<{ task: string; dueDate: string } | null> => {
    const ai = getAiClient();
    if (!ai) {
        alert("AI features are disabled. Please configure your API key.");
        return null;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following text and extract a concise task description and a due date. The due date must be in YYYY-MM-DDTHH:mm format. If no specific time is mentioned, default to 12:00. If no date is mentioned, use today's date. Text: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        task: {
                            type: Type.STRING,
                            description: "The description of the task.",
                        },
                        dueDate: {
                            type: Type.STRING,
                            description: "The due date in YYYY-MM-DDTHH:mm format.",
                        },
                    },
                    required: ["task", "dueDate"],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result;

    } catch (error) {
        console.error("Error scheduling with AI:", error);
        return null;
    }
};

export const transcribeAudio = async (audioUrl: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "AI features are disabled.";
  }
  
  // Note: Gemini API does not directly support audio file transcription via this SDK yet.
  // This is a placeholder for a future implementation.
  console.log("Attempting to transcribe:", audioUrl);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Audio transcription feature is not yet available with this model. This is a placeholder transcript showing a user's voice note about planning a new project and outlining the first few steps.");
    }, 1500);
  });
};
