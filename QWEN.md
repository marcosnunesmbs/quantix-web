# Quantix Finance Dashboard - Project Context

## Project Overview
Quantix Finance is a modern financial dashboard application built with React, TypeScript, and Tailwind CSS. It appears to be a fork or evolution of the "Parto Finance Dashboard" as mentioned in the README. The application features a responsive design with dark/light theme support, transaction tracking, and financial visualization capabilities.

## Project Structure
- **Main Technologies**: React 18, TypeScript, Tailwind CSS, Vite
- **UI Components**: Lucide React icons, Recharts for data visualization
- **Routing**: React Router DOM for navigation
- **Styling**: Tailwind CSS with custom configuration for themes
- **Theming**: Dark/light mode support with system preference detection

## Key Features
- Dashboard with financial overviews and charts
- Transaction history tracking
- Responsive design optimized for different screen sizes
- Dark/light theme toggle with local storage persistence
- Mobile-friendly sidebar navigation

## Application Architecture
- **Main Entry Point**: `src/main.tsx` - Sets up React StrictMode and ThemeProvider
- **Routing**: `src/App.tsx` - Defines routes using React Router
- **Layout**: `src/layouts/DashboardLayout.tsx` - Main layout with sidebar and header
- **Components**: Located in `src/components/` directory
- **Context**: Theme context in `src/context/ThemeContext.tsx` manages theming

## Building and Running

### Prerequisites
- Node.js (latest LTS version recommended)
- npm package manager

### Setup Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint the codebase
npm run lint
```

### Development Server
The development server runs using Vite and will serve the application at `http://localhost:5173` by default.

## File Structure
- `src/` - Main source code directory
  - `components/` - Reusable UI components (Header, Sidebar, ThemeToggle)
  - `layouts/` - Layout components (DashboardLayout)
  - `pages/` - Route components (Dashboard, Login, Transactions)
  - `context/` - React context providers (ThemeContext)
  - `lib/` - Utility functions

## Development Conventions
- Uses TypeScript for type safety
- Follows React best practices with hooks
- Implements responsive design with Tailwind CSS
- Uses dark mode with 'class' strategy in Tailwind
- Component-based architecture
- Local storage for theme preference persistence

## Configuration Files
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS customization
- `tsconfig.json` - TypeScript compilation options
- `package.json` - Dependencies and scripts

## Styling
- Uses Tailwind CSS utility classes
- Custom color palette with emerald as primary color
- Inter font family
- Dark mode support with automatic system preference detection

## Qwen Added Memories
- Ao criar ou modificar páginas ou componentes, textos devem ter locale por padrão
