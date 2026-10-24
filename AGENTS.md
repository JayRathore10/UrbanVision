# AI Agent Instructions for UrbanVision

## 1. Stack Separation (CRITICAL)
*   **Frontend Code:** MUST be written in standard JavaScript (`.js` or `.jsx`). **DO NOT use TypeScript (`.tsx`) for frontend files.** Use functional components and React Hooks.
*   **Backend Code:** MUST be written in strict TypeScript (`.ts`). Create explicit interfaces for all MongoDB documents, API requests, and responses.
*   **Database:** MUST use MongoDB via Mongoose. Do not write SQL or use Prisma.

## 2. File Structure Rules
*   **Backend:** 
    *   `/src/models/*.ts` (Mongoose Schemas)
    *   `/src/controllers/*.ts` (Business logic)
    *   `/src/routes/*.ts` (Express routing)
    *   `/src/types/*.ts` (TypeScript interfaces)
*   **Frontend:** 
    *   `/src/components/*.jsx` (Reusable UI)
    *   `/src/pages/*.jsx` (Route views)
    *   `/src/context/*.jsx` (State management)

## 3. Styling Rules
*   Use Tailwind CSS exclusively for styling.
*   Do not write custom CSS unless defining global theme variables in `index.css`.
*   Support Dark Mode using Tailwind's `dark:` variant and custom CSS variables (detailed in Theme setup).

## 4. Execution Directives
*   Always output full files, never truncate functions with `// ... code here`.
*   Ensure all API responses follow a consistent JSON format: `{ success: boolean, data: any, message?: string }`.