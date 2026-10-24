# AI Agent Coding Standards & Guidelines

When generating code or making architectural decisions for UrbanVision, adhere strictly to these rules:

## 1. Tech Stack Strictness
*   **Frontend:** React (TypeScript), Tailwind CSS, Lucide React (icons), Mapbox GL.
*   **Backend:** Node.js, Express/NestJS, Prisma ORM, PostgreSQL.
*   **Do not introduce arbitrary libraries** without explicit user permission.

## 2. Code Formatting & Styling
*   Use functional components with React Hooks.
*   **Tailwind Rules:** Do not use custom CSS classes unless absolutely necessary. Rely on utility classes. Use the defined CSS variables for colors (e.g., `bg-background`, `text-foreground`).
*   **UI Vibe:** Ensure all cards have `rounded-2xl` or `rounded-3xl` and `shadow-sm` in light mode. Borders should be subtle (`border-slate-200/60`).

## 3. State Management
*   Use React Context for global state (Theme, User Auth).
*   Use SWR or React Query for data fetching and caching (do not use raw `useEffect` for API calls unless it's a simple script).

## 4. File Structure Convention
```
/src
  /components
    /ui        # Reusable base components (buttons, inputs)
    /map       # Map related components
    /dashboard # Specific layout components
  /hooks       # Custom react hooks
  /lib         # Utility functions, API clients
  /types       # TypeScript interfaces
```

## 5. Commit Conventions
*   Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.