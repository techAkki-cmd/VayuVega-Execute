# 🚀 Project Setup

## Frontend Setup

This frontend is built using [Vite](https://vitejs.dev/) and React. Follow the steps below to set up the project locally.

### 📦 Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)

### 📥 Clone the Repository
```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 📌 Install Dependencies
```sh
npm install
```

### 🏃 Start Development Server
```sh
npm run dev
```
By default, the app will be available at `http://localhost:5173/`.

### 🛠 Environment Variables
Create a `.env` file in the root directory and add your environment variables:
```env
    VITE_SERVER_URL="http://localhost:3000"
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
```


