// Data Transfer Objects (DTOs) and Command Models for API
import type { Tables } from "./db/database.types";

// Database row types
export type GenerationRow = Tables<"generations">;
export type FlashcardRow = Tables<"flashcards">;

// Enumerations for flashcard sources
export type FlashcardSourceFull = "ai-full" | "ai-edited" | "manual";
export type FlashcardSourceEdited = "ai-edited" | "manual";

// Paging information for list responses
export interface Paging {
  page: number;
  limit: number;
  total: number;
}

// Generation DTO (response format, camel-cased fields)
export interface GenerationDTO {
  id: string;
  createdAt: string;
  generationDuration: number;
  sourceTextHash: string;
  sourceTextLength: number;
}

// Flashcard DTO (response format)
export interface FlashcardDTO {
  id: string;
  front: string;
  back: string;
  source: FlashcardSourceFull;
  createdAt: string;
  updatedAt?: string;
}

// Minimal flashcard proposal for generation responses
export interface FlashcardProposalDTO {
  front: string;
  back: string;
  source: "ai-full";
}

// Command Models (request bodies)
export interface CreateGenerationCommand {
  sourceText: string;
}

export interface CreateFlashcardCommand {
  generationId: string | null;
  front: string;
  back: string;
  source: FlashcardSourceFull;
}

export interface UpdateFlashcardCommand {
  front: string;
  back: string;
  source: FlashcardSourceEdited;
}

// Query Models (query parameters)
export interface ListGenerationsQuery {
  page?: number;
  limit?: number;
}

export interface ListFlashcardsQuery {
  source?: FlashcardSourceFull;
  page?: number;
  limit?: number;
}

// API Response Models
export interface CreateGenerationResponseDTO {
  generation: GenerationDTO;
  flashcardsProposal: FlashcardProposalDTO[];
}

export interface ListGenerationsResponseDTO {
  data: GenerationDTO[];
  paging: Paging;
}

export interface GetGenerationResponseDTO {
  generation: GenerationDTO;
  flashcardsProposal: FlashcardProposalDTO[];
}

export interface ListFlashcardsResponseDTO {
  data: FlashcardDTO[];
  paging: Paging;
}

export type GetFlashcardResponseDTO = FlashcardDTO;

export type UpdateFlashcardResponseDTO = FlashcardDTO;

// Error format for API
export interface ApiErrorDTO {
  error: {
    code: string;
    message: string;
  };
}
