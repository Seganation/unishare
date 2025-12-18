/**
 * AI Study Plan Generator
 *
 * Generates personalized study plans for courses
 */

import { generateText } from "ai";
import { z } from "zod";
import { models } from "./config";
import { STUDY_PLAN_SYSTEM_PROMPT, buildStudyPlanPrompt } from "./prompts";

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

  // Use optimized prompts from centralized config
  const result = await generateText({
    model: models.pro, // Use pro model for better study plan quality
    system: STUDY_PLAN_SYSTEM_PROMPT,
    prompt: buildStudyPlanPrompt({
      courseName,
      weekCount,
      hoursPerWeek,
      goal,
      courseDescription,
      topics,
      deadline,
    }),
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
    tokensUsed: result.usage?.totalTokens,
  };
}
