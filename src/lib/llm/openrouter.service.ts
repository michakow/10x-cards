import type { FlashcardProposalDTO } from "../../types";
import type { OpenRouterRequest, OpenRouterResponse } from "./openrouter.types";
import type { OpenRouterErrorResponse } from "./openrouter.types";

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly type: string,
    public readonly code: string | null
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class LLMService {
  private readonly apiKey = import.meta.env.OPENROUTER_API_KEY;
  private readonly apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  private readonly defaultModel = "anthropic/claude-3-opus-20240229";

  async generateFlashcards(sourceText: string): Promise<FlashcardProposalDTO[]> {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(`[DEV] Would generate flashcards for text of length: ${sourceText.length}`);
      return this.getMockFlashcards();
    }

    // TODO: Implement actual OpenRouter.ai integration
    // Prepare request config for future implementation
    // void {
    //   model: this.defaultModel,
    //   messages: [
    //     {
    //       role: "system",
    //       content: "You are an expert in creating effective flashcards from educational content",
    //     },
    //     {
    //       role: "user",
    //       content: sourceText,
    //     },
    //   ],
    // } satisfies OpenRouterRequest;

    return this.getMockFlashcards();
  }

  private async callOpenRouter(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = (await response.json()) as OpenRouterErrorResponse;
      throw new OpenRouterError(error.error.message, error.error.type, error.error.code);
    }

    return response.json() as Promise<OpenRouterResponse>;
  }

  private getMockFlashcards(): FlashcardProposalDTO[] {
    return [
      {
        front: "Mock Question 1",
        back: "Mock Answer 1",
        source: "ai-full",
      },
      {
        front: "Mock Question 2",
        back: "Mock Answer 2",
        source: "ai-full",
      },
    ];
  }
}
