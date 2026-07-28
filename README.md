# AvenzaAI

Learn coding and AI with step-by-step tutorials, hands-on practice exercises, and an AI tutor available 24/7. Built for beginners.

![AvenzaAI Screenshot](https://placehold.co/1200x630/4F3D8A/FFFFFF?text=AvenzaAI+Preview)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Auth** | NextAuth v5 (Google OAuth + Credentials) |
| **Database** | PostgreSQL (Neon) via Prisma 6 ORM |
| **AI** | Google Gemini 2.5 Flash (tutor, code eval, chat) |
| **Styling** | Tailwind CSS v4 + shadcn/ui (Radix Nova) |
| **Editor** | Monaco Editor (VS Code-based) |
| **Fonts** | Space Grotesk (headings) + Inter (body) |

## Features

- **Structured Courses** — Python, AI Basics, and JavaScript step-by-step lessons with progress tracking
- **Interactive Practice** — Real coding exercises in Monaco Editor with instant run/submit, hints, and score
- **AI Tutor (Astra)** — 24/7 chatbot that answers questions, explains concepts, and helps debug code
- **Progress Dashboard** — Streak tracking, level system (Beginner → Moderate → Advanced), completion stats
- **Onboarding Flow** — 3-step welcome wizard for new users (goal setting, Astra introduction)
- **Toast Notifications** — Real-time feedback for lesson completion, exercise submission, level-ups
- **Responsive** — Works on mobile (375px) through desktop (1920px) with adaptive layouts
- **SEO Optimized** — Per-page metadata, Open Graph tags, semantic HTML

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd avenza-ai
npm install

# 2. Configure environment
# Edit .env with your values:
#   DATABASE_URL — Neon PostgreSQL connection string
#   AUTH_SECRET — NextAuth secret (generate with `openssl rand -base64 32`)
#   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — Google OAuth credentials
#   GEMINI_API_KEY — Google Gemini API key

# 3. Push schema and seed
npx prisma db push
npm run seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample data |
| `npx prisma studio` | Open Prisma Studio (database browser) |
| `npx prisma generate` | Regenerate Prisma client after schema changes |

## Project Structure

```
app/
├── (auth)/               # Auth pages (login, register)
├── (main)/               # Main layout (Navbar + Footer)
├── about/                # About page
├── api/                  # API routes
│   ├── auth/             # NextAuth handler
│   ├── chat/             # Gemini chat (streaming)
│   ├── code/             # Code run/submit via Gemini
│   ├── progress/         # Lesson progress + level-up
│   ├── register/         # User registration
│   └── user/             # Profile & onboarding API
├── learn/                # Course browsing & lessons
│   └── [courseSlug]/     # Course detail + lesson viewer
├── practice/             # Exercise browsing
│   └── [exerciseId]/     # Monaco code editor + submit
└── profile/              # Learning dashboard

components/
├── chatbot/              # FloatingChatbot (Astra)
├── home/                 # Landing page sections
├── layout/               # Navbar, Footer
├── learn/                # CourseSidebar, LessonCard, ProgressBar, etc.
├── onboarding/           # Onboarding flow modal
├── practice/             # Skeleton loader
├── profile/              # EditProfileDialog, ProfileSkeleton
└── ui/                   # shadcn components (button, card, dialog, etc.)

lib/
├── auth.ts               # NextAuth configuration
├── db.ts                 # Prisma client singleton
├── levelCalculator.ts    # Level calculation logic
└── utils.ts              # cn() utility

prisma/
├── schema.prisma         # Database schema (9 models)
└── seed.ts               # Sample data seeder
```

## Database Schema

| Model | Purpose |
|-------|---------|
| **User** | Accounts with coding level, onboarding status, goals |
| **Course** | Language courses (Python, AI Basics, JavaScript) |
| **Lesson** | Course chapters with video URL, description, duration |
| **Exercise** | Coding challenges with starter code, solution, hints |
| **UserProgress** | Lesson completion tracking |
| **ExerciseProgress** | Exercise attempt tracking with score and submitted code |
| **ChatMessage** | AI chat history per user |
| **Account/Session** | NextAuth authentication models |

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/*` | GET/POST | NextAuth authentication |
| `/api/register` | POST | Create new account |
| `/api/chat` | GET/POST | Chat with Astra (streaming) |
| `/api/code/run` | POST | Execute code simulation via Gemini |
| `/api/code/submit` | POST | Evaluate code against solution |
| `/api/progress/complete` | POST | Mark lesson complete + level-up check |
| `/api/progress/[userId]` | GET | Fetch lesson progress |
| `/api/user/profile` | PATCH | Update user name |
| `/api/user/onboarding` | PATCH | Complete onboarding flow |

## Roadmap

- [x] Core learning flow (courses, lessons, exercises)
- [x] AI chatbot (Astra) with streaming responses
- [x] Code editor with run/submit evaluation
- [x] Progress tracking with streak and level system
- [x] Toast notifications and onboarding flow
- [x] Loading states, error boundaries, 404 page
- [x] SEO metadata and about page
- [ ] Dark/light theme toggle
- [ ] User-generated content (flashcards, notes)
- [ ] Advanced analytics dashboard
- [ ] Community features (leaderboards, discussions)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and ensure `npm run build` passes
4. Commit with a clear message
5. Open a Pull Request

## License

MIT — see LICENSE for details.
