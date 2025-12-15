/**
 * AI Study Plan Generator
 *
 * Generates personalized study plans for courses
 */

import { generateText } from "./ollama";
import { z } from "zod";

export const StudyPlanTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  estimatedMinutes: z.number().optional(),
});

export const StudyPlanWeekSchema = z.object({
  weekNumber: z.number(),
  title: z.string(),
  description: z.string().optional(),
  goals: z.array(z.string()),
  tasks: z.array(StudyPlanTaskSchema),
});

export const StudyPlanDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  weeks: z.array(StudyPlanWeekSchema),
});

export type StudyPlanTask = z.infer<typeof StudyPlanTaskSchema>;
export type StudyPlanWeek = z.infer<typeof StudyPlanWeekSchema>;
export type GeneratedStudyPlan = z.infer<typeof StudyPlanDataSchema>;

/**
 * Generate a study plan for a course
 */
export async function generateStudyPlan(options: {
  courseName: string;
  courseDescription?: string;
  topics?: string[];
  weekCount?: number;
  hoursPerWeek?: number;
  goal?: string;
  deadline?: Date;
}): Promise<{ studyPlan: GeneratedStudyPlan; tokensUsed?: number }> {
  const {
    courseName,
    courseDescription,
    topics = [],
    weekCount = 4,
    hoursPerWeek = 5,
    goal = "master the course material",
    deadline,
  } = options;

  // Build context
  let contextInfo = `Course: ${courseName}\n`;
  if (courseDescription) {
    contextInfo += `Description: ${courseDescription}\n`;
  }
  if (topics.length > 0) {
    contextInfo += `Topics to cover: ${topics.join(", ")}\n`;
  }
  contextInfo += `Study time available: ${hoursPerWeek} hours per week\n`;
  contextInfo += `Duration: ${weekCount} weeks\n`;
  contextInfo += `Goal: ${goal}\n`;
  if (deadline) {
    contextInfo += `Deadline: ${deadline.toLocaleDateString()}\n`;
  }

  const systemPrompt = `You are a study plan generator for university students. Create realistic, achievable study plans.

IMPORTANT: You must respond with ONLY valid JSON, no other text. The JSON must match this exact structure:

{
  "title": "Study Plan Title",
  "description": "Brief description of the plan",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1: Topic Name",
      "description": "What to focus on this week",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "tasks": [
        {
          "title": "Task name",
          "description": "Task details",
          "estimatedMinutes": 60
        }
      ]
    }
  ]
}

Make sure:
- Each week has clear, achievable goals
- Tasks are specific and actionable
- Time estimates are realistic
- The plan builds progressively
- Include review and practice time`;

  const prompt = `Create a ${weekCount}-week study plan for the following course:

${contextInfo}

Requirements:
- Distribute ${hoursPerWeek} hours of study time per week
- Include a mix of: reading, practice, review, and testing
- Make the plan progressive (basics first, then advanced)
- Include specific tasks with time estimates
- Add clear learning goals for each week

Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.`;

  const result = await generateText({
    prompt,
    systemPrompt,
    temperature: 0.7,
  });

  // Parse the AI response
  let studyPlanData: GeneratedStudyPlan;
  try {
    // Clean up the response
    let cleanedText = result.text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(cleanedText);
    studyPlanData = StudyPlanDataSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse study plan JSON:", error);
    console.error("Raw response:", result.text);
    throw new Error(
      "Failed to generate study plan. The AI response was not in the expected format.",
    );
  }

  return {
    studyPlan: studyPlanData,
    tokensUsed: result.tokensUsed,
  };
}
