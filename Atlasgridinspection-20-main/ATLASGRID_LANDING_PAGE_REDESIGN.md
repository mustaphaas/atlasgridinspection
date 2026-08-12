# AtlasGrid Public Landing Page Redesign

## What changed

The AtlasGrid entry experience is now a dedicated public landing page rather than a protected dashboard route.

### Public and protected routes

- `/` — public AtlasGrid landing page
- `/login` — secure portal sign-in
- `/view` — REA Admin / REA Reviewer / Auditor workspace
- `/consultant-admin` — Consultant Admin workspace
- `/field-officer` — Field Officer application

REA users are now routed to `/view` after authentication so the public homepage and secure workspace remain separate.

## Landing-page structure

### 1. Hero scene

- Strong text-left composition
- Glass-effect navigation bar
- White and light-green Nigerian government visual language
- Animated AtlasGrid dashboard preview
- Real Nigeria SVG map from the existing `@svg-maps/nigeria` package
- Working links to page sections and secure portal access

### 2. Application description

- Explains the single-source-of-truth model
- Covers claims, consultant assignment, field inspection, quality review and REA verification
- Uses large modern cards, restrained green accents and classic serif details

### 3. Field-officer coordinate verification

- Custom responsive SVG scene showing a field officer at a solar project site
- Live coordinate card with latitude, longitude, accuracy and distance
- Mobile inspection screen showing location verification
- Clear statement that inspection data entry unlocks only after geofence verification

### 4. Connected workflow

- Claim intake
- Consultant assignment
- Verified field inspection
- Consultant quality review
- REA verification

### 5. Assurance and portal call to action

- Final controlled-record message
- Secure entry into the role-appropriate workspace

## Motion and responsiveness

- Subtle reveal animations as sections enter the viewport
- Floating dashboard, GPS and assurance elements
- Scroll snapping with graceful fallback
- Reduced-motion support
- Responsive desktop, tablet and mobile layouts
- Mobile navigation includes direct portal access

## Files added

- `client/pages/Landing.tsx`
- `client/landing.css`

## Files updated

- `client/App.tsx`
- `client/context/AtlasGridContext.tsx`
- `client/pages/Login.tsx`
- `client/pages/NotFound.tsx`
- `index.html`

## Validation

- All 74 client TypeScript/TSX source files passed syntax transpilation.
- All client stylesheets passed structural brace, quote and comment validation.
- Public, login and protected route targets were checked.
- Landing-page section targets and portal links were checked.

A complete Vite production build still requires project dependencies to be installed:

```bash
pnpm install
pnpm run build:client
```

For Cloudflare Pages:

```text
Build command: pnpm run build:client
Output directory: dist/spa
Root directory: /
```
