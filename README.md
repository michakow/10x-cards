# 10x‑cards

10x‑cards is an AI‑powered flashcard application that enables users to quickly generate, review, and manage customizable learning decks. It leverages LLM models for automated card suggestions, while offering manual creation and spaced-repetition study sessions.

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Available Scripts](#available-scripts)
4. [Project Scope](#project-scope)
5. [Project Status](#project-status)
6. [License](#license)

## Tech Stack

- **Framework**: Astro 5
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI Integration**: Openrouter.ai (LLM models)
- **CI/CD**: GitHub Actions
- **Hosting**: DigitalOcean (Docker)

## Getting Started

### Prerequisites

- Node.js **v22.14.0** (use [nvm](https://github.com/nvm-sh/nvm) if needed)
- npm (bundled with Node.js)
- A Supabase project (URL & anon key)
- An Openrouter.ai API key

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/michakow/10x-cards.git
   cd 10x-cards
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root and add:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open <http://localhost:3000> in your browser.

## Available Scripts

In the project directory, you can run:

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start Astro development server |
| `npm run build`    | Build for production           |
| `npm run preview`  | Preview the production build   |
| `npm run astro`    | Run Astro CLI commands         |
| `npm run lint`     | Run ESLint across the codebase |
| `npm run lint:fix` | Run ESLint in --fix mode       |
| `npm run format`   | Format code with Prettier      |

## Project Scope

**Core Features:**

- Automated flashcard generation via AI (LLM suggestions)
- Manual creation, editing, and deletion of flashcards
- User authentication and account management (Supabase Auth)
- Spaced‑repetition study sessions using an open‑source scheduling algorithm
- Storage of user data and flashcards in Supabase (PostgreSQL)
- Basic usage metrics (generated vs. accepted cards)

## Project Status

MVP in active development. Contributions and feedback are welcome!

## License

This project is licensed under the MIT License.
