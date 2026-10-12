# AGENTS.md

## 📌 Project Name
ParentMentor AI – Smart Parenting & Kids Engagement Coach

---

## 🎯 Problem Statement
Parents struggle with managing children's habits like screen time, discipline, food routines, and emotional behavior.

Existing solutions are generic and not actionable.

This project provides:
👉 AI-driven, personalized, step-by-step parenting guidance via web interface

---

## 🌐 Platform Scope
This is a **web application (NOT mobile)**.

- Frontend: React (web)
- Backend: Flask (Python)
- AI: OpenAI / Claude / Codex

---

## ⚙️ Tech Stack

### Frontend
- React (Vite preferred)
- Axios for API calls
- Basic CSS / Tailwind (optional)

### Backend
- Flask (REST APIs)
- Python 3.10+

### Database (Optional for MVP)
- SQLite (quick setup) OR PostgreSQL

---

## 📂 Folder Structure

/backend  
  /routes  
  /services  
  /models  
  app.py  

/frontend  
  /src  
    /components  
    /pages  
    /services (API layer)  

/docs  
  PLAN.md  
  ARCHITECTURE.md  

---

## 🧩 Multi-Agent Workflow (MANDATORY)

Codex must follow:

### 1. Planner Agent
- Define feature
- Break into tasks
- Output: PLAN.md

### 2. Architect Agent
- Design APIs
- Define data flow
- Output: ARCHITECTURE.md

### 3. Developer Agent
- Implement feature
- Write clean modular code

### 4. Reviewer Agent
- Validate logic
- Check edge cases
- Suggest improvements

---

## 🔁 Development Flow

1. Understand feature
2. Check existing code
3. Implement small unit
4. Test locally
5. Update docs

---

## 🧾 Coding Conventions

### Backend (Flask)
- Use Blueprints (modular routes)
- Keep business logic in services/
- Proper error handling (try/catch)
- Return JSON responses only

### Frontend (React)
- Functional components only
- Use hooks (useState, useEffect)
- Keep components small
- Separate UI and API logic

---

## 📡 API Design Rules

- Follow REST:
  - GET /api/ask
  - POST /api/chat
- Always return:
  {
    "success": true,
    "data": {},
    "error": null
  }

- Handle errors properly:
  {
    "success": false,
    "error": "message"
  }

---

## 🤖 AI Response Format (STRICT)

All responses must follow:

1. Problem Breakdown  
2. Action Plan  
3. Daily Routine  
4. Tips  

Avoid:
- Generic answers
- Unsafe advice

---

## 🔐 Security Rules

- Do NOT hardcode API keys
- Use `.env`
- Do NOT expose secrets to frontend

---

## 🚀 MVP Scope (STRICT)

Build ONLY:

- Chat UI (input + response)
- Flask API for AI interaction
- Basic child profile (optional)
- Predefined prompts

Do NOT build:
- Auth system (unless time permits)
- Gamification
- Complex dashboards

---

## 🧪 Example Feature Flow

User enters:
"How to reduce screen time?"

Frontend:
→ sends POST /api/chat

Backend:
→ calls AI
→ formats response

Frontend:
→ displays structured output

---

## ⚠️ Do NOT

- Over-engineer
- Add unnecessary libraries
- Build unused features
- Write large monolithic files

---

## ✅ Do

- Keep it simple
- Focus on working demo
- Make AI output strong
- Ensure UI is usable

---

## 🔄 Iteration Strategy

1. Build working chat first
2. Improve AI response quality
3. Add minor enhancements if time permits

---

## 🧠 Final Rule

Codex must behave like a team:

PLAN → DESIGN → BUILD → REVIEW