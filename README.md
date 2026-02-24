# Expenzo - Intelligent Expense Management App

Expenzo is a modern, high-performance financial management application built with **React**, **Vite**, and **Tailwind CSS**. It is designed to provide a seamless user experience across both web and native Android platforms using **Capacitor**.

## 🚀 Key Features

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

### 🤖 AI Financial Assistant
- **Natural Language Interaction**: Chat with an AI assistant to get financial insights.
- **Financial Tips**: Integrated database of professional financial advice and money-saving tips.

### 📈 Advanced Analytics
- **Category Breakdown**: Visualize where your money goes with interactive charts.
- **Spending Spikes**: Sophisticated detection of unusual spending patterns comparing current vs. previous periods.

### 📤 Data Export
- **PDF Reports**: Generate clean, professional PDF summaries of your transactions.
- **CSV Support**: Export data for use in Excel or other spreadsheet software.

## 🛠️ Tech Stack

- **Frontend**: [React 18](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Native Platform**: [Capacitor 6](https://capacitorjs.com/) (Android)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Toasts**: [Sonner](https://sonner.stevenly.me/)

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [NPM](https://www.npmjs.com/)
- [Android Studio](https://developer.android.com/studio) (for native Android builds)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/expenzo.git
   cd expenzo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run for Web Development**:
   ```bash
   npm run dev
   ```

### Android Setup

1. **Sync Capacitor**:
   ```bash
   npx cap sync android
   ```

2. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

3. **Build & Run**: Use the "Run" button in Android Studio to deploy to a device or emulator.

## 📁 Project Structure

```
├── android/            # Native Android project files
├── src/
│   ├── app/
│   │   ├── components/ # Reusable UI components & Shadcn UI
│   │   ├── pages/      # Route-level page components
│   │   ├── utils/      # Business logic (Analytics, Storage, Engine)
│   │   ├── types/      # TypeScript definitions
│   │   ├── App.tsx     # Main App entry and providers
│   │   └── routes.tsx  # Application routing configuration
│   ├── styles/         # Global styles & Tailwind configuration
│   └── main.tsx        # React entry point
├── public/             # Static assets
└── vite.config.ts      # Vite configuration
```

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
