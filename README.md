# 💰 Budget Tracker

A personal finance management application that automatically tracks your spending by parsing bank transaction emails. Built with Next.js, SQLite, and designed as a PWA for seamless desktop and mobile experience.

## ✨ Features

- **Automated Transaction Import**: Automatically parse bank transaction emails via Google Apps Script webhooks
- **Budget Goals**: Set monthly spending limits by category and track progress
- **Dashboard Analytics**: Visual charts and breakdowns of your spending patterns
- **Transaction Management**: Add, edit, and delete transactions manually
- **Category Tracking**: Smart auto-categorization of expenses
- **PWA Support**: Install as an app on macOS, iOS, and other platforms
- **Dark Mode**: Eye-friendly dark theme
- **Responsive Design**: Works beautifully on desktop and mobile

## 🏗️ Architecture

This application uses a multi-layer architecture:

1. **Gmail**: Receives bank transaction emails
2. **Google Apps Script**: Monitors emails and sends webhooks (see setup below)
3. **Next.js Backend**: Processes webhooks and serves APIs
4. **SQLite Database**: Stores transactions and goals
5. **Next.js Frontend**: Beautiful React UI with charts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Vercel account (for hosting)
- Gmail account with bank transaction emails

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd finance
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Deployment to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Deploy (Vercel will auto-detect Next.js)
4. Note your deployment URL (e.g., `https://your-app.vercel.app`)

## 📧 Google Apps Script Setup (Email Automation)

To automatically import transactions from bank emails:

1. Open [script.google.com](https://script.google.com) and create a new project

2. Paste this code:
```javascript
function processTransactions() {
  const labelName = "Transactions"; // Gmail label to monitor
  const webhookUrl = "https://YOUR-APP.vercel.app/api/webhooks/transactions";
  
  const label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    Logger.log("Label not found");
    return;
  }
  
  const threads = label.getThreads(0, 50); // Get up to 50 threads
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    
    for (const message of messages) {
      const from = message.getFrom();
      const subject = message.getSubject();
      const body = message.getPlainBody();
      const date = message.getDate();
      
      // Send to webhook
      const response = UrlFetchApp.fetch(webhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({
          from: from,
          subject: subject,
          body: body,
          date: date.toISOString(),
        }),
      });
      
      Logger.log(`Sent: ${subject} - ${response.getResponseCode()}`);
    }
    
    // Remove label to prevent reprocessing
    thread.removeLabel(label);
  }
}

// Create a time-based trigger (runs every 5 minutes)
function createTrigger() {
  ScriptApp.newTrigger("processTransactions")
    .timeBased()
    .everyMinutes(5)
    .create();
}

function testScript() {
  processTransactions();
}
```

3. Replace `YOUR-APP.vercel.app` with your Vercel deployment URL

4. Run `createTrigger()` once to set up the 5-minute timer

5. In Gmail, create a filter:
   - Subject: "Transaction Alert" (or similar)
   - Apply label: "Transactions"
   - Optional: Filter by sender (e.g., `from:(hdfc OR icici OR axis)`)

6. Test with `testScript()` and check execution logs

## 🗄️ Database

The app uses SQLite stored at `.data/budget.db`. The schema is automatically initialized on first run:

- **transactions**: All expense records
- **goals**: Monthly budget goals by category
- **categories**: Default category list

## 📊 API Endpoints

### Transactions
- `GET /api/transactions` - List all transactions (optional query: `?from=YYYY-MM-DD&to=YYYY-MM-DD&category=Category&limit=N`)
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/[id]` - Get single transaction
- `PATCH /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Goals
- `GET /api/goals?month=YYYY-MM` - Get goals for a month
- `POST /api/goals` - Create a new goal
- `GET /api/goals/[id]` - Get single goal
- `PATCH /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

### Stats
- `GET /api/stats?month=YYYY-MM` - Get dashboard statistics

### Webhooks
- `POST /api/webhooks/transactions` - Receive transaction emails from Google Apps Script

## 🎨 PWA Icons Setup

The app includes PWA manifest and icons configuration. To generate icons:

1. Create a simple budget/wallet icon (PNG format)
2. Generate sizes: 192x192, 512x512 (regular and maskable)
3. Place them in `public/icons/`:
   - `icon-192.png`
   - `icon-512.png`
   - `icon-192-maskable.png`
   - `icon-512-maskable.png`

You can use tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## 🛠️ Development

### Project Structure

```
finance/
├── app/
│   ├── (main)/           # Main app pages with navigation
│   │   ├── dashboard/    # Dashboard with stats
│   │   ├── transactions/ # Transaction list & management
│   │   └── goals/        # Budget goals
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── transactions/     # Transaction components
│   ├── goals/            # Goal components
│   └── Navigation.tsx    # Main navigation
├── lib/
│   ├── db/               # Database & schema
│   ├── email/            # Email parsing logic
│   └── utils/            # Utility functions
└── public/
    ├── manifest.json     # PWA manifest
    └── icons/            # PWA icons
```

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **Deployment**: Vercel

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Check TypeScript types

## 📝 Supported Banks

The email parser currently supports patterns for:
- HDFC Bank
- ICICI Bank
- Axis Bank
- Generic Indian bank format

To add more banks, edit `lib/email/parser.ts` and add pattern matching logic.

## 🐛 Troubleshooting

### Transactions not appearing
1. Check Google Apps Script execution logs
2. Verify webhook URL is correct in Apps Script
3. Check Vercel function logs
4. Ensure Gmail filter is applying the "Transactions" label

### Database issues
1. Ensure `.data/` directory exists and is writable
2. On Vercel, the database persists in the `.data` folder
3. Check `lib/db/db.ts` for schema initialization

### PWA not installing
1. Ensure HTTPS is enabled (required for PWA)
2. Check `public/manifest.json` configuration
3. Verify icons exist in `public/icons/`

## 📄 License

MIT License - feel free to use this for personal projects!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 🙏 Acknowledgments

Built with love using Next.js, SQLite, and the Google Apps Script ecosystem.
