# QConnect-MVGR
QConnect is a role-based university networking platform connecting students, alumni, faculty, and recruiters within a verified academic ecosystem. It supports manual alumni verification, skill-based discovery, personalized feeds, and moderated interactions, built on Firebase for scalability.

If you want to test locally follow this guide
# QConnect - MVGR: Setup and Installation Guide

To get the project running locally, you need to set up both the **Frontend (Next.js)** and the **Backend (Firebase)** environments. Follow these instructions to install all necessary dependencies.

---

## 🛠 Tech Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
* **Backend:** Firebase Auth, Firestore, Cloud Functions
* **Hosting:** Netlify (Frontend), Firebase (Backend)

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

* **Node.js** (LTS version)
* **npm** or **yarn**
* **Firebase CLI**: Install globally using:
```bash
npm install -g firebase-tools

```



---

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Ch-Likhita/QConnect_MVGR
cd QConnect_MVGR

```

### 2. Install Frontend Dependencies

The root directory contains the Next.js application.

```bash
npm install

```

**Key dependencies installed:**

* `next`, `react`, `react-dom`
* `firebase` (Client SDK)
* `typescript`, `tailwindcss`, `postcss`, `autoprefixer`
* `lucide-react` (for icons)

### 3. Install Backend Dependencies (Cloud Functions)

The backend logic resides in the `functions` folder. You must install dependencies separately here.

```bash
cd functions
npm install
cd ..

```

**Key dependencies installed:**

* `firebase-functions`
* `firebase-admin`
* `typescript`

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the **root directory** and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

```

### Firebase Login

Authenticate your CLI to link the project to your Firebase account:

```bash
firebase login
firebase use --add

```

---

## 💻 Running the Project

### Start Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the application.

### Start Firebase Emulators (Optional)

To test Cloud Functions and Firestore locally:

```bash
firebase emulators:start

```

---

## 🛠 Common Fixes & Maintenance

* **Clear Cache:** `rm -rf .next`
* **Refresh Dependencies:** `rm -rf node_modules && npm install`
* **Linting:** `npm run lint`
