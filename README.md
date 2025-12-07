# The Everything AI - Insight Therapy Learn

[![CI](https://github.com/Start-Here-Project/insight-therapy-learn/actions/workflows/ci.yml/badge.svg)](https://github.com/Start-Here-Project/insight-therapy-learn/actions/workflows/ci.yml)
[![Security Audit](https://github.com/Start-Here-Project/insight-therapy-learn/actions/workflows/security.yml/badge.svg)](https://github.com/Start-Here-Project/insight-therapy-learn/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A next-generation AI-powered mental health platform providing accessible, voice-based therapy sessions, emotion analysis, and crisis support.

![Project Banner](./public/og-image.png)

## 🚀 Features

- **AI Voice Therapy**: Real-time voice conversations with an empathetic AI therapist.
- **Emotion Analysis**: Live sentiment tracking and visualization of emotional states.
- **Secure & Private**: End-to-end encryption, GDPR compliance, and automated data deletion.
- **Crisis Support**: Immediate access to localized emergency resources.
- **Modern UI**: Built with React, Tailwind CSS, and Framer Motion for a premium experience.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui, Radix Primitives
- **State Management**: React Hooks, React Query
- **Backend (BaaS)**: Supabase (Auth, Database, Edge Functions)
- **AI Services**: OpenAI (LLM), D-ID (Avatar), Vercel AI SDK
- **Testing**: Vitest, React Testing Library
- **DevOps**: GitHub Actions, Husky, Vercel

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Start-Here-Project/insight-therapy-learn.git
   cd insight-therapy-learn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   *Note: Never commit your `.env` file!*

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

We rely on comprehensive testing to ensure reliability.

```bash
# Run unit and integration tests
npm run test

# Run tests with UI
npm run test:ui

# Check code style
npm run lint
```

## 📁 Project Structure

```
src/
├── components/     # UI components (Atomic design)
│   ├── auth/       # Authentication forms
│   ├── safety/     # Crisis intervention tools
│   ├── ui/         # Generic accessible UI primitives
│   └── voice/      # Voice therapy interface
├── config/         # App constants and configuration
├── hooks/          # Custom React hooks (logic layer)
├── lib/            # Utilities (Performance, Validation, Error Tracking)
├── pages/          # Route components
└── services/       # API integration layer
```

## 🛡️ Security & Compliance

- **GDPR**: Validated privacy policy and data erasure workflows.
- **Audit Logs**: Sensitive actions are logged for compliance monitoring.
- **Headers**: Strict Content Security Policy (CSP) and security headers configured.

See [SECURITY.md](SECURITY.md) for more details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit Pull Requests, report bugs, and request features.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
