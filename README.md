# 💰 MoneyManage

A beautiful, fully responsive **personal finance web app** that works on both desktop and mobile. Track your income and expenses, manage your salary, and keep tabs on money you've borrowed and lent — all in one clean dashboard.

> Your data is stored locally in your browser (localStorage). Nothing is sent to any server, so it works offline and stays private.

## ✨ Features

- **Dashboard** — net worth, income vs. expense trends (6-month chart), spending breakdown by category, and recent activity.
- **Transactions** — log income & expenses with categories, notes, and dates. Filter by type.
- **Salary** — record one-off or recurring monthly salary; each entry is also reflected as income.
- **Borrowings** — track money you owe, record repayments, and see what's outstanding or overdue.
- **Lendings** — track money others owe you, with the same repayment tracking.
- **Light & dark themes** — toggle any time; your preference is saved.
- **Multi-currency** — USD, EUR, GBP, LKR, INR, and more, with locale-aware formatting.
- **Backup & restore** — export your data to a JSON file and import it on any device.
- **Responsive** — a sidebar on desktop and a bottom navigation bar on mobile.

## 🛠️ Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for fast builds
- [React Router](https://reactrouter.com/) (HashRouter — works on GitHub Pages)
- [Recharts](https://recharts.org/) for charts

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Create a production build
npm run build

# Preview the production build locally
npm run preview
```

## 🌐 Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the app automatically.

1. Push to the `main` branch (or merge a PR into it).
2. In your repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. The workflow will publish your site to:
   `https://<your-username>.github.io/moneymanage_glp5/`

> **Note:** The Vite `base` is set to `/moneymanage_glp5/` in `vite.config.ts` to match the repository name. If you rename the repository, update `base` to match.

## 📁 Project Structure

```
src/
├── components/   # Layout, Modal, StatCard, DebtPage, icons, shared UI
├── context/      # DataContext — localStorage-backed app state
├── pages/        # Dashboard, Transactions, Salary, Borrowings, Lendings, Settings
├── utils/        # formatting & financial calculations
├── types.ts      # domain models
├── App.tsx       # routes
├── main.tsx      # entry point
└── index.css     # design system & responsive styles
```

## 🔒 Privacy

All data lives in your browser's `localStorage` under the key `moneymanage.data.v1`. Clearing your browser data or using the **Reset all data** button will erase it, so use **Export backup** to keep a copy.
