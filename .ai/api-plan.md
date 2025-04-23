# REST API Plan

## 1. Resources

- **users** (maps to `users` table)
- **flashcards** (maps to `flashcards` table)
- **generations** (maps to `generations` table)
- **generation_error_logs** (maps to `generation_error_logs` table)

## 2. Endpoints

### Flashcard Generations

1. **Create Generation**

   - Method: POST
   - URL: `/api/generations`
   - Auth: Bearer token
   - Description: Submit source text to LLM, create `generations` record, return proposal flashcards
   - Request Body:
     ```json
     { "sourceText": "string (1000-10000 chars)" }
     ```
   - Response (201):
     ```json
     {
       "generation": { "id": "uuid", "createdAt": "timestamp", ... },
       "flashcardsProposal": [ { "id": "uuid", "front": "string", "back": "string" }, ... ]
     }
     ```
   - Errors:
     - 400 Bad Request
       ```json
       {
         "error": { "code": "BadRequest", "message": "Text length must be between 1000 and 10000 characters" }
       }
       ```
     - 401 Unauthorized
       ```json
       { "error": { "code": "Unauthorized", "message": "Authentication required" } }
       ```
     - 500 Internal Server Error
       ```json
       {
         "error": { "code": "InternalError", "message": "Failed to generate flashcards" }
       }
       ```

2. **List Generations**

   - Method: GET
   - URL: `/api/generations`
   - Auth: Bearer token
   - Query: `?page=&limit=`
   - Response (200):
     ```json
     { "data": [ { ... } ], "paging": { ... } }
     ```
   - Error Responses:
     - 400 Bad Request
       ```json
       { "error": { "code": "BadRequest", "message": "Invalid pagination parameters" } }
       ```
     - 401 Unauthorized
       ```json
       { "error": { "code": "Unauthorized", "message": "Authentication required" } }
       ```
     - 500 Internal Server Error
       ```json
       { "error": { "code": "InternalError", "message": "Unable to fetch generations" } }
       ```

3. **Get Generation**
   - Method: GET
   - URL: `/api/generations/:genId`
   - Auth: Bearer token
   - Response (200):
     ```json
     {
       "generation": { "id": "uuid", "sourceTextHash": "abc123...", "created_at": "timestamp" },
       "flashcardsProposal": [{ "id": "uuid", "front": "...", "back": "..." }]
     }
     ```
   - Error Responses:
     - 401 Unauthorized
       ```json
       { "error": { "code": "Unauthorized", "message": "Authentication required" } }
       ```
     - 404 Not Found
       ```json
       { "error": { "code": "NotFound", "message": "Generation not found" } }
       ```

### Flashcards

1. **List Flashcards**

   - Method: GET
   - URL: `/api/flashcards`
   - Auth: Bearer token
   - Query: `?source=ai-full|ai-edited|manual&page=&limit=`
   - Response (200):
     ```json
     {
       "data": [
         {
           "id": "uuid",
           "front": "What is the capital of France?",
           "back": "Paris",
           "source": "ai-full",
           "createdAt": "2025-04-23T12:34:56Z"
         }
       ],
       "paging": { "page": 1, "limit": 10, "total": 100 }
     }
     ```
   - Error Responses:
     - 400 Bad Request
       ```json
       { "error": "Invalid query parameter" }
       ```
     - 401 Unauthorized
       ```json
       { "error": "Unauthorized" }
       ```

2. **Get Flashcard**

   - Method: GET
   - URL: `/api/flashcards/:cardId`
   - Response (200):
     ```json
     {
       "id": "uuid",
       "front": "What is the capital of France?",
       "back": "Paris",
       "source": "manual",
       "createdAt": "2025-04-23T12:34:56Z"
     }
     ```
   - Error Responses:
     - 401 Unauthorized
       ```json
       { "error": "Unauthorized" }
       ```
     - 404 Not Found
       ```json
       { "error": "Flashcard not found" }
       ```

3. **Create Flashcard** (manual or accepted proposal)

   - Method: POST
   - URL: `/api/flashcards`
   - Auth: Bearer token
   - Request Body:
     ```json
     {
       "generationId": "uuid | null",
       "front": "string (<=200)",
       "back": "string (<=500)",
       "source": "ai-full|ai-edited|manual"
     }
     ```
   - Response (201):
     ```json
     { "flashcard": { "id": "uuid", "front": "...", "back": "...", "source": "manual", "createdAt": "timestamp" } }
     ```
   - Error Responses:
     - 400 Bad Request
       ```json
       { "error": { "code": "BadRequest", "message": "Validation failed: front/back/source invalid" } }
       ```
     - 401 Unauthorized
       ```json
       { "error": { "code": "Unauthorized", "message": "Authentication required" } }
       ```

4. **Update Flashcard**

   - Method: PUT
   - URL: `/api/flashcards/:cardId`
   - Auth: Bearer token
   - Request Body:
     ```json
     {
       "front": "string (<=200)",
       "back": "string (<=500)",
       "source": "ai-edited|manual"
     }
     ```
   - Response (200):
     ```json
     {
       "id": "uuid",
       "front": "What is the capital of France?",
       "back": "Paris",
       "source": "manual",
       "updatedAt": "2025-04-23T13:45:00Z"
     }
     ```
   - Error Responses:
     - 400 Bad Request
       ```json
       { "error": "Validation error: front/back length or source invalid" }
       ```
     - 401 Unauthorized
       ```json
       { "error": "Unauthorized" }
       ```
     - 404 Not Found
       ```json
       { "error": "Flashcard not found" }
       ```

5. **Delete Flashcard**
   - Method: DELETE
   - URL: `/api/flashcards/:cardId`
   - Auth: Bearer token
   - Response: 204 No Content
   - Error Responses:
     - 401 Unauthorized
       ```json
       { "error": { "code": "Unauthorized", "message": "Authentication required" } }
       ```
     - 404 Not Found
       ```json
       { "error": { "code": "NotFound", "message": "Flashcard not found" } }
       ```

## 3. Authentication & Authorization

- Token-based authentication using Supabase Auth
- Users authenticate via `/auth/login` or `/auth/register` receiving a bearer token
- Secure all `api/` routes with middleware to verify JWT
- Row-Level Security (RLS) policies in Supabase ensure `user_id = auth.uid()`

## 4. Validation & Business Logic

- Input validation with Zod:
  - `source_text` length 1000–10000
  - `front` ≤ 200 chars, `back` ≤ 500 chars
  - `source` values:
    - For Create Flashcard: [`ai-full`,`ai-edited`,`manual`]
    - For Update Flashcard: [`ai-edited`,`manual`]
- Rate limit `POST /generations` to mitigate abuse
- Early returns on invalid auth, invalid body
- Log errors to `generation_error_logs` on LLM failures
