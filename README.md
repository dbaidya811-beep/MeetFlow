# MeetFlow

<p align="center">
  <strong>Video Meetings, Made Simple</strong>
</p>

<p align="center">
  A real-time video conferencing application built with Next.js, WebRTC, and WebSocket for seamless peer-to-peer video communication.
</p>

---

## Features

- **Instant Meeting Creation** — Create rooms instantly and share links with participants
- **HD Video & Audio** — Crystal-clear video calls using WebRTC
- **Screen Sharing** — Share your screen for presentations and demos
- **In-Meeting Chat** — Send text messages during calls
- **Live Participants** — See who's in the meeting in real-time
- **Name Customization** — Personalize your display name
- **Mobile Responsive** — Works flawlessly on desktop and mobile devices
- **No Downloads** — Runs directly in the browser (Chrome, Firefox, Edge, Safari)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Real-time | WebRTC, WebSocket |
| Styling | Tailwind CSS |
| Build Tool | Turbopack |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd meeting

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Running the Application

Start both the frontend and backend servers:

```bash
# Terminal 1 — Start the backend WebSocket server
npm run server

# Terminal 2 — Start the Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
meeting/
├── src/
│   └── app/
│       ├── meeting/[id]/      # Meeting room page
│       ├── terms/            # Terms of service
│       ├── privacy/         # Privacy policy
│       ├── layout.js        # Root layout
│       └── page.js         # Landing page
├── backend/
│   └── server.js          # WebSocket signaling server
├── public/               # Static assets
├── package.json
└── tailwind.config.mjs
```

---

## How It Works

1. **Create a Meeting** — Enter your name on the landing page and click "Start Meeting" to generate a unique room link
2. **Share the Link** — Copy and share the meeting URL with participants
3. **Join a Meeting** — Participants open the link and enter their name to join
4. **WebRTC Connection** — The WebSocket server facilitates signaling; peers connect directly via WebRTC for video/audio
5. **In-Meeting Features** — Use mute, video toggle, screen share, and chat controls

---

## Development Commands

| Command | Description |
|---------|-----------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run server` | Start WebSocket server |

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

> Note: WebRTC requires a secure context (HTTPS) in production. For local development, localhost is allowed.

---

## License

MIT License — see LICENSE file for details.