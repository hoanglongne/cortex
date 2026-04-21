# SpeakMate - MVP Roadmap

## 🎯 Project Overview

SpeakMate is a random audio-chat app for IELTS learners to practice speaking with real partners.

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Components:** Shadcn UI

## 🎨 Design System

### Colors

| Token            | Value                     | Usage                          |
| ---------------- | ------------------------- | ------------------------------ |
| Background       | `#050505` / `zinc-950`    | Main background                |
| Surface          | `zinc-900`                | Cards, panels                  |
| Text Primary     | `white`                   | Headings                       |
| Text Secondary   | `zinc-400`                | Subtitles, captions            |
| Accent Primary   | `#3B82F6` (Electric Blue) | Primary buttons, active states |
| Accent Secondary | `#8B5CF6` (Violet)        | Gradients, highlights          |
| Destructive      | `#EF4444` (Red)           | End call, destructive actions  |

### Typography

- **Font:** Inter / Geist Sans
- **Headings:** Font-semibold, white
- **Body:** Font-normal, zinc-300
- **Captions:** Font-medium, zinc-400

### Border Radius

- Cards: `rounded-3xl`
- Buttons: `rounded-full`
- Pills: `rounded-full`

### Effects

- Glassmorphism: `backdrop-blur-xl bg-white/10`
- Subtle borders: `border border-white/10`

---

## 📱 Screens & Components

### Phase 1: Core MVP ✅

- [x] In-Call Screen
  - [x] Timer pill header
  - [x] Mock audio visualizer
  - [x] Topic card with refresh
  - [x] Control bar (Mute, End Call, Evaluate)

### Phase 2: Pre-Call Experience ✅

- [x] Home/Landing screen
- [x] Matchmaking screen (searching for partner)
- [x] Partner found animation

### Phase 3: Post-Call Experience ✅

- [x] Rating/Feedback screen
- [x] Call summary with stats
- [x] Score breakdown

### Phase 4: User Profile ✅

- [x] Profile settings
- [x] IELTS band score display
- [x] Call history

### Phase 5: Social Features ✅

- [x] Leaderboard
- [x] Achievements/badges
- [x] Friend system

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📝 Notes

- Desktop-first design with responsive mobile layouts
- Max-width container: `max-w-7xl` for desktop, centered
- Mobile bottom navigation bar for easy thumb access
- Maintain consistent spacing with Tailwind's spacing scale
- All interactive screens use client-side rendering to avoid hydration issues
