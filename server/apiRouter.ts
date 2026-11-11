import express, { Request, Response } from 'express';
import { getGeminiClient, ASTRA_MASCOT_SYSTEM_PROMPT } from './gemini.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '2mb' }));

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * POST /api/ai/companion-chat
 * Real-time companion conversation, gentle motivation, or schedule advice.
 */
apiRouter.post('/ai/companion-chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, context, companionName = 'Astra' } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is available in Secrets.',
      });
      return;
    }

    let prompt = `User message: "${message}"\n`;
    if (context) {
      prompt += `\nRelevant schedule & academic context:\n`;
      if (context.pendingTasksCount !== undefined) prompt += `- Pending tasks: ${context.pendingTasksCount}\n`;
      if (context.completedToday !== undefined) prompt += `- Completed today: ${context.completedToday}\n`;
      if (context.upcomingDeadline) prompt += `- Next deadline: ${context.upcomingDeadline}\n`;
      if (context.currentSGPA && context.targetSGPA) {
        prompt += `- Academic target: SGPA ${context.targetSGPA} (Current: ${context.currentSGPA})\n`;
      }
    }

    const systemInstruction = ASTRA_MASCOT_SYSTEM_PROMPT.replace('Astra-chan', companionName);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am always cheering for you! Let us keep moving forward one step at a time ✨';
    res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response from companion.',
    });
  }
});

/**
 * POST /api/ai/breakdown-task
 * Breaks down a complex or overwhelming task into manageable steps.
 */
apiRouter.post('/api/ai/breakdown-task', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, estimatedMinutes = 90 } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Deterministic fallback if API key is not set
      res.json({
        steps: [
          { text: `Review requirements and setup for ${title}`, estimatedMinutes: 20 },
          { text: `Execute core phase for ${title}`, estimatedMinutes: Math.max(30, estimatedMinutes - 40) },
          { text: `Verification, clean-up & self-review`, estimatedMinutes: 20 },
        ],
        encouragement: 'Every big goal is just a series of small, beautiful steps! You got this! ✨',
      });
      return;
    }

    const prompt = `Please break down the following university/personal task into 3 to 5 realistic, bite-sized chronological sub-steps for a focused student.
Task Title: "${title}"
Category: "${category || 'General'}"
Total Estimated Time: ${estimatedMinutes} minutes

Return a valid JSON object matching this schema:
{
  "steps": [
    { "text": "Step title or action", "estimatedMinutes": number }
  ],
  "encouragement": "A brief 1-sentence warm encouraging message from companion"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a productivity structuring assistant. Always return valid raw JSON with no Markdown backticks.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        steps: [
          { text: `Phase 1: Initial research & outline`, estimatedMinutes: 25 },
          { text: `Phase 2: Core implementation / study session`, estimatedMinutes: Math.max(30, estimatedMinutes - 45) },
          { text: `Phase 3: Review and wrap up`, estimatedMinutes: 20 },
        ],
        encouragement: 'Take it step by step, my star! ✨',
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Task breakdown error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to breakdown task',
    });
  }
});

/**
 * POST /api/ai/daily-recap
 * Generates an inspiring anime-companion daily recap and cheer.
 */
apiRouter.post('/api/ai/daily-recap', async (req: Request, res: Response): Promise<void> => {
  try {
    const { completedCount, totalCount, focusMinutes, upcomingDeadlines, companionName = 'Astra' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      res.json({
        recap: `You completed ${completedCount} out of ${totalCount} tasks today and spent ${focusMinutes} minutes in deep focus! Outstanding effort! Let us rest well and recharge for tomorrow! 🌸`,
      });
      return;
    }

    const prompt = `Write a 2-3 sentence warm, inspiring daily recap and encouragement for the student.
Stats today:
- Tasks completed: ${completedCount} / ${totalCount}
- Focus minutes logged: ${focusMinutes} minutes
- Upcoming deadlines: ${upcomingDeadlines || 'None immediately pending'}`;

    const systemInstruction = ASTRA_MASCOT_SYSTEM_PROMPT.replace('Astra-chan', companionName);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({ recap: response.text?.trim() });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to generate recap' });
  }
});
