# Automation Marketplace MVP

This is the React frontend for the Automation Marketplace.

## 🚨 Prerequisites
**Node.js is required** to run this project. It seems it is not installed on your system.
1. Download and install Node.js from [nodejs.org](https://nodejs.org/).
2. Restart your terminal/computer after installation.

## 🚀 How to Run

1.  **Install Dependencies**:
    Open a terminal in this folder and run:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    - Rename `.env.example` to `.env`.
    - Fill in your Supabase and n8n keys (see `setup_guide.md` in the artifacts).

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    Open the URL shown in the terminal (usually `http://localhost:5173`).

## 📂 Project Structure
- `src/pages`: Key pages (Landing, Client Request, Dashboard).
- `src/services`: Supabase and n8n integration.
- `src/components`: Shared components like Navbar.
- `src/index.css`: Premium Dark Theme styles.
