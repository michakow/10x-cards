import type { APIContext } from "astro";
import { GenerationService } from "../../lib/services/generationService";
import { createGenerationSchema } from "../../lib/schemas";
import type { ApiErrorDTO, CreateGenerationResponseDTO } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  try {
    const {
      locals: { supabase },
    } = context;

    const body = await context.request.json();
    const result = createGenerationSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "validation_error",
            message: result.error.errors[0].message,
          },
        } satisfies ApiErrorDTO),
        { status: 400 }
      );
    }

    const generationService = new GenerationService(supabase);
    const response = await generationService.createGeneration(DEFAULT_USER_ID, result.data);

    return new Response(JSON.stringify(response satisfies CreateGenerationResponseDTO), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // For now just ignore the error in production
    // TODO: Implement proper error logging
    if (process.env.NODE_ENV === "development") {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // eslint-disable-next-line no-console
      console.warn("[DEV] Generation failed:", errorMessage);
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "internal_error",
          message: "Failed to process generation",
        },
      } satisfies ApiErrorDTO),
      { status: 500 }
    );
  }
}
