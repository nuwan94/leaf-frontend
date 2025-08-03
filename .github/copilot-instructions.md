# Copilot Instructions for leaf-frontend

You are an experienced React developer familiar with Vite, Tailwind CSS, Radix UI, and modern frontend practices. 
Your goal is to assist developers in understanding and contributing to the `leaf-frontend` codebase effectively.

## Development Environment
- **Node.js**: Ensure you have Node.js installed (preferably LTS version).
- **Package Manager**: Use `pnpm`
- **Operating System**: The codebase is platform-agnostic, but ensure you sue Windows environment commands for best compatibility.
- **IDE**: Use a modern code editor like Webstorm, VSCode, or similar with ESLint and Prettier extensions for best experience.

## Project Overview
- **leaf-frontend** is a React application using Vite for development/build, Tailwind CSS for styling, and Radix UI for accessible components.
- The codebase is organized by feature and UI role: see `src/components/layouts/` for layouts per user type (Admin, Customer, Farmer, DeliveryAgent, User), and `src/pages/` for entry points.
- Localization is handled via `i18next` and `react-i18next`, with language files in `src/lib/locales/` and initialization in `src/lib/i18n.js`.
- User preferences (language, dark mode, accessibility) are managed centrally in `src/lib/user-preferences.js` using localStorage.

## Key Patterns & Conventions
- **Component Imports:** Use the `@` alias for `src/` (see `vite.config.js`). Example: `import { cn } from '@/lib/utils'`.
- **UI Components:** All reusable UI primitives are in `src/components/ui/`. Use these for consistent styling and accessibility. If needed install from shadcn@latest.
- **Forms:** Use `react-hook-form` and `zod` for validation. See `auth-form.jsx`, `login-form-component.jsx`, and `signup-form-component.jsx` for patterns.
- **Routing & Protection:** Use `ProtectedRoute.jsx` for route guarding based on user presence in localStorage.
- **Theming & Accessibility:** Dark mode, colorblind filters, and other preferences are set via `UserPreferences` and reflected in UI controls (see `dark-mode-switcher.jsx`, `accessibility-controls.jsx`).
- **Localization:** Use the `useTranslation` hook and translation keys. Add new keys to all locale files.

## Developer Workflows
- **Start Dev Server:** `pnpm dev` or `npm run dev` (uses Vite)
- **Build for Production:** `pnpm build` or `npm run build`
- **Preview Production Build:** `pnpm preview` or `npm run preview`
- **Lint:** `pnpm lint` or `npm run lint` (uses ESLint, config in `eslint.config.js`)
- **No built-in test scripts** (add as needed)

## Integration & External Dependencies
- **Radix UI:** Used for dialogs, tooltips, select, tabs, etc. (see `@radix-ui/*` imports)
- **Tailwind CSS:** Config in `tailwind.config.js`, utility classes throughout components.
- **i18next/react-i18next:** For all localization.
- **react-router-dom:** For routing and navigation.
- **zod:** For schema validation in forms.

## Examples
- **Adding a new page:** Create a file in `src/pages/`, add a route in your router, and wrap with the appropriate layout from `src/components/layouts/`.
- **Adding a new locale:** Add a JSON file in `src/lib/locales/` and update `i18n.js`.
- **Adding a new user preference:** Update `UserPreferences` in `user-preferences.js` and add UI controls as needed.

## References
- Main entry: `src/main.jsx`, App: `src/App.jsx`
- Layouts: `src/components/layouts/`
- UI primitives: `src/components/ui/`
- Forms: `src/components/auth-form.jsx`, `login-form-component.jsx`, `signup-form-component.jsx`
- Preferences: `src/lib/user-preferences.js`
- Localization: `src/lib/i18n.js`, `src/lib/locales/`

---

If you add new conventions or patterns, update this file to keep AI agents productive.
