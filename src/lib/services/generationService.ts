import { createHash } from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateGenerationCommand, CreateGenerationResponseDTO, GenerationDTO } from "../../types";
import { LLMService } from "../llm/openrouter.service";
import type { Database } from "../../db/database.types";
import { ErrorLoggingService } from "./errorLoggingService";

export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "GenerationError";
  }
}

export class GenerationService {
  private readonly llmService: LLMService;
  private readonly errorLoggingService: ErrorLoggingService;

  constructor(private readonly supabase: SupabaseClient) {
    this.llmService = new LLMService();
    this.errorLoggingService = new ErrorLoggingService(supabase);
  }

  async createGeneration(userId: string, command: CreateGenerationCommand): Promise<CreateGenerationResponseDTO> {
    const sourceTextHash = this.computeHash(command.sourceText);

    try {
      const startTime = Date.now();
      const flashcardsProposal = await this.llmService.generateFlashcards(command.sourceText);
      const generationDuration = Date.now() - startTime;

      const generation = await this.persistGeneration(userId, {
        sourceTextHash,
        sourceTextLength: command.sourceText.length,
        generationDuration,
      });

      return { generation, flashcardsProposal };
    } catch (error) {
      await this.errorLoggingService.logGenerationError({
        userId,
        sourceTextHash,
        sourceTextLength: command.sourceText.length,
        errorMessage:
          error instanceof Error ? `${error.name}: ${error.message}` : "Unknown error occurred during generation",
      });

      if (error instanceof Error) {
        throw new GenerationError("Failed to create generation", "generation_failed", error);
      }
      throw error;
    }
  }

  private computeHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  private async persistGeneration(
    userId: string,
    meta: {
      sourceTextHash: string;
      sourceTextLength: number;
      generationDuration: number;
    }
  ): Promise<GenerationDTO> {
    type DbGeneration = Database["public"]["Tables"]["generations"];
    type GenerationInsert = DbGeneration["Insert"];

    const { data, error } = await this.supabase
      .from("generations")
      .insert({
        id: crypto.randomUUID(),
        source_text_hash: meta.sourceTextHash,
        source_text_length: meta.sourceTextLength,
        generation_duration: meta.generationDuration,
        user_id: userId,
      } satisfies Omit<GenerationInsert, "created_at">)
      .select()
      .single();

    if (error) {
      console.log(error);
      throw new GenerationError("Failed to persist generation", "database_error", error);
    }

    if (!data) {
      throw new GenerationError("No data returned after insert", "database_error");
    }

    return {
      id: data.id,
      createdAt: data.created_at,
      generationDuration: data.generation_duration,
      sourceTextHash: data.source_text_hash,
      sourceTextLength: data.source_text_length,
    };
  }
}
