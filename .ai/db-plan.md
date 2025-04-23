# Plan schematu bazy danych

## 1. Tabele

### users

This table is managed by Supabase Auth.

| Kolumna    | Typ          | Ograniczenia           |
| ---------- | ------------ | ---------------------- |
| id         | uuid         | PRIMARY KEY            |
| email      | varchar(255) | NOT NULL UNIQUE        |
| password   | varchar      | NO NULL                |
| created_at | timestamptz  | NOT NULL DEFAULT now() |
| updated_at | timestamptz  | NOT NULL DEFAULT now() |

### flashcards

| Kolumna       | Typ          | Ograniczenia                                                  |
| ------------- | ------------ | ------------------------------------------------------------- |
| id            | uuid         | PRIMARY KEY                                                   |
| user_id       | uuid         | NOT NULL REFERENCES users(id)                                 |
| generation_id | uuid         | NOT NULL REFERENCES generations(id)                           |
| front         | varchar(200) | NOT NULL CHECK (char_length(front) <= 200)                    |
| back          | varchar(500) | NOT NULL CHECK (char_length(back) <= 500)                     |
| source        | varchar(20)  | NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual')) |
| created_at    | timestamptz  | NOT NULL DEFAULT now()                                        |
| updated_at    | timestamptz  | NOT NULL DEFAULT now()                                        |

### generations

| Kolumna             | Typ         | Ograniczenia                                                                              |
| ------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| id                  | uuid        | PRIMARY KEY                                                                               |
| user_id             | uuid        | NOT NULL REFERENCES users(id)                                                             |
| source_text_hash    | varchar(64) | NOT NULL -- przechowuje hash (np. SHA-256) tekstu wejściowego                             |
| source_text_length  | int         | NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000) -- długość oryginalnego tekstu |
| generation_duration | int         | NOT NULL                                                                                  |
| created_at          | timestamptz | NOT NULL DEFAULT now()                                                                    |

### generation_error_logs

| Kolumna            | Typ         | Ograniczenia                                               |
| ------------------ | ----------- | ---------------------------------------------------------- |
| id                 | uuid        | PRIMARY KEY                                                |
| user_id            | uuid        | NOT NULL REFERENCES users(id)                              |
| source_text_hash   | varchar     | NOT NULL                                                   |
| source_text_length | int         | NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000) |
| error_message      | text        | NOT NULL                                                   |
| created_at         | timestamptz | NOT NULL DEFAULT now()                                     |

## 2. Relacje

- users 1 — N flashcards przez flashcards.user_id
- users 1 — N generations przez generations.user_id
- users 1 — N generation_error_logs przez generation_error_logs.user_id

## 3. Indeksy

- Indeks na kolumnie `user_id` w tabeli flashcards.
- Indeks na kolumnie `generation_id` w tabeli flashcards.
- Indeks na kolumnie `user_id` w tabeli generations.
- Indeks na kolumnie `user_id` w tabeli generation_error_logs.

## 4. Polityki bezpieczeństwa na poziomie wiersza (RLS)

Wszystkie tabele mają włączone RLS, aby izolować dane użytkowników, gdzie `user_id` odpowiada identyfikatorowi użytkownika z Supabase Auth (np. auth.uuid() = user_id).

## 5. Dodatkowe uwagi

- Wszystkie kolumny daty i czasu używają `timestamptz` z domyślną wartością `now()` dla możliwości audytu.
- Ograniczenia CHECK zapewniają długości tekstu oraz dozwolone wartości `source`/`status`.
- Schemat jest zgodny z 3NF; denormalizacja pominięta w MVP.
- Przyszłe rozszerzenia mogą obejmować zaawansowane typy enum, partycjonowanie lub indeksy złożone.
