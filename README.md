# 🧭 Red_v: A Visual Blockchain Explorer for Solana

---

## 📌 Problem Statement

Solana is fast, cheap, and packed with on-chain activity — but trying to make sense of all that data? Painful. Most explorers dump raw data with zero context, and you’re left piecing together what happened, who interacted with who, and where the funds moved — like a detective with no map.

---

## 🔍 What is Red_v?

Red_v is a simple but powerful tool to help you **visually track wallets, protocols, transactions, and interactions** on Solana — in a way that actually makes sense.

Most blockchain explorers feel like spreadsheets from hell. Red_v is different. It’s an **interactive, intuitive map of on-chain activity**, designed for on-chain sleuths, analysts, and degens who want to follow the money, trace protocol behavior, or just stalk interesting wallets for fun.

Pick a wallet or a protocol and watch its connections light up — see who it’s talking to, how funds are flowing, what other contracts are involved, and when. We turn raw blockchain data into digestible, explorable visuals that help answer:

- ✅ Wallet balances and token holdings  
- 📈 Transaction history and patterns  
- 🪙 Token distributions and holder relationships  
- 🧩 Program interactions and protocol usage  
- 🧠 Network connections between addresses  

---

## 🛠 Our Exploration Toolkit

To visualize complex blockchain data into meaningful insights, we've integrated multiple APIs and frameworks:

### 📚 Documentation
### 🔗 Data Sources
Red_v integrates multiple APIs to collect and display rich blockchain insights:

- **Helius** — The backbone, fetching transactions, balances, and name resolution.
- **Jupiter** and **CoinGecko** — Token metadata and price information.
- **BubbleMaps iframe** — Visualizes token holder distribution.
- **React Query** — Manages API calls and caching efficiently.

These APIs power multi-dimensional views across the app, delivering deeper, more complete insights.

---

## ⚙️ Methodology for Data Aggregation

We designed Red_v to pull raw data from **reliable, high-performance endpoints**, then organize and present it with clarity.

- **Helius** for consolidated blockchain data
- **Jupiter & CoinGecko** for token price and metadata
- **BubbleMaps** to highlight sybil clusters, whale concentration, and decentralization

---

## 🏗 Underlying Architecture

Red_v is a fully web-based application built with modern tools:

- **Frontend Framework**: `Next.js` (SSR + routing)
- **Data Layer**: `React Query` (data fetching, caching)
- **Visualizations**:
  - `React Flow`: For network-style visual graphs
  - `BubbleMaps`: For token concentration visuals
- **UI Layer**: `TailwindCSS` (fast, responsive styling)

This modular architecture makes it easy to **scale, extend, and maintain**.

---

## 🧠 Project Overview

### 🧩 Design Rationale

Most blockchain explorers are clunky and overwhelming. We built Red_v to change that:

- Human-readable layouts
- Fast scanning and deep dives
- Visual tracing of relationships between wallets, tokens, protocols

---

## 🌟 Key Features

- **Wallet Explorer**: Check wallet activity, balances, and patterns
- **Enhanced Wallet View**: Protocol detection + name service
- **Token Explorer**: Stats, charts, holders, and market data
- **BubbleMaps**: Interactive token holder graphs
- **Blockchain Graph View**: Live wallet/protocol relationship maps
- **Transaction View**: Status, transfer summaries, entity tagging

---

## 🔍 Potential Impact for On-Chain Investigation

Red_v empowers users to:

- 🔁 Follow the money trail
- 🕵️ Understand wallet behavior over time
- 🐋 Investigate token holder concentration
- 🤖 Visualize protocol interactions, MEV, and scam patterns

By converting raw Solana data into **clean, visual stories**, Red_v makes the invisible visible.

---

## 💡 Use Cases

- **Newcomers**: Understand wallets and tokens in the ecosystem
- **Developers**: Analyze protocol usage and transaction trends
- **Researchers**: Track distributions, relationships, and activity
- **Traders**: Spot movements, patterns, and token flow
- **Project Teams**: Showcase transparency and community health
- **Security Experts**: Detect suspicious activity and anomalies

---

## 🔮 Future Directions

We're leveling up Red_v with:

- 📡 **Real-time updates**
- 📊 **Advanced analytics**
- 📅 **Historical data comparisons**
- 🔔 **Custom alerts**
- 🔁 **Enhanced visualizations**
- 📱 **Mobile optimization**
- 🧠 **Egeria-Lite Integration**: ML-based rug/scam detection trained on 2,000+ tokens

---

## 🙏 Attributions

Thanks to the open-source tools that power Red_v:

- `Next.js` – App performance and routing
- `React Flow` – Wallet + protocol graph visualization
- `TailwindCSS` – Consistent UI/UX
- `React Query` – Caching and async data fetching
- `Headless UI` – Accessible UI components
- `Heroicons` – Iconography
- `React Toastify` – Toast notifications
- `date-fns` – Time utilities
- `@solana/web3.js` – Solana blockchain interface

---

## 🔄 Deployment Instructions

Want to try Red_v locally? Follow these steps:

```bash
# Step 1: Clone the repository
git clone https://github.com/CHAKRADHAR98/Red_v.git
cd Red_v

# Step 2: Create an env file
touch .env.local

# Step 3: Add the following keys to your .env.local
HELIUS_API_KEY=your-api-key
NEXT_PUBLIC_HELIUS_API_KEY=your-api-key
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your-api-key

# Step 4: Install dependencies
npm install

# Step 5: Build the application
npm run build

# Step 6: Start the server
npm start

# For development mode
npm run dev
