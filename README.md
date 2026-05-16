# Collaborative Pixel Grid

A real-time, multiplayer collaborative grid application built with Next.js, Fastify, Socket.io, and Prisma.

## Project Structure
- `/frontend`: Next.js application (App Router, Tailwind CSS, Zustand)
- `/backend`: Fastify server (Socket.io, Prisma, Redis)

## Development Setup

### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` (Configure your DATABASE_URL and REDIS_URL)
4. `npx prisma migrate dev`
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env.local`
4. `npm run dev`

---

## Deployment Guide (Production)

This project is designed to be deployed as a **Monorepo** on GitHub.

### 1. Database & Redis
- **Database**: Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) (PostgreSQL).
- **Redis**: Use [Upstash](https://upstash.com). Required for the Socket.io Redis adapter.

### 2. Backend (Render / Railway / Fly.io)
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm start`
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `REDIS_URL`: Your Redis connection string.
  - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.vercel.app`).
  - `PORT`: `10000` (or as provided by host).

### 3. Frontend (Vercel)
- **Root Directory**: `frontend`
- **Framework**: Next.js
- **Environment Variables**:
  - `NEXT_PUBLIC_SOCKET_URL`: Your backend service URL.

---

## Technical Stack
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Socket.io-client, Zustand.
- **Backend**: Node.js, Fastify, Socket.io, Prisma, PostgreSQL, Redis.
- **Real-time**: Socket.io with Redis Adapter for horizontal scaling.
