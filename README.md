# AthleteBridge 🏆

### Connecting Athletes Beyond Visibility

AthleteBridge is a platform designed to connect **athletes from all sports with potential sponsors and companies**, especially athletes who may not have a large social-media following but have strong achievements and potential.

Many talented athletes in less-popular sports struggle to find sponsorship opportunities because their achievements don't always translate into online visibility. AthleteBridge aims to bridge that gap by helping sponsors discover athletes based on their **achievements, sport, skills, and profile**, rather than just their popularity.

---

## 🚀 Problem

Athletes in less-popular or underrepresented sports often face difficulties in getting sponsorships.

Their challenges include:

- Limited social-media visibility
- Difficulty reaching potential sponsors
- Lack of a centralized platform for sponsorship opportunities
- Sponsors struggling to discover talented athletes beyond mainstream sports
- Achievements being overlooked because of follower count

This creates a gap between **talented athletes looking for opportunities** and **companies looking for athletes to support**.

---

## 💡 Solution

AthleteBridge provides a platform where:

### 🏃 Athletes can

- Create a professional athlete profile
- Showcase their sport and achievements
- Highlight competitions, awards, and experience
- Discover potential sponsorship opportunities
- Send and receive sponsorship requests

### 🏢 Sponsors can

- Create a sponsor/company profile
- Discover athletes across different sports
- Search and explore athlete profiles
- View achievements and experience
- Shortlist athletes
- Send sponsorship requests

The goal is to make sponsorship discovery more **achievement-oriented and accessible**.

---

## ✨ Key Features

- 🔐 User authentication
- 🏃 Athlete profiles
- 🏆 Achievement showcase
- 🏢 Sponsor profiles
- 🔎 Athlete discovery
- 📋 Athlete shortlisting
- 🤝 Sponsorship requests
- 📊 Athlete and sponsor dashboards
- 📱 Responsive interface
- 🗄️ Supabase-backed data and authentication

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend & Database

- Supabase
- PostgreSQL
- Supabase Authentication

### Development Tools

- Git
- GitHub
- VS Code
- Bolt.new

---

## 📁 Project Structure

```text
athletesbridge/
│
├── src/
│   ├── components/
│   │   ├── athlete/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── queries.ts
│   │   ├── router.tsx
│   │   ├── supabase.ts
│   │   └── types.ts
│   │
│   ├── pages/
│   │   ├── athlete/
│   │   ├── auth/
│   │   └── sponsor/
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── supabase/
│   └── migrations/
│
├── package.json
├── vite.config.ts
└── README.md
