# API Endpoint Implementation Plan: Create Generation

## 1. Przegląd punktu końcowego

Endpoint umożliwia przesłanie tekstu źródłowego do modelu LLM, utworzenie rekordu generacji w bazie danych, wygenerowanie i zwrócenie propozycji fiszek.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: `/api/generations`
- Nagłówek autoryzacji: Bearer token
- Parametry:
  - Wymagane:
    - `sourceText` (string): ciąg 1000–10000 znaków
  - Opcjonalne: brak
- Request Body:
  ```json
  { "sourceText": "string (1000-10000 chars)" }
  ```

## 3. Wykorzystywane typy

- Command Model: `CreateGenerationCommand`
- Response DTO: `CreateGenerationResponseDTO`
- Wewnętrzne DTO: `GenerationDTO`, `FlashcardProposalDTO`
- Error DTO: `ApiErrorDTO`

## 4. Przepływ danych

1. Endpoint odbiera żądanie i uwierzytelnia użytkownika za pomocą supabase
2. Walidacja wejścia przez Zod (sprawdzenie długości `sourceText`).
3. Wywołanie serwisu `generationService.createGeneration(userId, sourceText)`:
   - Obliczenie hash SHA-256 tekstu
   - Pomiar czasu wywołania LLM (Openrouter.ai)
   - Wysłanie zapytania do modelu, analiza odpowiedzi na fiszki
   - Wstawienie rekordu w tabeli `generations`
   - Zwrócenie propozycji fiszek bez zapisu, wg wymagań
4. Zwrócenie 201 z ciałem `CreateGenerationResponseDTO`.

## 5. Względy bezpieczeństwa

- Uwierzytelnianie: tylko użytkownicy zalogowani (401 przy braku/nieprawidłowym tokenie).
- Autoryzacja: użycie `userId` z tokena dla operacji DB.
- Ochrona przed nadmiernym rozmiarem danych: limit długości tekstu.
- Unikanie wstrzyknięć: przygotowane zapytania Supabase.

## 6. Obsługa błędów

- 400 Bad Request: nieprawidłowa struktura lub długość `sourceText` → `BadRequest`.
- 401 Unauthorized: brak lub nieważny token → `Unauthorized`.
- 500 Internal Server Error:
  - Błędy komunikacji z LLM lub bazą → `InternalError`.
  - W każdym przypadku zapisać szczegóły w `generation_error_logs`.

## 7. Rozważania dotyczące wydajności

- Batch insert fiszek w ramach jednej transakcji.
- Ograniczenie wielkości zwracanej odpowiedzi do niezbędnych pól.
- Caching hash tekstu, by unikać ponownej generacji dla tych samych treści (opcjonalne).
- Timeout dla wywołania AI ustawiony na 60 sekund czasu odpowiedzi.

## 8. Etapy wdrożenia

1. Utworzyć katalog `src/lib/services` (jeśli nie istnieje) i plik `generationService.ts`.
2. Zdefiniować w `src/lib/schemas` Zod schema dla `CreateGenerationCommand`.
3. Zaimplementować funkcje w `generationService`:
   - `computeHash(sourceText)`
   - `invokeLLM(sourceText)` Na etapie developmentu skorzystamy z mock zamiast wywołania serwisu AI
   - `persistGeneration(userId, meta)`
4. Utworzyć plik endpointu: `src/pages/api/generations.ts`.
5. W endpoint:
   - Dodanie mechanizmu uwierzytelnienia przez Supabase Auth
   - Implementacja logiki endpointu
   - Walidować żądanie Zod
   - Wywołać serwis i zwrócić odpowiedź lub obsłużyć wyjątek
