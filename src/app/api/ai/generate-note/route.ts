/**
 * AI Note Generation API Route
 *
 * Endpoint for generating or improving note content using AI.
 * This is a non-streaming endpoint that returns the full generated text.
 */

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generateText, OllamaError } from "~/server/ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute max

const requestSchema = z.object({
  noteId: z.string(),
  prompt: z.string().min(1).max(5000),
  type: z.enum(["GENERATE", "IMPROVE", "SUMMARIZE", "EXPAND"]),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { noteId, prompt, type, model, temperature } = validation.data;

    // Verify user has access to the note
    const note = await db.note.findFirst({
      where: {
        id: noteId,
      },
      include: {
        course: {
          include: {
            creator: {
              select: {
                id: true,
              },
            },
            collaborators: {
              where: {
                userId: session.user.id,
                status: "ACCEPTED",
              },
            },
          },
        },
      },
    });

    if (!note) {
      return new Response("Note not found", { status: 404 });
    }

    // Check if user has access (creator or contributor)
    const isCreator = note.course.createdBy === session.user.id;
    const isContributor = note.course.collaborators.some(
      (c) => c.userId === session.user.id && c.role === "CONTRIBUTOR",
    );

    if (!isCreator && !isContributor) {
      return new Response(
        "Forbidden: You don't have permission to edit this note",
        {
          status: 403,
        },
      );
    }

    // Build system prompt based on type
    let systemPrompt =
      "You are a helpful teaching assistant that helps students with their course notes. Format your response using markdown with proper headings, bullet points, and structure.";
    let fullPrompt = prompt;

    if (type === "IMPROVE" || type === "SUMMARIZE" || type === "EXPAND") {
      const currentContent = JSON.stringify(note.content);
      systemPrompt += ` The student has existing notes. Current content: ${currentContent}`;
    }

    if (type === "IMPROVE") {
      fullPrompt = `Improve the following notes: ${prompt}. Make them clearer, more organized, and easier to understand. Use markdown formatting.`;
    } else if (type === "SUMMARIZE") {
      fullPrompt = `Summarize the following notes concisely using markdown formatting: ${prompt}`;
    } else if (type === "EXPAND") {
      fullPrompt = `Expand on the following topic with more details and examples. Use markdown formatting with headings and bullet points: ${prompt}`;
    } else {
      // GENERATE
      fullPrompt = `Generate comprehensive notes about: ${prompt}. Use markdown formatting with headings, bullet points, and clear structure.`;
    }

    // Generate content
    const result = await generateText({
      prompt: fullPrompt,
      systemPrompt,
      model,
      temperature,
    });

    // Save the generated content to database
    const aiGeneratedNote = await db.aiGeneratedNote.create({
      data: {
        noteId,
        userId: session.user.id,
        prompt,
        tokensUsed: result.tokensUsed,
        contentBefore: note.content as never,
        contentAfter: { markdown: result.text },
        type,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        generatedText: result.text,
        tokensUsed: result.tokensUsed,
        generationId: aiGeneratedNote.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("AI Note Generation Error:", error);

    if (error instanceof OllamaError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Failed to generate note content",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
