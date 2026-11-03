export interface RfpMilestone {
  title: string;
  percentage: number;
  amountUsd: number;
  description: string;
  payoutHours: number;
}

export interface AgencyRfp {
  id: string;
  clientName: string;
  clientLogo: string;
  clientLocation: string;
  clientFunding: string;
  projectTitle: string;
  category: 'smart-contracts' | 'security-audits' | 'fullstack-mvp' | 'tokenomics-growth' | 'zk-infra';
  categoryLabel: string;
  budgetUsd: number;
  budgetFormatted: string;
  escrowStatus: '100% Locked' | 'Pending Milestone 1' | 'Funded in Vault';
  escrowAddress: string;
  timeline: string;
  urgency: 'HIGH' | 'NORMAL' | 'CRITICAL';
  tags: string[];
  techStack: string[];
  description: string;
  scopeBreakdown: string[];
  authenticitySignals: {
    delawareCorp: boolean;
    leadVcFunded: string;
    verifiedGitHub: boolean;
    escrowProof: string;
  };
  milestones: RfpMilestone[];
  bidsCount: number;
  featured: boolean;
  postedAt: string;
}

export const AGENCY_RFPS: AgencyRfp[] = [
  {
    id: "rfp_fasqon_smart_contracts",
    clientName: "Fasqon Fintech",
    clientLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    clientLocation: "London, UK (Remote)",
    clientFunding: "$2.5M Seed Round (Polychain Lead)",
    projectTitle: "Cross-Chain SEPA-to-USDC Smart Settlement Architecture",
    category: "smart-contracts",
    categoryLabel: "Smart Contracts & ZK",
    budgetUsd: 45000,
    budgetFormatted: "$45,000 USDC",
    escrowStatus: "100% Locked",
    escrowAddress: "0x7F2a...94E1 (SmartVault v2)",
    timeline: "4 Weeks",
    urgency: "HIGH",
    tags: ["Solidity", "ERC-4337", "ZK Proofs", "SEPA Instant"],
    techStack: ["Solidity 0.8.24", "Foundry", "OpenZeppelin", "Chainlink CCIP"],
    description: "Architect and implement audited non-custodial smart contracts for fiat-to-crypto programmatic clearing. Must include automated slippage guard, gas-sponsored relays via ERC-4337, and multi-sig emergency circuit breakers.",
    scopeBreakdown: [
      "ERC-4337 Account Abstraction paymaster and bundler integration",
      "Chainlink price feed oracle aggregator with heartbeat failovers",
      "Formal verification test suites with Foundry (>98% branch coverage)",
      "Multi-sig timelock treasury controls for institutional liquidity"
    ],
    authenticitySignals: {
      delawareCorp: true,
      leadVcFunded: "Polychain Capital & YC W24",
      verifiedGitHub: true,
      escrowProof: "100% Pre-Funded into Raisequity Escrow Vault #409"
    },
    milestones: [
      {
        title: "Milestone 1: Core Contract Architecture & Foundry Test Harness",
        percentage: 30,
        amountUsd: 13500,
        description: "Delivering core protocol contracts with complete mock integration tests and gas benchmark report.",
        payoutHours: 48
      },
      {
        title: "Milestone 2: Sepolia / Arbitrum Sepolia Testnet Deployment",
        percentage: 40,
        amountUsd: 18000,
        description: "Deploying contracts to public testnets with functional account abstraction sponsor relays and frontend ABI wrappers.",
        payoutHours: 48
      },
      {
        title: "Milestone 3: Security Remediation & Mainnet Deployment",
        percentage: 30,
        amountUsd: 13500,
        description: "Remediating all third-party audit findings, finalizing deployment scripts, and multi-sig ownership transfer.",
        payoutHours: 48
      }
    ],
    bidsCount: 3,
    featured: true,
    postedAt: "2h ago"
  },
  {
    id: "rfp_secantx_audit",
    clientName: "SecantX Protocol",
    clientLogo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80",
    clientLocation: "San Francisco, CA",
    clientFunding: "$2.2M Seed Active ($500k Committed)",
    projectTitle: "Comprehensive Rust/Wasm & Circom ZK Audit",
    category: "security-audits",
    categoryLabel: "Security & Audits",
    budgetUsd: 38000,
    budgetFormatted: "$38,000 USD",
    escrowStatus: "100% Locked",
    escrowAddress: "0x3D1c...62B8 (SmartVault v2)",
    timeline: "2 Weeks",
    urgency: "CRITICAL",
    tags: ["Circom", "Rust", "Zero Knowledge", "ZK-Rollup"],
    techStack: ["Circom 2.1", "Rust", "Halo2", "SnarkJS"],
    description: "Full cryptographic audit of 4 core zero-knowledge circuit constraints and on-chain verifier contracts. The scope includes soundness analysis, under-constrained signal detection, and side-channel vulnerability checks.",
    scopeBreakdown: [
      "Mathematical circuit validation and constraint completeness proof",
      "Fuzz testing and boundary value testing on on-chain verifier",
      "Executive audit report suitable for institutional venture diligence",
      "Live 1-on-1 remediation engineering session with founding team"
    ],
    authenticitySignals: {
      delawareCorp: true,
      leadVcFunded: "Alliance DAO Cohort #12",
      verifiedGitHub: true,
      escrowProof: "100% Pre-Funded into Raisequity Escrow Vault #412"
    },
    milestones: [
      {
        title: "Milestone 1: Preliminary Findings & Vulnerability Matrix",
        percentage: 50,
        amountUsd: 19000,
        description: "Initial vulnerability report classifying Critical, High, Medium, and Low severity items.",
        payoutHours: 48
      },
      {
        title: "Milestone 2: Fix Verification & Final Public Certificate",
        percentage: 50,
        amountUsd: 19000,
        description: "Re-testing of patched circuits and issuance of signed cryptographic audit certification.",
        payoutHours: 48
      }
    ],
    bidsCount: 5,
    featured: true,
    postedAt: "5h ago"
  },
  {
    id: "rfp_neurochain_mvp",
    clientName: "NeuroChain AI",
    clientLogo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80",
    clientLocation: "New York, NY",
    clientFunding: "$1.5M Seed @ $7.5M Cap",
    projectTitle: "Institutional Trading & Agent Orchestration Frontend",
    category: "fullstack-mvp",
    categoryLabel: "Full-Stack MVP",
    budgetUsd: 28000,
    budgetFormatted: "$28,000 USD",
    escrowStatus: "100% Locked",
    escrowAddress: "0x89B4...F412 (SmartVault v2)",
    timeline: "3 Weeks",
    urgency: "HIGH",
    tags: ["React 19", "Tailwind CSS", "WebSocket", "Web3Modal"],
    techStack: ["Next.js 15", "Wagmi v2", "Viem", "TailwindCSS v4", "TanStack Query"],
    description: "Build an ultra-responsive, institutional financial analytics dashboard displaying real-time agent execution telemetry, on-chain order books, and sub-second chart streaming.",
    scopeBreakdown: [
      "Pixel-perfect implementation of Dark/Light Institutional Design System",
      "WebSocket streaming connection for sub-100ms tick-by-tick market feeds",
      "Multi-wallet connectivity (Privy, Coinbase Wallet, MetaMask)",
      "High-density responsive data grid with sorting, filtering, and CSV export"
    ],
    authenticitySignals: {
      delawareCorp: true,
      leadVcFunded: "Ex-DeepMind Team & YC W24",
      verifiedGitHub: true,
      escrowProof: "100% Pre-Funded into Raisequity Escrow Vault #398"
    },
    milestones: [
      {
        title: "Milestone 1: Design System Primitives & WebSocket Client",
        percentage: 40,
        amountUsd: 11200,
        description: "Core UI layout, component primitives, responsive shell, and live WebSocket pipeline.",
        payoutHours: 48
      },
      {
        title: "Milestone 2: Wallet Signing & Production Delivery",
        percentage: 60,
        amountUsd: 16800,
        description: "Full end-to-end wallet transactions, telemetry graphs, and Vercel production deployment.",
        payoutHours: 48
      }
    ],
    bidsCount: 2,
    featured: false,
    postedAt: "8h ago"
  },
  {
    id: "rfp_hyperscale_tokenomics",
    clientName: "HyperScale DB",
    clientLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80",
    clientLocation: "Austin, TX",
    clientFunding: "$2.0M Seed Round Active",
    projectTitle: "Node Operator Incentives & Token Economic Modeling",
    category: "tokenomics-growth",
    categoryLabel: "Tokenomics & Growth",
    budgetUsd: 22000,
    budgetFormatted: "$22,000 USD",
    escrowStatus: "100% Locked",
    escrowAddress: "0x12A9...007C (SmartVault v2)",
    timeline: "2 Weeks",
    urgency: "NORMAL",
    tags: ["Tokenomics", "Staking", "Math Modeling", "Machinations"],
    techStack: ["Python", "CadCAD", "Machinations.io", "Monte Carlo Simulation"],
    description: "Design and simulate dynamic fee distribution and slashing conditions for 5,000+ decentralized vector node operators. Produce institutional slide deck for tier-1 crypto venture funds.",
    scopeBreakdown: [
      "Dynamic staking emission and deflationary burning curve formulation",
      "10,000-run Monte Carlo stress tests modeling network attacks and flash-crashes",
      "Executive 15-page tokenomics paper with LaTeX formula appendices",
      "Token distribution cap-table simulator with vesting schedules"
    ],
    authenticitySignals: {
      delawareCorp: true,
      leadVcFunded: "Framework Ventures Seed Lead",
      verifiedGitHub: true,
      escrowProof: "100% Pre-Funded into Raisequity Escrow Vault #425"
    },
    milestones: [
      {
        title: "Milestone 1: Mathematical Model & Simulation Engine",
        percentage: 50,
        amountUsd: 11000,
        description: "Delivering CadCAD simulation scripts and equilibrium parameters.",
        payoutHours: 48
      },
      {
        title: "Milestone 2: Final Whitepaper & Cap-Table Model",
        percentage: 50,
        amountUsd: 11000,
        description: "Formatted PDF whitepaper and interactive Excel/Google Sheets cap table model.",
        payoutHours: 48
      }
    ],
    bidsCount: 4,
    featured: false,
    postedAt: "1d ago"
  },
  {
    id: "rfp_opensign_zk",
    clientName: "OpenSign Protocol",
    clientLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80",
    clientLocation: "London, UK",
    clientFunding: "$1.2M Pre-Seed ($80k Angel Anchor)",
    projectTitle: "Decentralized Document Hash Attestation Relay",
    category: "zk-infra",
    categoryLabel: "Smart Contracts & ZK",
    budgetUsd: 18000,
    budgetFormatted: "$18,000 USDC",
    escrowStatus: "100% Locked",
    escrowAddress: "0x63E1...771B (SmartVault v2)",
    timeline: "2 Weeks",
    urgency: "NORMAL",
    tags: ["ZK-SNARK", "IPFS", "Ethereum", "Signatures"],
    techStack: ["SnarkJS", "IPFS / Filecoin", "Solidity", "TypeScript"],
    description: "Build an EVM smart contract and relay bot to anchor SHA-256 document signatures to Base and Arbitrum with ZK privacy masking.",
    scopeBreakdown: [
      "Smart contract registry for cryptographic document commitments",
      "Merkle tree proof verification for anonymous signature validity",
      "SDK npm package for Web3 developers to anchor SAFEs in 1 line of code",
      "Integration tests with automated gas fee optimization"
    ],
    authenticitySignals: {
      delawareCorp: true,
      leadVcFunded: "Tier-1 Angel Syndicate",
      verifiedGitHub: true,
      escrowProof: "100% Pre-Funded into Raisequity Escrow Vault #431"
    },
    milestones: [
      {
        title: "Milestone 1: Merkle Anchor Contract & Testnet Tests",
        percentage: 50,
        amountUsd: 9000,
        description: "Fully tested registry contract deployed on Base Sepolia.",
        payoutHours: 48
      },
      {
        title: "Milestone 2: TypeScript SDK & Documentation",
        percentage: 50,
        amountUsd: 9000,
        description: "Published npm package with full TypeDoc documentation and example app.",
        payoutHours: 48
      }
    ],
    bidsCount: 1,
    featured: false,
    postedAt: "2d ago"
  }
];

