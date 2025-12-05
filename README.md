# 🚀 Xandeum pNode Explorer

A **Stakewiz-style** analytics dashboard for monitoring the Xandeum pNode storage network. Built for the [Superteam Earn Bounty](https://earn.superteam.fun/listings/bounties/develop-analytics-platform-for-xandeum-pnodes).

![Dashboard Preview](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)

---

## ✨ Features

### 📊 Dashboard Overview
- **Real-time Stats Cards** - Total pNodes, Active Nodes, Total Storage, Average Uptime
- **Auto-refresh** - Data polling every 30 seconds via TanStack Query
- **Network Selector** - Switch between Mainnet, Devnet, and Testnet

### 🗺️ Global Network Map
- **Interactive Leaflet Map** - Visualize pNode geographic distribution
- **Color-coded Markers** - Green (active), Yellow (degraded), Red (inactive)
- **Click to View** - Click any marker to open node details

### 📋 pNode Directory Table
- **Sortable Columns** - Pubkey, Version, Status, Uptime, Storage, Last Seen
- **Copy Pubkey** - One-click copy to clipboard
- **Status Badges** - Visual status indicators with pulse animations
- **Uptime Bars** - Visual progress bars for node uptime
- **Location Display** - City and country for each node

### 🔍 Node Detail Modal
- **Full Node Info** - Network addresses (Gossip, RPC, TPU)
- **Storage Metrics** - Capacity, used, available with progress visualization
- **Performance Data** - Uptime, performance score, response time
- **Staking Info** - XAND staked, delegated stake, commission
- **Raw JSON View** - Toggle to see complete node data

### ⚠️ Error Handling
- **Graceful Fallback** - Mock data when RPC is unavailable
- **Error Alerts** - Clear error messages with retry functionality
- **Loading States** - Skeleton loaders for all components

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | Framework (App Router) |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Shadcn UI** | Radix-based components |
| **TanStack Query** | Data fetching & caching |
| **Lucide React** | Icons |
| **React Leaflet** | Map visualization |

---

## 🎨 Design

- **Dark Mode** - Deep blacks (#0a0a0f) with purple/green accents
- **Cyberpunk Aesthetic** - Glow effects, gradients, glassmorphism
- **High Data Density** - Stakewiz-inspired readability
- **Responsive** - Mobile-first design

---

## 🚀 Quick Start

```bash
# Clone the repository
cd xandeum-pnode-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Cyberpunk theme & animations
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Dashboard entry point
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── dashboard.tsx    # Main dashboard container
│   ├── dashboard-header.tsx
│   ├── stats-card.tsx
│   ├── node-table.tsx
│   ├── node-detail-modal.tsx
│   ├── network-map.tsx
│   └── providers.tsx    # React Query provider
├── hooks/
│   └── usePNodes.ts     # Data fetching hooks
└── lib/
    ├── types.ts         # TypeScript interfaces
    ├── xandeumRpc.ts    # RPC client
    └── utils.ts         # Utility functions
```

---

## 🔌 API Integration

The dashboard is designed to work with Xandeum's pRPC endpoints. Currently uses mock data with fallback.

### RPC Endpoints
```typescript
const NETWORK_CONFIGS = {
  mainnet: 'https://rpc.xandeum.network',
  devnet: 'https://api.devnet.xandeum.com:8899',
  testnet: 'https://api.testnet.xandeum.com:8899',
};
```

### Customizing for Production

Update `src/lib/xandeumRpc.ts` with actual pRPC methods:

```typescript
// Replace the getClusterNodes method with actual Xandeum pRPC call
async getClusterNodes(): Promise<GetClusterNodesResponse> {
  const result = await rpcRequest(
    this.endpoint,
    'xandeum_getProviderNodes', // Replace with actual method
    []
  );
  // Transform response to match PNode interface
}
```

---

## 📊 Data Types

```typescript
interface PNode {
  pubkey: string;
  gossip: string | null;
  tpu: string | null;
  rpc: string | null;
  version: string | null;
  status: 'active' | 'inactive' | 'degraded';
  storageCapacity?: number;
  storageUsed?: number;
  uptime?: number;
  performanceScore?: number;
  location?: {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  };
}
```

---

## 🔧 Configuration

### Environment Variables (optional)
```env
NEXT_PUBLIC_DEFAULT_CLUSTER=devnet
NEXT_PUBLIC_POLLING_INTERVAL=30000
```

---

## 📸 Screenshots

The dashboard features:
1. **Header** - Logo, network selector, refresh button
2. **Stats Cards** - 4 summary metrics with trends
3. **Network Map** - Global node distribution
4. **Node Table** - Sortable, searchable directory
5. **Detail Modal** - Full node information

---

## 🏆 Bounty Submission

This project was built for the **"Develop Analytics Platform for Xandeum pNodes"** bounty on Superteam Earn.

### Requirements Met:
- ✅ Dashboard Home with summary cards
- ✅ pNode list with sortable columns
- ✅ Detail view with full JSON
- ✅ Error handling for RPC failures
- ✅ Network map visualization
- ✅ Dark mode cyberpunk aesthetic

---

## 📝 License

MIT License - Feel free to use and modify.

---

## 🔗 Links

- [Xandeum Network](https://xandeum.network)
- [Xandeum Docs](https://docs.xandeum.network)
- [Superteam Earn](https://earn.superteam.fun)

---

Built with 💜 for the Xandeum ecosystem
