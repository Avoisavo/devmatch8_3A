# 🧠 Chain-Of-Thoughts

<h4 align="center">
  <a href="#how-our-project-works">How It Works</a> |
  <a href="#system-architecture-high-level-overview">Architecture</a> |
  <a href="#tech-stack-overview-%F0%9F%9B%A0%EF%B8%8F">Tech Stack</a> |
  <a href="#how-to-run-this-project-%F0%9F%9A%80">Getting Started</a>
</h4>

🚀 **Chain-Of-Thoughts** is a decentralized AI-powered chat summary platform that leverages **The Graph Protocol** for indexing blockchain data and **Oasis Sapphire** for privacy-preserving smart contracts. Store, organize, and retrieve your chat summaries with full privacy and transparency.

⚡ **Key Features:**
- 🔐 **Privacy-First**: Chat summaries stored securely on Oasis Sapphire with confidential smart contracts
- 📊 **Decentralized Indexing**: Real-time data querying powered by The Graph Protocol
- 🎯 **Smart Organization**: Calendar-based UI for easy summary navigation
- 💰 **Subscription Model**: ROSE token-based subscription system
- 🌟 **Modern UI**: Beautiful, responsive interface with interactive animations

---

## How Our Project Works

**Where mental wellness meets uncompromising privacy — your confidential AI companion, secured by Oasis Sapphire.**

- **1) Connect & (Optionally) Subscribe**
  - Users connect their wallet in the Next.js app and can subscribe via `SubscriptionContract.subscribe()` to unlock features.
  - Contract: `packages/hardhat/contracts/SubscriptionContract.sol`
- **2) AI Generates a Summary**
  - Users chat with the AI UI (`packages/nextjs/components/llama`) and receive a structured summary.
- Use ROFL red pills. https://explorer.oasis.io/testnet/sapphire/rofl/app/rofl1qpjkkh872rnewkmj9zusyevwhx5gr88qjv2443v4?q=rofl1qpjkkh872rnewkmj9zusyevwhx5gr88qjv2443v4

- **3) Client-side Encryption**
  - Before saving, summaries are encrypted locally in the browser using AES-GCM derived from a signed message.
  - Hook: `packages/nextjs/hooks/useSummaryCrypto.ts` (`encrypt`, `decrypt`).
- **4) Confidential On-chain Storage (Sapphire)**
  - Encrypted summaries are saved on-chain via `SummaryVault.saveSummary(id, content, title)`.
  - Contract: `packages/hardhat/contracts/SummaryVault.sol` emits `SummarySaved(user, id, title, timestamp)` for public indexing.
- **5) Subgraph Indexing for Fast Metadata Queries**
  - A subgraph listens to `SummarySaved` and stores only metadata (`user`, `summaryId`, `title`, `timestamp`).
  - Subgraph: `subgraphs/summary-vault` with `src/mapping.ts` handler.
- **6) Frontend Retrieval**
  - Metadata: `packages/nextjs/hooks/useSubgraphSummaries.ts` queries the subgraph.
  - Content: `packages/nextjs/hooks/useSummaryContent.ts` reads `getSummary(id)` and decrypts locally when needed.
- **7) Calendar UI**
  - Summaries are displayed in a calendar-first UI at `packages/nextjs/app/chat-summaries/page.tsx`.

---

## System Architecture High-Level Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App]
        B[React Components]
        C[Wagmi + Viem Hooks]
    end

    subgraph "Blockchain Layer"
        D[Oasis Sapphire Paratime (confidential EVM)]
        E[SummaryVault Contract]
        F[Subscription Contract]
    end

    subgraph "Indexing Layer"
        G[Graph Node (Docker)]
        H[Summary Vault Subgraph]
        I[GraphQL API]
    end

    subgraph "AI Layer"
        J[Ollama/LLaMA]
        K[Chat Processing]
        L[Summary Generation]
    end

    A --> C
    C --> E
    C --> F
    E --> G
    G --> H
    H --> I
    I --> A
    J --> K
    K --> L
    L --> A
