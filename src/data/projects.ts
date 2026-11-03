export interface Project {
  id: string;
  name: string;
  sector: "DeFi" | "Infrastructure" | "Gaming" | "SocialFi" | "NFT" | "AI" | "RWA" | "Fintech" | "DeSci" | "Real Estate" | "Energy";
  stage: string;
  raiseRange: string;
  oneLiner: string;
  fullDescription: string;
  traction: string;
  problemSolution?: string; 
  teamBackground?: string; 
  keyFeatures?: string[];
  partners?: string[];
  links?: {
    website?: string;
    twitter?: string;
    deck?: string;
    dataRoom?: string; 
    telegram?: string;
    discord?: string;
    linkedin?: string;
    docs?: string;
    whitepaper?: string;
    youtube?: string;
    medium?: string;
    calendly?: string;
  };
  fundingDetails?: {
    raised?: string;
    raising?: string;
    valuation?: string;
    tge?: string;
    minTicket?: string;
    tokenomics?: string;
  };
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: "fasqon",
    name: "Fasqon",
    sector: "Fintech",
    stage: "Late Seed",
    raiseRange: "$2M",
    oneLiner: "Crypto-native neobank bridging Web3 and TradFi.",
    fullDescription: "Fasqon is a frontier fintech infrastructure that collapses the barrier between crypto liquidity and real-world banking. Backed by Bison Bank (EU), it enables users to send, swap, and spend globally — combining real-time fiat-crypto payments, AI tools, and DeFi yields. Its token, $FSQN (BNB Chain), is backed by real fintech revenue.",
    problemSolution: "Digital nomads and crypto startups face extreme friction moving capital between on-chain wallets and traditional bank accounts. Fasqon provides instant SEPA transfers, real-time fiat-crypto swaps, and a regulatory shield that prevents account freezes.",
    traction: "Raised $1.3M (Seed). Partners: Bison Bank, MH Ventures, Pacific Street Group, Trustify Legal, PureFi. Featured in CoinTelegraph, Business Insider.",
    teamBackground: "Founded by serial entrepreneurs with deep backgrounds in EU banking compliance and full-stack blockchain development.",
    keyFeatures: ["FasPay real-time system", "Instant SEPA up to €100K", "Regulated EU banking rails", "DeFi yields & rewards"],
    partners: ["Bison Bank", "MH Ventures", "Pacific Street Group", "Trustify Legal", "PureFi", "Aethir", "Cookie3", "Kaito"],
    fundingDetails: {
       raised: "$1.3M",
       raising: "$2M (Late Seed, SAFT)",
       valuation: "$15M FDV",
       tge: "Q1 2026",
       minTicket: "$50K",
       tokenomics: "25% of earnings allocated to buybacks and burns"
    },
    links: {
      website: "https://fasqon.com",
      twitter: "https://x.com/fasqon",
      linkedin: "https://linkedin.com/company/fasqon",
      deck: "https://fasqon.com/deck",
      dataRoom: "https://fasqon.com/dataroom",
      youtube: "https://youtube.com/@fasqon",
      medium: "https://medium.com/@fasqon",
      calendly: "https://calendly.com/partnerships-fasqon/30min"
    },
    featured: true
  },
  {
    id: "sanity-united",
    name: "Sanity United",
    sector: "Energy",
    stage: "Strategic",
    raiseRange: "Contact",
    oneLiner: "Integrated green infrastructure ecosystem (Energy + Mining + AI).",
    fullDescription: "Sanity United is building an integrated green infrastructure ecosystem that combines renewable energy, sustainable mining, and an AI-powered task service marketplace. It launches with a megawatt-scale energy facility designed to generate real cash flow.",
    problemSolution: "AI training and blockchain mining are energy-prohibitive. Sanity United builds renewable infrastructure that vertically integrates with the compute layer, turning excess energy into profitable digital assets.",
    traction: "Signed $25M drawdown agreement with a major institutional fund. 50MW capacity pipeline secured.",
    teamBackground: "Lead by veterans from the utility-scale solar industry and core Bitcoin mining consultants.",
    keyFeatures: ["Energy Infrastructure", "AI-Powered Service Economy", "50% Liquidity discipline for OTC funds"],
    fundingDetails: {
      raising: "Strategic Round",
      valuation: "Contact"
    },
    links: {
      website: "https://sanity.fund/",
      twitter: "https://x.com/sanity_united",
      linkedin: "https://www.linkedin.com/company/sanity-united/",
      dataRoom: "https://docs.sanity.fund/token/treasury-pool-regulation"
    }
  },
  {
    id: "secantx-ai",
    name: "SecantX AI",
    sector: "AI",
    stage: "Seed",
    raiseRange: "Contact",
    oneLiner: "Vision-first spatial AI for traders overlays existing desks.",
    fullDescription: "SecantX is building the 'Iron Man' HUD for crypto traders. A spatial AI layer that runs natively on the desktop, observing charts, order books, and news feeds in real-time. Analyze markets using voice, text, and visual context.",
    problemSolution: "Traders suffer from info-overload. SecantX aggregates visual data from any platform and provides agentic execution via natural language commands.",
    traction: "Desktop v0.1 live. Progressing through Coinbase 'Blue Carpet' accelerator. Backed by OpenAI/Coinbase (Progressing).",
    fundingDetails: {
      tge: "TGE target May 2026",
      valuation: "Estimated $70M FDV"
    },
    keyFeatures: ["Spatial AI Overlay", "Agentic Vision", "Multimodal Control", "Deflationary Tokenomics ($SECA)"],
    links: {
      website: "https://www.secantx.ai/",
      twitter: "https://x.com/SecantXAI",
      docs: "https://www.secantx.ai/docs",
      deck: "https://secantx.ai/docs/token"
    }
  },
  {
    id: "equiteez",
    name: "Equiteez",
    sector: "RWA",
    stage: "Pre-Series A",
    raiseRange: "$30M",
    oneLiner: "Institutional-grade infrastructure for RWA tokenization.",
    fullDescription: "Equiteez is the primary issuance and lifecycle management platform for fractionalized real-world assets. Built on the Mavryk Layer-1, it targeting institutional portfolios — from gold to luxury real estate.",
    problemSolution: "Massive bottleneck of institutional demand for tokenized assets. Equiteez provides the full-stack tech and legal containers to solve this.",
    traction: "$14.9B+ in contracted, binding deals. Anchor contracts include an $11.5B gold portfolio. Integrated with Fireblocks.",
    fundingDetails: {
      raising: "$30M via SAFE",
      valuation: "20% discount to next round",
      tge: "Q2 2026"
    },
    links: {
      website: "https://equiteez.com",
      twitter: "https://x.com/equiteezdotcom",
      dataRoom: "https://docsend.com/v/4mf6x/equiteez-thesis"
    }
  },
  {
    id: "go-smartchain",
    name: "Go!",
    sector: "RWA",
    stage: "Strategic",
    raiseRange: "$5M",
    oneLiner: "AI-native execution infrastructure for real-world assets.",
    fullDescription: "Go! unifies Agentic AI, zkEVM L1 + native Bitcoin settlement, and TreasuryOS to turn tokenized assets into AI-optimized, executable capital systems. Focus on enterprise revenue + institutional RWA scale.",
    problemSolution: "RWA requires automation. Go! uses agentic AI to manage distributions and rebalancing autonomously.",
    traction: "1M+ ecosystem members. $250M TVL pipeline. Backed by Animoca, Polygon Ventures, Sequoia Scouts.",
    fundingDetails: {
      raising: "$5M ($2.5M remaining)",
      valuation: "$24M Post-money",
      tge: "May 2026",
      minTicket: "Contact",
      tokenomics: "$GSMC Private Entry: $0.012"
    },
    links: {
      website: "https://www.gosmartchain.ai/",
      deck: "https://docsend.com/view/jstysz58dd2e8ct5",
      twitter: "https://x.com/gorwachain",
      docs: "https://whitepaper.gosmartchain.ai/"
    }
  },
  {
    id: "ceres-farm",
    name: "Ceres Farm",
    sector: "DeFi",
    stage: "Seed",
    raiseRange: "Contact",
    oneLiner: "Automated DeFi yield optimization via smart vaults.",
    fullDescription: "Ceres Farm abstracts the complexity of yield farming. Through automated smart vaults, it executes leverage, compounding, and dynamic risk management in the background.",
    problemSolution: "DeFi is too complex for passive users. Ceres handles collateral management and liquidation protection across multiple chains automatically.",
    traction: "Live App v2. Successfully managed $10M+ in peak TVL. Integrated with Aave and Uniswap V3.",
    keyFeatures: ["Leverage Optimization Engine", "Dynamic Risk Management", "Modular Vaults"],
    links: {
      website: "https://ceresfarm.fi",
      twitter: "https://x.com/CeresFarmFi",
      docs: "https://app.v2.ceresfarm.fi/en"
    }
  },
  {
    id: "matterhorn",
    name: "Matterhorn",
    sector: "AI",
    stage: "Private Beta",
    raiseRange: "Contact",
    oneLiner: "AI-native development engine for Web3 Apps and Agents.",
    fullDescription: "Matterhorn allows anyone to build complex Web3 platforms just with chat. It removes the complexity of 50+ blockchains, smart contract audits, and wallet connections.",
    problemSolution: "Vision: 100,000 Web3 apps built in 100 days. Empowering communities to build without code.",
    traction: "Waitlist 2,500+ builders. Private Beta launched. Support for XRPL tokenization with 1-line prompts.",
    teamBackground: "Founded by Abhinav (ex-EY, 7yrs blockchain), Amit (CTO), and Jayant Sriram (CMO).",
    links: {
      website: "https://matterhorn.so",
      deck: "https://docsend.com/view/2tdnv8sphtipddu5",
      twitter: "https://x.com/matterhorn_so"
    }
  },
  {
    id: "swarp-pay",
    name: "SwarpPay",
    sector: "Fintech",
    stage: "Seed",
    raiseRange: "$4M",
    oneLiner: "Custodial crypto-fintech bridge with Solana/Bitcoin infra.",
    fullDescription: "SwarpPay is a custodial platform building a streamlined gateway through Solana + Bitcoin infrastructure. It tackles fragmented onboarding and bot-dominated launches.",
    problemSolution: "Fragile market integrity and poor UX. SwarpPay unifies custody, identity layer (SwarpID), and integrated fiat-crypto rails.",
    traction: "Working dashboard live. Partners: Transak, MoonPay, Mercuryo support card/bank on-ramps.",
    fundingDetails: {
       raised: "Private",
       raising: "$4M Seed",
       valuation: "$19M-$22M"
    },
    links: {
      website: "https://swarppay.com",
      dataRoom: "https://swarppay.com/investors"
    }
  },
  {
    id: "noah-ai",
    name: "Noah AI",
    sector: "AI",
    stage: "Strategic",
    raiseRange: "Contact",
    oneLiner: "Solana native vibe coding platform for apps and agents.",
    fullDescription: "Noah allows devs and non-devs to turn ideas into fully deployed Solana apps from a single prompt. Integrated with OpenClaw for persistent on-chain autonomous agents.",
    problemSolution: "Converting communities into builders. Autonomous protocol execution with scoped wallet permissions.",
    traction: "5,600+ builders. 7,000+ apps built. Hosted first Solana Vibe Coding Hackathon. Working with Pumpfun and Bags.",
    partners: ["Matchchain", "DogeOS", "Coti Foundation", "Pumpfun"],
    links: {
      website: "https://noah.ai",
      twitter: "https://x.com/NoahAI",
      docs: "https://noah.ai/docs"
    }
  },
  {
    id: "cadinu",
    name: "Cadinu",
    sector: "DeFi",
    stage: "Strategic",
    raiseRange: "$200K",
    oneLiner: "Dual-token DeFi infrastructure on BSC.",
    fullDescription: "Cadinu combines multi-DEX aggregation with gamified user incentives and liquidity tools for mid-market projects. Focused on capital efficiency and long-term retention.",
    traction: "Live multi-DEX aggregator. Actively scaling development and market-making.",
    links: {
      website: "https://cadinu.io",
      deck: "https://docs.google.com/presentation/d/1ZcgHk2BkvfaJxcbMFKVJTM54SC7w_Gqf/edit"
    }
  },
  {
    id: "zeno-traders",
    name: "Zeno Traders",
    sector: "Fintech",
    stage: "Seed",
    raiseRange: "$500K",
    oneLiner: "Token-backed crypto native prop trading firm.",
    fullDescription: "Zeno funds disciplined traders through gamified challenges and on-chain incentives. Combines risk-controlled capital with token-backed utility.",
    problemSolution: "Scalable recurring revenue via trading challenges. Product built pre-funding with proprietary risk engine.",
    traction: "Raised $110k already. 600+ KOL network across India, SEA, MENA. Strong exchange discussions.",
    fundingDetails: {
      raised: "$110k",
      raising: "$500k",
      tge: "Q2 2026"
    },
    links: {
      website: "https://zenotraders.com/",
      twitter: "https://x.com/zeno_traders",
      deck: "https://drive.google.com/file/d/1b2U-oMycPSMdxSPAjS3BvoLlm4PQVJUG/view"
    }
  },
  {
    id: "holder-house",
    name: "Holder House",
    sector: "Fintech",
    stage: "Pre-Seed",
    raiseRange: "$500K",
    oneLiner: "Institutional operating system for private capital & SAFTs.",
    fullDescription: "Holder House standardizes how private assets (SAFTs, venture secondaries) are issued, transferred, and managed. Unified infrastructure combining tokenized legal containers and embedded compliance.",
    problemSolution: "Private asset transfers are manual and legally complex. Holder House creates a transition standard for tokenized private assets.",
    traction: "$200k in commitments. Active OTC deal flow in venture secondaries. Preparing public release.",
    fundingDetails: {
      raised: "$200k",
      raising: "$500k",
      valuation: "$5M Cap",
      tokenomics: "Token reference price 0.015 (TGE 0.030)"
    },
    links: {
      website: "https://holderhouse.io",
      deck: "https://holderhouse.io/deck",
      dataRoom: "https://holderhouse.io/dataroom"
    }
  },
  {
    id: "bullshot",
    name: "Bullshot",
    sector: "SocialFi",
    stage: "Growth",
    raiseRange: "Contact",
    oneLiner: "Where meme culture meets AI innovation.",
    fullDescription: "Bullshot is's the ultimate 'Pump.fun' for institutional-quality community tokens. AI-powered meme launcher that allows anyone to create and scale tokens with built-in trading mechanics.",
    traction: "$12.5M+ trading volume. 350K+ active users. Top 5 on BNBDapp (AI Category). Partnerships with Binance Wallet, OKX Web3.",
    keyFeatures: ["AI Meme Launcher", "x402 token launcher", "Social AI automation"],
    links: {
      website: "https://bullshot.io/",
      twitter: "https://x.com/Bullshot911",
      deck: "https://docsend.com/view/uisby8p5j5cs6yh5"
    }
  },
  {
    id: "yom",
    name: "YOM",
    sector: "Infrastructure",
    stage: "Private",
    raiseRange: "$1.5M",
    oneLiner: "DePIN cloud gaming network delivering low-latency play.",
    fullDescription: "YOM award-winning DePIN delivers high-performance cloud gaming to any device via Telegram or Discord. powered by deflationary tokenomics.",
    problemSolution: "Goodbye Steam/Xbox. Play AAA titles on Chromecast/Mobile with 50% less latency than centralized cloud providers.",
    traction: "20 regions live on Testnet. 40+ studios signed. Won Gamescom 2025 Start-up award. EIC Seal of Excellence.",
    fundingDetails: {
      raising: "$1.575M",
      valuation: "$75M FDV (Private $52.5M)",
      tge: "Early Q1 2026"
    },
    links: {
      website: "https://yom.net",
      twitter: "https://x.com/YOM_Official",
      dataRoom: "https://yom.net/investor-portal",
      youtube: "https://youtube.com/@yom_depin"
    }
  },
  {
    id: "onchain-bridges",
    name: "OnChain Bridges",
    sector: "Infrastructure",
    stage: "Private",
    raiseRange: "$2M",
    oneLiner: "Unifying non-fungible asset movement across blockchains.",
    fullDescription: "OnChain Bridges removes non-fungible asset fragmentation — unifying blockchains into a single layer for RWA, Identity, and Gaming pass movement.",
    problemSolution: "Web3 is siloed. We build the infrastructure that lets institutions move non-fungible assets securely and decentralized.",
    traction: "$95K from existing investors (Bitcoin Frontier Fund, Astar, Stellar). Selected for Chainlink BUILD.",
    teamBackground: "Led by Ilan Klein (CEO, 15yrs tech) and Micha Riss (CMO, ex-VISA/CBS/HBO projects).",
    links: {
      website: "https://onchainbridges.com",
      twitter: "https://x.com/OnchainBridges",
      deck: "https://drive.google.com/file/d/18XTl8Am4Lsb4ZllmjZJGlUixw1yMyn__"
    }
  },
  {
    id: "src",
    name: "$SRC",
    sector: "RWA",
    stage: "Strategic",
    raiseRange: "Contact",
    oneLiner: "Digital and tokenized rails for SME trade finance.",
    fullDescription: "$SRC closes the $2.5T trade finance gap for SMEs using AI and tokenized RWA. combines AI intelligence, blockchain, and stablecoin payments into a unified ecosystem.",
    problemSolution: "Infrastructure layer for global trade. Tokenizing invoices and purchase orders into liquid, investable assets.",
    traction: "Partners: CCPIT, ICBC & ADEX (UAE), ICC, Ripple. Featured in Business Insider, AP News.",
    links: {
      website: "https://src.foundation",
      medium: "https://src.foundation/blog"
    }
  },
  {
    id: "noya",
    name: "NOYA",
    sector: "AI",
    stage: "Fair Launch",
    raiseRange: "Public",
    oneLiner: "Execution layer for the prediction market economy.",
    fullDescription: "NOYA turns raw on-chain noise into structured edge. The first protocol combining prediction market intelligence, token fundamentals, and automated execution.",
    traction: "30,000+ active researchers. 10 chains live. Reached Top 5 on Kaito Leaderboard.",
    fundingDetails: {
      valuation: "$10M FDV (~15x Discount to Sector Avg)"
    },
    keyFeatures: ["Prediction Market Copilot", "Omnichain AI Agent", "Token Intelligence", "Omnivaults"],
    links: {
      website: "https://app.noya.ai",
      twitter: "https://x.com/NetworkNoya",
      deck: "https://docsend.com/view/sdpma2m6scuavjwv"
    }
  },
  {
    id: "smartsentinels",
    name: "SmartSentinels",
    sector: "AI",
    stage: "Private",
    raiseRange: "$150K",
    oneLiner: "Proof-of-Useful-Work AI network replacing speculative mining.",
    fullDescription: "SmartSentinels links token issuance to verifiable AI services. Transforms hardware into productive assets performing tasks like automated smart contract audits.",
    traction: "Live revenue-generating products. Lead investor: Poolz Finance.",
    fundingDetails: {
      raising: "$150K",
      valuation: "$5M FDV"
    },
    links: {
      website: "https://smartsentinels.net",
      twitter: "https://x.com/SmartSentinels_"
    }
  },
  {
    id: "sweepr",
    name: "SWEEPR",
    sector: "Infrastructure",
    stage: "Seed",
    raiseRange: "$1.8M",
    oneLiner: "Dust conversion protocol for fragmented on-chain balances.",
    fullDescription: "Sweepr converts fragmented dust balances into usable capital (USDC/SOL/ETH) in a single action using non-custodial batching.",
    problemSolution: "Millions stranded in wallets as dust. Sweepr is the first non-custodial, multi-chain, batched dust conversion protocol.",
    traction: "Live demo on mainnet. Solana/Base support. Partnered with major aggregators.",
    fundingDetails: {
      raising: "$1.8M",
      valuation: "$12M FDV",
      tge: "Q3 2026"
    },
    links: {
      website: "https://sweepr.co",
      deck: "https://sweepr.co/deck"
    }
  },
  {
    id: "hunch",
    name: "Hunch",
    sector: "SocialFi",
    stage: "Strategic",
    raiseRange: "Contact",
    oneLiner: "Swipe-first prediction market interface for mass consumers.",
    fullDescription: "Hunch turns prediction markets into content. A scrollable, swipe-first experience like TikTok for betting on outcomes. Uses 'Swipe Mining' for retention.",
    problemSolution: "Prediction markets failed to scale because they feel like trading terminals. Hunch makes them a consumer product.",
    traction: "Product live. Scaling prediction markets as content, not just financial tools. ~250k early active participants.",
    links: {
      website: "https://hunch.ai",
      deck: "https://hunch.ai/deck"
    }
  },
  {
    id: "nanovita",
    name: "NanoVita",
    sector: "DeSci",
    stage: "Stealth",
    raiseRange: "Contact",
    oneLiner: "Merging nanotech, bio-intelligence, and RWA health data.",
    fullDescription: "NanoVita studies how advanced nanomaterials enhance human vitality and optimization, converting research outcomes into verifiable on-chain value.",
    problemSolution: "Open, global network where breakthroughs in nanoscience are owned by the community.",
    traction: "Building open research network. Secured core advisory from nanotechnology labs.",
    links: {
      website: "https://nanovita.org",
      deck: "https://nanovita.org/deck"
    }
  },
  {
    id: "space",
    name: "Space",
    sector: "DeFi",
    stage: "Strategic",
    raiseRange: "Contact",
    oneLiner: "10x Leveraged prediction market on Solana.",
    fullDescription: "Space is the first leveraged prediction market (up to 10x) on Solana, built by the $1.5B+ UFO team. Solving prediction markets' #1 problem — liquidity.",
    problemSolution: "CLOB architecture with 0% maker fees. Seasonal airdrops and gamified retention.",
    traction: "Record-breaking 1,360% oversubscribed raise on Echo.xyz.",
    links: {
      website: "https://space.trade",
      twitter: "https://x.com/SpaceTrade"
    }
  },
  {
    id: "estate-prime",
    name: "EstatePrime",
    sector: "Real Estate",
    stage: "Series A",
    raiseRange: "$10M",
    oneLiner: "Tokenized commercial real estate index for retail investors.",
    fullDescription: "EstatePrime disrupts the real estate market by tokenizing income-generating commercial properties. Own 1/1000th of a skyscraper and receive rent in USDC.",
    problemSolution: "Instant liquidity for commercial real estate via secondary AMMs.",
    traction: "$150M AUM committed. Regulatory sandbox approved in UAE.",
    fundingDetails: {
      raising: "$10M",
      valuation: "$85M",
      minTicket: "$100K"
    },
    links: {
      website: "https://estateprime.io",
      deck: "https://estateprime.io/deck"
    }
  },
  {
    id: "vitals-dao",
    name: "VitalsDAO",
    sector: "DeSci",
    stage: "Seed",
    raiseRange: "$2M",
    oneLiner: "Decentralized clinical trials for longevity therapeutics.",
    fullDescription: "VitalsDAO is a community-owned protocol funding research into life-extension technologies. Uses IP-NFTs to represent ownership of medical patents.",
    problemSolution: "Co-funding and co-owning intellectual property of successful longevity trials.",
    traction: "First IP-NFT sold for $500k. Research partnership with leading labs.",
    links: {
      website: "https://vitalsdao.com",
      twitter: "https://x.com/vitalsdao"
    }
  },
  {
    id: "neural-mesh",
    name: "NeuralMesh",
    sector: "AI",
    stage: "Pre-Seed",
    raiseRange: "$1M",
    oneLiner: "Decentralized inference network for open-source LLMs.",
    fullDescription: "NeuralMesh is a DePIN for AI inference. Allows idle consumer GPUs to contribute compute power for running LLMs without relying on Big Tech.",
    problemSolution: "Censorship-resistant, cost-effective alternative for hosting AI agents.",
    traction: "500 nodes active in alpha. Support for Llama 3 and Mistral.",
    fundingDetails: {
      raising: "$1M",
      valuation: "$12M"
    },
    links: {
      website: "https://neuralmesh.ai"
    }
  }
];
