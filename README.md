# Expenzo - Intelligent Expense Management App

Expenzo is a modern, high-performance financial management application built with **React**, **Vite**, and **Tailwind CSS**. It is designed to provide a seamless user experience across both web and native Android platforms using **Capacitor**.

## 🚀 Key Features

### 🤖 AI Voice Assistant (Powered by NVIDIA NIM)
- **Natural Language & Voice Input**: Talk to Expenzo! Speak your expenses and check your budgets naturally. It natively detects **Multi-language Audio** (English, Tamil, Hindi, Malayalam).
- **Text-to-Speech Output**: AI-generated responses are read out loud using Android Native Text-to-Speech (TTS) for hands-free interactions.
- **Deep Financial Context**: The Llama 3.1 model has full context on your dashboard, providing hyper-personalized insights on spending routines and financial health.
- **Proactive AI Nudges**: Expenzo monitors your data daily to send you AI-generated, smart notifications. (e.g., spending spikes, congratulations on savings streaks).

### 🌍 Real-Time Currency Conversion
- **Global Support**: The app seamlessly connects to the **Frankfurter API** to instantly fetch the latest exchange rates.
- **Profile Localization**: Switch your default currency in your User Profile, and your entire dashboard, transactions, and AI advice will convert and adapt immediately.

### 🎯 Global Draggable Action Button (FAB)
- **Omnipresent Access**: Add new transactions from absolutely anywhere in the app with a sleek, free-floating Action Button.
- **Persistent Location**: Drag the button anywhere on the screen—and it automatically remembers its position on your device.
- **Real-Time Reactive UI**: Adding a transaction via the global FAB updates your Dashboard and Transaction list instantly without refreshing the page.

### 📊 Smart Dashboard
- **Real-time Metrics**: Track Net Savings, Total Income, and Total Expenses at a glance.
- **Financial Health Score**: Dynamic algorithm that evaluates your financial status (0-100) and provides categorized feedback.
- **Recent Activity**: Quick view of your latest transactions.

### 💸 Transaction Management
- **Detailed Tracking**: Log income and expenses with categories, descriptions, and custom tags.
- **Receipt Attachments**: Capture and attach receipt photos directly using native camera integration.
- **Search & Filter**: Powerful search capabilities by description, category, or tags.

### 🔄 Recurring Transactions Engine
- **Automated Logging**: Set up daily, weekly, monthly, or yearly recurring transactions.
- **Auto-Generation**: Intelligent engine that checks and generates missed transactions on app initialization.

### 🛡️ Budgeting & Limits
- **Category Budgets**: Set monthly spending limits for different categories.
- **Visual Progress**: Real-time progress bars showing budget consumption.
- **Smart Alerts**: Receive notifications when approaching or exceeding 80% of your budget.

### 📈 Advanced Analytics
- **Category Breakdown**: Visualize where your money goes with interactive charts.
- **Spending Spikes**: Sophisticated detection of unusual spending patterns comparing current vs. previous periods.

### 📤 Data Export
- **PDF Reports**: Generate clean, professional PDF summaries of your transactions in your native currency.
- **CSV Support**: Export data for use in Excel or other spreadsheet software.

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **AI / LLM Integration**: [NVIDIA NIM (Llama 3.1)](https://build.nvidia.com) 
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Native Platform**: [Capacitor 6](https://capacitorjs.com/) (Android)
- **Native Voice Integrations**: `@capacitor-community/speech-recognition`, `@capacitor-community/text-to-speech`
- **Charts**: [Recharts](https://recharts.org/)
- **API Fetching via Proxy**: Vite Dev Server Proxy configured to bypass CORS for clean Web to Mobile development flows.

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [NPM](https://www.npmjs.com/)
- [Android Studio](https://developer.android.com/studio) (for native Android builds)
- **NVIDIA API Key**: (Grab one from [build.nvidia.com](https://build.nvidia.com)) required in your `.env` file.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/expenzo.git
   cd expenzo
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_NVIDIA_API_KEY="your_nvidia_api_key_here"
   ```

3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Run for Web Development**:
   *(Ensure Vite restarts after env changes so the Proxy picks up the API)*
   ```bash
   npm run dev
   ```

### Android Setup

1. **Rebuild the Web Assets**:
    ```bash
    npm run build
    ```

2. **Sync Capacitor**:
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **Build & Run**: Use the "Run" button in Android Studio, or **Build > Build APK** to deploy the smart assistant straight to your physical Android device.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
