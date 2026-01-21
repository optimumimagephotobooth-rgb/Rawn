# MinistryOS - Next.js + Supabase

A modern church management platform migrated from Google Apps Script to Next.js with Supabase.

## Features

- 🔐 **Authentication**: Google OAuth via Supabase Auth
- 🙏 **Prayer Management**: Submission, moderation, and public prayer wall
- 📖 **Sermon Management**: CRUD operations for sermons with media links
- 🎮 **Gamification**: XP system, BTC simulation, leaderboards
- 📺 **Live Streaming**: YouTube live stream integration
- 👥 **Multi-tenant**: Church-based data isolation
- 🔒 **Role-based Access**: Admin, Teacher, Student roles

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Google OAuth)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ministryos-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
   - Configure Google OAuth provider in Supabase Dashboard:
     - Go to Authentication > Providers
     - Enable Google provider
     - Add your Google OAuth credentials

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ministryos-nextjs/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages
│   ├── (admin)/           # Admin pages
│   ├── (teacher)/         # Teacher pages
│   ├── (student)/         # Student pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Auth components
│   ├── ui/                # UI components
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase clients
│   ├── auth/              # Auth utilities
│   └── utils/             # Helper functions
├── types/                 # TypeScript types
├── supabase/              # Database schema
└── ...
```

## Database Schema

The database schema is defined in `supabase/schema.sql`. Key tables:

- `churches` - Multi-tenant church data
- `users` - User accounts (extends Supabase auth.users)
- `prayers` - Prayer requests
- `sermons` - Sermon content
- `gamification` - XP tracking
- `btc_wallets` - BTC simulation wallets
- `audit_logs` - Activity logging

## API Routes

### Authentication
- `POST /api/auth/login` - Initiate Google OAuth
- `GET /api/auth/callback` - OAuth callback handler

### Prayers
- `GET /api/prayers` - Get prayers (filtered)
- `POST /api/prayers` - Submit prayer request
- `GET /api/prayers/pending` - Get pending prayers (Admin)
- `PATCH /api/prayers/[id]` - Update prayer status (Admin)

### Sermons
- `GET /api/sermons` - Get sermons
- `POST /api/sermons` - Create sermon (Admin)
- `PATCH /api/sermons/[id]` - Update sermon (Admin)
- `DELETE /api/sermons/[id]` - Delete sermon (Admin)

### Gamification
- `GET /api/gamification/leaderboard` - XP leaderboard
- `GET /api/gamification/btc-leaderboard` - BTC leaderboard
- `GET /api/gamification/wallet` - User wallet

### Churches
- `POST /api/churches` - Create church (onboarding)

## Pages

### Public Pages
- `/login` - Google OAuth login
- `/onboarding` - Church setup for new users
- `/prayer-request` - Submit prayer request
- `/public-prayer` - Public prayer wall
- `/sermons` - Browse sermons
- `/live` - Live streaming page

### Admin Pages
- `/dashboard` - Admin dashboard with stats
- `/admin/prayers` - Prayer moderation
- `/admin/sermons` - Sermon management
- `/admin/gamification` - Gamification dashboard

### User Pages
- `/teacher` - Teacher portal
- `/student` - Student portal

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Migration from Google Apps Script

See `MIGRATION_PLAN.md` and `MIGRATION_MAPPING.md` for detailed migration documentation.

## Security

- Row Level Security (RLS) enabled on all tables
- API route authentication checks
- Input validation with Zod (can be added)
- XSS protection via React's built-in escaping

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.

