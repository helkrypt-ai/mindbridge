# MindBridge — User Guide

> **MindBridge** is an AI mental wellness companion that helps you track your mood, journal your thoughts, and have supportive conversations — all in one private, secure app.

---

## Table of Contents

1. [What is MindBridge?](#1-what-is-mindbridge)
2. [Creating an Account](#2-creating-an-account)
3. [Logging In](#3-logging-in)
4. [Onboarding](#4-onboarding)
5. [Features Walkthrough](#5-features-walkthrough)
   - [Daily Mood Check-In](#51-daily-mood-check-in)
   - [AI Chat Companion](#52-ai-chat-companion)
   - [Journal](#53-journal)
   - [Insights Dashboard](#54-insights-dashboard)
   - [Subscription & Premium](#55-subscription--premium)
   - [Feedback Widget](#56-feedback-widget)
6. [Safety & Crisis Support](#6-safety--crisis-support)
7. [FAQ](#7-faq)

---

## 1. What is MindBridge?

MindBridge is a freemium mental wellness SaaS app built for people who want a private, judgment-free space to:

- **Track** daily mood with a simple 1–10 scale
- **Chat** with an AI companion trained on CBT (Cognitive Behavioral Therapy) techniques
- **Journal** thoughts and receive personalised reflection prompts
- **See patterns** with mood trend charts and streak counters
- **Get help fast** — crisis resources are one tap away whenever you need them

MindBridge is **not a replacement for professional therapy**. For clinical care, please seek a licensed mental health professional.

---

## 2. Creating an Account

1. Navigate to **[https://mindbridge-indol.vercel.app](https://mindbridge-indol.vercel.app)**
2. Click **"Sign up"**
3. Choose one of:
   - **Email/password** — enter your email and choose a password (min. 8 characters)
   - **Continue with Google** — one-click sign-up via your Google account
4. Check your inbox for a confirmation email (email/password flow only) and click the link

Your account is now active.

---

## 3. Logging In

1. Go to the app URL and click **"Log in"**
2. Enter your email and password, or click **"Continue with Google"**
3. You'll be redirected to onboarding (first time) or your Dashboard

> **Forgot password?** Use the "Forgot password?" link on the login page to receive a reset email.

---

## 4. Onboarding

First-time users go through a short 3-step setup:

| Step | What you'll enter |
|------|-------------------|
| 1. Name | Your preferred name (used in AI responses) |
| 2. Goals | What you want from MindBridge (e.g. "Reduce anxiety", "Sleep better") |
| 3. Primary concern | Choose one: Anxiety · Stress · Sleep · Mood |

This takes under 2 minutes and lets MindBridge personalise your experience. You can update these at any time in **Settings**.

---

## 5. Features Walkthrough

### 5.1 Daily Mood Check-In

**Where:** Bottom nav → **Check-In**

Rate how you feel right now on a scale of **1 (very low) to 10 (excellent)**. Optionally add a short note.

- Your check-in is saved privately to your account
- Multiple check-ins per day are allowed
- Data feeds into your Insights dashboard

**Tips:**
- Try to check in at the same time each day for the most useful trends
- The note field is free-form — a word or a sentence is enough

---

### 5.2 AI Chat Companion

**Where:** Bottom nav → **Chat**

Have a real-time conversation with your AI companion. The AI uses CBT-informed techniques to:

- Validate your feelings
- Gently challenge unhelpful thought patterns
- Suggest small, actionable steps
- Guide relaxation exercises on request

**How streaming works:** Responses appear word-by-word as they are generated. Each conversation is saved to your history so you can continue where you left off.

> If the app shows *"AI chat requires an OpenAI API key"*, the service is temporarily unavailable. Contact support.

**What the AI will NOT do:**
- Diagnose conditions or prescribe medication
- Replace a therapist or psychiatrist
- Retain information between separate sessions (each session starts fresh)

If you express severe distress, the AI will encourage you to contact **988 Lifeline**.

---

### 5.3 Journal

**Where:** Bottom nav → **Journal**

Write freely about your day, feelings, or anything on your mind. After you save an entry, MindBridge generates a **personalised reflection question** to help you go deeper.

Example reflection prompt:
> *"What emotions came up as you wrote this? What might this entry be telling you about what you need right now?"*

All journal entries are stored privately and sorted by date.

---

### 5.4 Insights Dashboard

**Where:** Bottom nav → **Dashboard** (home screen after login)

Your personal wellness overview:

| Widget | What it shows |
|--------|---------------|
| **Mood chart** | Line chart of your last 14 mood check-ins |
| **Average mood** | Numerical average across all recorded check-ins |
| **Streak** | Consecutive days with at least one check-in |
| **Pattern summary** | Brief AI-generated interpretation of your recent mood trend |

The dashboard updates automatically each time you log a check-in.

---

### 5.5 Subscription & Premium

MindBridge is **free to use** with core features. A **Premium plan ($9.99/month)** unlocks advanced features.

To upgrade:
1. Go to **Settings → Upgrade to Premium**
2. Click **"Subscribe"** — you'll be redirected to a Stripe checkout page
3. Enter your card details and confirm
4. You'll be returned to the app with Premium active immediately

To cancel: manage your subscription via the Stripe customer portal (link in Settings) or contact support.

> **Note:** Billing is handled securely by [Stripe](https://stripe.com). MindBridge never sees or stores your card number.

---

### 5.6 Feedback Widget

A floating **feedback button** is visible on every screen (bottom-right corner).

1. Tap the button
2. Select a star rating (**1–5 stars**)
3. Optionally add a free-text comment
4. Tap **"Send"**

Feedback is anonymous-optional — logged-in users are associated with their account, but you can submit without being logged in. All feedback is reviewed by the MindBridge team daily.

---

## 6. Safety & Crisis Support

MindBridge monitors chat and journal input for distress signals. If detected, a **Crisis Safety overlay** appears automatically with immediate help resources:

| Resource | Contact |
|----------|---------|
| **988 Suicide & Crisis Lifeline** | Call or text **988** (US) |
| **Crisis Text Line** | Text **HOME** to **741741** |
| **Emergency services** | Call **911** |

You can also open the overlay at any time via the **"Need help?"** link in Settings.

**MindBridge is not a crisis service.** If you or someone you know is in immediate danger, call 911.

---

## 7. FAQ

**Q: Is my data private?**
A: Yes. All data is stored in your personal Supabase account with Row Level Security — only you can read your mood entries, journal entries, and chat history. MindBridge employees cannot read your personal content.

**Q: Can I delete my account?**
A: Yes. Go to **Settings → Delete account**. This permanently deletes all your data from our servers. This action cannot be undone.

**Q: Does MindBridge work offline?**
A: No. An internet connection is required for all features (AI chat, check-ins, journal saves).

**Q: Is there a mobile app?**
A: MindBridge is a progressive web app (PWA) — you can add it to your home screen from your browser. A native Android app (via Google Play) is in development.

**Q: The AI gave a response I found unhelpful or upsetting — what should I do?**
A: Use the feedback widget to let us know. Include the approximate text of the response if possible. We review all feedback daily.

**Q: I forgot my password.**
A: Click **"Forgot password?"** on the login screen. A reset link will be sent to your registered email.

**Q: How do I change my name or primary concern?**
A: Go to **Settings → Edit profile**. Changes take effect immediately.

**Q: What AI model powers the chat?**
A: GPT-4o-mini by OpenAI, with a custom CBT-informed system prompt.

---

*Last updated: April 2026 · MindBridge is built and maintained by Helkrypt AI*
