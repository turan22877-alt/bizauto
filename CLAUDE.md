# CLAUDE.md
Всегда отвечай на русском языке, независимо от языка запроса.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Selliz (Molsheim Edition) - современная система управления бизнесом для автоматизации записей, клиентов, персонала и инвентаря. Single-page React приложение с локальным хранилищем данных (localStorage).

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (no tests configured)
npm run lint
```

## Architecture

### Data Flow & State Management

- **No Redux/external state**: All state managed via React hooks in `App.tsx`
- **Multi-tenant architecture**: Data scoped by `ownerUid` (user ID)
  - All entities (clients, staff, appointments, inventory) have `ownerUid` field
  - `scopeByOwner()` utility filters data for current user
  - State setters in App.tsx merge data across users
- **Persistence**: Debounced localStorage saves (500ms delay) via `utils/storage.ts`
  - Auto-flush on page unload to prevent data loss
  - Keys: `b_clients`, `b_staff`, `b_appointments`, `b_inventory`, `b_users`, `b_session`

### Authentication System

- **Local-only auth** (no backend): `utils/auth.ts`
- Password hashing via Web Crypto API (SHA-256)
- Session stored in localStorage as `b_session`
- Multi-user support: users stored in `b_users` array

### Component Structure

```
App.tsx                    # Root component, owns all state
├── AuthScreen             # Login/register (shown when !user)
├── Sidebar                # Navigation menu
├── Header                 # Top bar with search, notifications, settings
├── SettingsModal          # Profile, backup/restore
└── [Active Section]       # One of:
    ├── Dashboard          # Overview with 3D hero
    ├── BookingJournal     # Appointments CRUD
    ├── ClientManagement   # Clients CRUD
    ├── StaffManagement    # Staff CRUD
    ├── InventoryManager   # Products CRUD
    ├── FinancialStats     # Revenue analytics
    ├── LoyaltyManager     # Client loyalty points
    ├── NotificationCenter # Notifications view
    ├── AnalyticsView      # Charts & insights
    └── PayrollCalculator  # Staff salary calculation
```

### Key Files

- `types.ts` - All TypeScript interfaces and enums
- `App.tsx` - Main component with state and routing logic
- `utils/storage.ts` - Debounced localStorage operations
- `utils/auth.ts` - Authentication logic
- `utils/migrate.ts` - Data migration utilities for multi-tenant
- `hooks/useToast.ts` - Toast notification system
- `hooks/useCurrency.ts` - Currency formatting

### UI Components

- `components/ui/` - Reusable UI primitives (Button, Modal, Toast, LoadingSpinner, ConfirmDialog)
- `components/three/` - Three.js 3D scenes (AuthScene3D, DashboardHero3D)
- `components/ErrorBoundary.tsx` - React error boundary

## Important Patterns

### Adding New Features

1. **New entity type**: Add interface to `types.ts`, add to multi-tenant system in `App.tsx`
2. **New section**: Add to `AppSection` enum, create component, add route in `App.tsx` renderContent()
3. **State updates**: Always use provided setters from App.tsx (they handle multi-tenant merging)

### Data Scoping

When working with data, remember:
- Raw state (`clientsAll`, `staffAll`, etc.) contains ALL users' data
- Scoped state (`clients`, `staff`, etc.) is filtered for current user
- Always pass scoped data to child components
- State setters automatically merge changes back into raw state

### 3D Components

- Use Three.js for 3D scenes
- Scenes are in `components/three/`
- Keep animations performant (use `requestAnimationFrame`)

### Styling

- Tailwind CSS 4 with custom configuration
- Custom animations defined in `index.css`: fade-in, scale-in, slide-in-right, shimmer, flash, shake
- Mobile-first responsive design (breakpoints: 768px, 1024px)
- Custom scrollbar styles
- Header font: Syncopate (for titles), Body font: Inter

## Environment Variables

Set in `.env` file (not committed):
```
GEMINI_API_KEY=your_key_here
```

Accessed via `process.env.GEMINI_API_KEY` (defined in vite.config.ts)

## Notes

- No backend - all data is client-side only
- No real authentication - passwords hashed but stored locally
- Multi-user support is for demo purposes (shared localStorage)
- Currency support: RUB (₽), USD ($), AZN (₼)
- Language: Russian UI
