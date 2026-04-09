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
- **All-in-One Server** — Frontend + WebSocket server on a single port

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19 |
| Styling | Tailwind CSS 4 |
| Real-time | WebRTC, WebSocket (ws) |
| Server | Node.js (combined HTTP + WS) |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (both frontend + WebSocket on port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Deploy to Render

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Create Web Service on Render:**
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm run start`
   - Environment: `NODE_ENV=production`
   - PORT: `3000`

3. **Deploy** — Your app will be live at `https://your-app.onrender.com`

---

## Project Structure

```
meeting/
├── src/
│   └── app/
│       ├── meeting/[id]/     # Meeting room page
│       ├── terms/            # Terms of service
│       ├── privacy/         # Privacy policy
│       ├── layout.js        # Root layout
│       └── page.js         # Landing page
├── server.js              # Combined Next.js + WebSocket server
├── public/               # Static assets
├── package.json
└── README.md
```

---

## How It Works

1. **Create a Meeting** — Enter your name on the landing page and click "Start Meeting" to generate a unique room link
2. **Share the Link** — Copy and share the meeting URL with participants
3. **Join a Meeting** — Participants open the link and enter their name to join
4. **WebRTC Connection** — The WebSocket server facilitates signaling; peers connect directly via WebRTC for video/audio
5. **In-Meeting Features** — Use mute, video toggle, screen share, and chat controls

---

## NPM Scripts

| Command | Description |
|---------|-----------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

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