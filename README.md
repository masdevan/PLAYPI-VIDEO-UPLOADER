# PlayPi - Video Sharing Platform

A simple platform to upload and share videos with a dark theme, built with Next.js and React.

## Features

- 🎬 Video upload with drag & drop
- 📱 Responsive design
- 🌙 Dark theme
- 📺 Video player with controls
- 🔗 Share functionality
- 📋 Featured videos gallery
- 📱 Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 15.2.5
- **UI**: React 18.3.1, Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd playpi
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```

4. Run the development server
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables
```env
# App Configuration
NEXT_PUBLIC_APP_NAME=PlayPi
NEXT_PUBLIC_APP_DESCRIPTION=A simple platform to upload and share videos with a dark theme
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Video Upload Configuration
NEXT_PUBLIC_MAX_VIDEO_SIZE=100 # MB
NEXT_PUBLIC_ALLOWED_VIDEO_FORMATS=mp4,webm,avi,mov

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_DEBUG_MODE=true
```

### Optional Variables (for future use)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_UPLOAD_ENDPOINT=/api/upload

# Storage Configuration
NEXT_PUBLIC_STORAGE_PROVIDER=local
NEXT_PUBLIC_STORAGE_BUCKET=playpi-videos

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=
NEXT_PUBLIC_ANALYTICS_ENABLED=false
```

## Project Structure

```
playpi/
├── app/                    # Next.js app directory
│   ├── featured-videos/    # Featured videos page
│   ├── video/[id]/        # Individual video page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── header.tsx        # Header component
│   └── footer.tsx        # Footer component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── config.ts         # Environment configuration
│   └── utils.ts          # General utilities
├── public/               # Static assets
└── styles/               # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Video Upload Features

- **Supported Formats**: MP4, WebM, AVI, MOV
- **Max File Size**: Configurable via environment variables
- **Drag & Drop**: Upload by dragging files
- **File Validation**: Automatic format and size validation
- **Progress Tracking**: Upload progress indication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
