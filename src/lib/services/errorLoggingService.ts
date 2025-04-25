import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";

export interface ErrorLogData {
  userId: string;
  sourceTextHash: string;
  sourceTextLength: number;
  errorMessage: string;
}

export class ErrorLoggingService {
  constructor(private readonly supabase: SupabaseClient) {}

  async logGenerationError(data: ErrorLogData): Promise<void> {
    type ErrorLogTable = Database["public"]["Tables"]["generation_error_logs"];
    type ErrorLogInsert = ErrorLogTable["Insert"];

    const { error } = await this.supabase.from("generation_error_logs").insert({
      user_id: data.userId,
      source_text_hash: data.sourceTextHash,
      source_text_length: data.sourceTextLength,
      error_message: data.errorMessage,
      id: crypto.randomUUID(),
    } satisfies Omit<ErrorLogInsert, "created_at">);

    if (error) {
      // Just log to console if error logging fails
      // eslint-disable-next-line no-console
      console.error("Failed to log error to database:", error);
    }
  }
}