```

### 🔄 Data Flow
- **Frontend** (Next.js/React) → **Encrypts** summary locally → **Saves** to `SummaryVault` (Sapphire)
- `SummaryVault` → **Emits** `SummarySaved` → **Subgraph** indexes metadata
- UI → **Queries** subgraph for metadata → **Reads** full content via `getSummary(id)` when needed → **Decrypts** client-side

---

## Tech Stack Overview 🛠️

- **Frontend**
  - **Next.js 15**, **React 19**
  - **Tailwind CSS + DaisyUI**, **Framer Motion**, **Lottie**
  - **Wagmi v2** + **Viem 2.x**, **@tanstack/react-query**
- **Blockchain**
  - **Solidity ^0.8.20**, **Hardhat**
  - **Oasis Sapphire** SDKs: `@oasisprotocol/sapphire-*`
- **Indexing**
  - **The Graph** (Graph Node via Docker), Subgraph (AssemblyScript), GraphQL API
- **AI**
  - **Ollama** with LLaMA models, custom chat UI (`packages/nextjs/components/llama`)
- **Privacy**
  - Client-side encryption via WebCrypto (AES-GCM), Sapphire confidential runtime

---

## How to Run This Project 🚀

### Prerequisites
- Node.js >= 20.18.3, Yarn, Git, Docker (for local Graph Node), Ollama (optional for AI)

### Quick Start

1) Install dependencies
```bash
yarn install
```

2) Start local blockchain and deploy contracts
```bash
# Terminal 1: local chain
yarn chain

# Terminal 2: deploy
yarn deploy
```

3) Start the frontend
```bash
# Terminal 3
yarn start
```

4) Start Graph Node locally (optional but recommended for subgraph)
```bash
# Terminal 4
cd graph_node/docker
docker compose up -d
```

5) Deploy the subgraph (local)
```bash
cd subgraphs/summary-vault
yarn install
yarn codegen
yarn build
yarn create-local
yarn deploy-local
```

6) Configure the frontend to point to your subgraph (if needed)
```bash
# defaults to http://localhost:8000/subgraphs/name/devmatch/summary-vault
# can override via env var
export NEXT_PUBLIC_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/devmatch/summary-vault
```

---

## Important Code Directories 📂

```
devmatch8_3A/
├── packages/
│   ├── hardhat/                      # Smart Contracts
│   │   ├── contracts/
│   │   │   ├── SummaryVault.sol      # Encrypted summary storage + events
│   │   │   └── SubscriptionContract.sol  # ROSE-based subscription
│   │   └── deploy/                   # 00_*, 01_*, 02_* deployment scripts
│   └── nextjs/                       # Frontend (Next.js App Router)
│       ├── app/
│       │   ├── page.tsx              # Landing + chat surface
│       │   └── chat-summaries/       # Calendar UI for summaries
│       ├── components/               # UI components (incl. llama/)
│       ├── hooks/
│       │   ├── useSummaryCrypto.ts   # Client-side AES-GCM encrypt/decrypt
│       │   ├── useSubgraphSummaries.ts # Subgraph metadata fetch
│       │   └── useSummaryContent.ts  # Reads on-chain content via hook
│       └── contracts/deployedContracts.ts # Auto-generated addresses/ABIs
├── subgraphs/
│   └── summary-vault/
│       ├── schema.graphql            # Entity schema (Summary)
│       ├── subgraph.yaml             # Data source + handlers
│       └── src/mapping.ts            # handleSummarySaved
└── graph_node/docker/                # Local Graph Node docker-compose
```

---

## Future Implementations 🚀

- **Trusted AI compute**: Integrate ROFL/TEE-based confidential inference for end-to-end encrypted processing
- **Per-user vaults**: Factory that deploys a dedicated vault per user with owner-only access controls
- **Zero-Knowledge features**: Prove integrity/authorship of summaries without revealing contents
- **Selective sharing**: Permissioned sharing and revocation
- **Enhanced search**: Local full-text search with privacy-preserving indexing
- **Multi-chain**: Expand to Ethereum L2s (Arbitrum/Polygon), with Sapphire as the privacy layer
- **Mobile apps**: iOS/Android clients with local encryption

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **The Graph Subgraph**: [View on Graph Explorer]
- **Smart Contracts**: [View on Oasis Explorer]

## Team
- Tan Zhi Wei
- Mark Chye Wen Soon
- Jeffrey Loo Jia Quan
- Ng Zher Xian






---

<p align="center">
  <strong>Built with ❤️ using The Graph Protocol, Oasis Sapphire, and Scaffold-ETH 2</strong>
</p>
