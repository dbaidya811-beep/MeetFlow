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
- **No Downloads** — Runs directly in the browser

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Real-time | WebRTC, WebSocket (ws) |
| Server | Node.js |

---

## Quick Start

### Installation

```bash
npm install
```

### Run Development (Separate Terminals)

```bash
# Terminal 1 — Backend WebSocket Server
npm run server

# Terminal 2 — Next.js Frontend
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- WebSocket: ws://localhost:8080

---

## Deployment

### Option 1: Render (Frontend + Backend together)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

2. **Render Dashboard → New Web Service:**
   - Build: `npm install`
   - Start: `node backend/server.js`
   - PORT: `3000`

3. Set environment variable: `NEXT_PUBLIC_WS_PORT=3000`

### Option 2: Separate Deployments

**Backend → Render:**
- Build: `npm install`
- Start: `node backend/server.js`
- PORT: `3000`
- URL: `wss://your-backend.onrender.com`

**Frontend → Vercel:**
- Deploy Next.js normally
- Set env var: `NEXT_PUBLIC_WS_PORT=3000`

---

## Project Structure

```
meeting/
├── src/
│   └── app/
│       ├── meeting/[id]/     # Meeting room
│       ├── terms/           # Terms
│       ├── privacy/        # Privacy
│       ├── layout.js       # Layout
│       └── page.js       # Landing page
├── backend/
│   └── server.js      # WebSocket server (port 8080)
├── public/           # Static assets
├── package.json
└── README.md
```

---

## Developing

| Command | Description |
|---------|-----------|
| `npm run dev` | Next.js dev server |
| `npm run server` | WebSocket server |
| `npm run build` | Production build |
| `npm run start` | Production start |
| `npm run lint` | Run ESLint |

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## License

See [LICENSE](LICENSE) file for details.