/**
 * Service Providers & Vetted Agencies Seeder for Raisequity
 * 
 * Safely seeds all 100+ vetted Web3 agencies, KOL networks, PR firms,
 * and tokenomics consultancies into the Firestore "experts" collection.
 * 
 * Zero Hardcoding: The frontend dynamically fetches from Firestore via useExperts.
 */

import crypto from 'crypto';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDA2sTTcOvZFvlA0h3Tf1echp84saV82iQ',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'raisequity-5d862.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'raisequity-5d862',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'raisequity-5d862.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '53852364116',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:53852364116:web:f0ac19be0beb73efaf7cc1',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const RAW_DATA = `Green Dots	KOL marketing,Marketing advisory,PR	Mantle, Sui, Sei, Ether.fi, Arcium, YieldBasis, Legion, Redstone, Citrea, Walrus, Mocaverse & more	Vetted	1,500+ KOLs in database, including local KOLs (Asia, CIS, MENA, LatAM). Extensive portfolio. Offers strategic & creative approach to paid campaigns. Founded by Stacy Muur. Code [VENDOR] → -10% agency fees for first collab
INPUT Comms	Events,KOL marketing,PR	Tron, Ledger, Tether, Bitget, CoinW, WeFi, Mexc	Vetted	Focus areas include PR for product launches, personal branding, geographic expansion, and event-based engagement across B2B, investor relations, market entry, and community outreach.
Pink Brains	Content,KOL marketing	Polkadot, Avalanche, Near, Socket, Injective, BOB, Pudgy Penguins	Vetted	DeFi creator studio focused on long-term growth through narrative framing and KOL marketing. Founded by Ignas DeFi Research.
GROWGAMI	KOL marketing,Market making,Marketing advisory	Near, Avalanche, Solana, Polygon	Vetted	Mainly focused on targeted user acquisition, network access, data-driven expansion strategies, and multi-chain campaign activities
Lunar Strategy	KOL marketing,Marketing advisory,PR	Polkadot, Neo, Cookie3, Solana, Humanity Protocol, Privasea	Vetted	Agency’s scope includes social media, influencer coordination, public relations, and community-related activities within Web3 ecosystems.
Flight3	Community,Content,Design,Events,KOL marketing,Marketing advisory	Solana, Coinbase, Sui, Fuel, zkSync, Ton, Vechain, Optimism	Vetted	Full-stack marketing and creative agency with scope across content, community, events, and influencer marketing.
Steak Studio	KOL marketing,Marketing advisory	Plume, IOTA, Mira, Sentient, EigenDA, Near	Vetted	Boutique advisory service focused on narrative development, research, marketing advisory, and influencer marketing.
Dverse	Exchange listings,KOL marketing,Marketing advisory,PR	BOB, BOS, Algorand, Folks, Binance, Portal to Bitcoin, OKX, Acurast	Vetted	Provides services across advisory, exchange listing support, community engagement, and PR. Its activities include strategy, social engagement, KOL coordination, and related campaign work within the Web3 ecosystem.
Surgence	Community,Content,KOL marketing,Tokenomics	Animoca Brands, Hashed, Shima Capital, Polygon, Arbitrum.	Vetted	Marketing and GTM agency
LFG	Community,Content,KOL marketing,Marketing advisory	Babylon, Nillion, Gala games, Metis, Bubblemaps, Vana	Vetted	Marketing agency with a focus on key regional markets including China, Korea, Japan, and the Middle East.
Tailored	Content,Design,KOL marketing,Marketing advisory,PR,SEO	Avalanche, Solv Protocol, io.net, Nillion, Puffpaw, DEX Screener, INFINIT	Vetted	Web3 Marketing Studio | Driving User Acquisition, Education and Retention for Innovative Protocols
TheKOLLab	KOL marketing,Market making,PR,SEO	Travala, Trust wallet, Taiko, Masa, Zerolend, Soul Protocol	Vetted	Marketing agency working with blockchain projects across marketing and partnerships.
Radarblock	Community,Content,Events,KOL marketing,Marketing advisory,PR	Polygon, Morpho, Biconomy, Kite, Avail, Linea, Symbiotic	Vetted	Growth agency focused on user acquisition
AP Collective	Community,Content,Design,Email,Events,Exchange listings,KOL marketing,Marketing advisory,PR,SEO,Tokenomics	Abstract, Near, The Sandbox, Raydium, Pudgy Penguins, Avax, Openledger, Paradex, Footballdotfun	Vetted	Specializes in blockchain marketing, influencer partnerships, and strategic community growth
Scrib3	Community,Content,Design,KOL marketing,Marketing advisory,PR	Mantle, Kraken, Gains Network, Moonbeam, Avalanche, Axelar	Vetted	Studio’s work covers creative, content, social media, and public relations activities for Web3 builders.
Hype	Community,Content,Events,KOL marketing,Marketing advisory,PR	Optimism, Flare, EigenLayer, Taiko, Sui, Babylon	Vetted	Focus spans across content, social and community activity, paid advertising, and influencer marketing.
BD Labs	Marketing advisory	Stackup.fi, Levva, Enflux, Coinshift, Aegis	Vetted	Guild of 20+ contributors with experience across sales, marketing, and product development in Web3.
Arcadia	Design,KOL marketing,Marketing advisory	Polymarket, Sentient, Hedera, Worldcoin, Astar, Sonic	Vetted	Covers influencer marketing, Discord management, X growth, copywriting, and strategic advisory, with additional work around helping Web2 brands transition into crypto-native campaigns.
Nebula	Content,KOL marketing,Marketing advisory	Aethir, Clearpool, Consensys, Linea, Sentinet, Multiplifi, Manta Network, Ledger, SwissBorg	Vetted	Focused on incubation, strategic marketing, and campaign-related activities for blockchain and crypto projects.
R3ACH NTWRK	KOL marketing,Marketing advisory	Stream, XBorg, Sandbox, Yay, Alphabot	Vetted	Blockchain creator–brand network, founded by wale.moca.
Whitelist	KOL marketing,Marketing advisory	DWF Labs, Mantle, ChainGPT, StandX, Falcon, Citrea, Turtle, Vooi	Vetted	Puts emphasis on paid social campaigns, ambassador programs, and community growth activities, especially in CIS
FIN PR	KOL marketing,PR	PolkaDex, Swift Blockchain, OpenDAO, Streamr, Wanchain	Vetted	Mainly focused on PR
Blockman	PR	Bitget, Bybit, OKX, Tron, HTX, Hedera	Vetted	Has access to 200+ media partners. Service scope includes user acquisition, branding, content formats, and news distribution.
RZLT	Community,Content,Design,KOL marketing,SEO	Optimism, Ton, Chainlink, Sui, Near, Difinity	Vetted	Growth and marketing hub with services in go-to-market strategy, advertising, content and community support
Cryptorsy	Design,Events,KOL marketing,Marketing advisory	Hedera, Bybit, Ton, Clearpool, Kima, Plume	Vetted	Marketing and advisory provider covering influencer marketing, branding and ecosystem support
Movimentum	CMC marketing	Sonic, Mocaverse, Avalanche, SwissBorg, Ronin, Taiko, Doodles	Vetted	Focused on Coinmarketcap token marketing and visibility.
Solus Group	Exchange listings,KOL marketing,Market making,Marketing advisory	Symbiotic, Aster, Animoca brands, 1inch	Vetted	Provides go-to-market strategic consulting, KOL marketing, ambassador programs, and strategic advisory.
Fomo Ventures	KOL marketing	Particle Network, Portal Coin, Peaq, Xborg, IONet	Vetted	Focused on investment and incubation for top-tier Web3 KOLs and builders.
ExaGroup	Tokenomics	Polygon, Enso, NEAR, ZkSync, FOREFRONT, Ocean, Roko Network, Gyroscope	Vetted	Financial advisory and digital asset curation firm with expertise in tokenized capital markets, token economic optimization, digital asset curation and decentralized governance solutions for DAOs and founders looking to maximise ecosystem resilience.
Creatorwire	KOL marketing	Polkadot, NEAR, Cookie3, Humanity Protocol, Solana, Aethir	Vetted	Influencer marketing unit of Lunar Strategy
Impact3	Content,KOL marketing,Marketing advisory,PR	Ondo, Helium, Sharplink, Bankless, Blockworks, Bitfinex	Vetted	Working across strategy, research, paid media, content, and analytics in support of campaign and brand decisions.
Cipher Dance	Marketing advisory	Fuse, Card Protocol, Particle Network	Vetted	Web3 marketing and growth agency focused on helping blockchain projects with market positioning, KOL/influencer campaigns, social media and community development, press and media relations, and broader growth execution for crypto brands.
Chainwire	PR	Sui, Coinmarketcap, Bitget, Bybit, Polkadot, BNB Chain	Vetted	Primarily focused on PR
Gelo Cubed	Marketing advisory	Supra, WeFi, Solana, Polkadot, BeFi Labs	Vetted	GTM and growth studio covering positioning and brand communications, go-to-market planning, and distribution-focused marketing systems.
Far East Blockchain	Marketing advisory	Tria, ZCash, Flow, Fluid, Sapien, Rango, The Graph	Vetted	Based in Tokyo and operating across Asia, the US, Europe, CIS, and Latin America with a focus on research, investment advisory, and business development.
Castle Labs	Content,KOL marketing,Marketing advisory,Tokenomics	Starknet, Arbitrum, Mantle, EigenCloud, Ink	Vetted	Research and strategy partner that helps companies turn creativity and strong fundamentals into tangible growth.
IMPOSSIBLE	Blockchain consulting,Marketing advisory	Flying Tulip	Vetted	Research & Advisory Firm
ACC Ventures	Community,Content,Design,Events,Exchange listings,KOL marketing,Market making,Marketing advisory,PR,SEO,Tokenomics	Bitget, Pi Squared, Rhuna, Linera, Starknet, MultiversX	Vetted	Venture Studio working hands-on with tech teams across product, strategy, business, marketing, and growth.
Deltora Labs	Community,Exchange listings,KOL marketing,Marketing advisory	ChainGPT Labs, Sahara AI, EtherFI	Vetted	Deltora Labs is a subsidiary of Deltora Labs Foundation, an organization that invests in pre-launch blockchain projects with thousands of members.
BlockHive	KOL marketing	NA	Vetted	Marketing agency with an open KOL network
ICODA	KOL marketing,Marketing advisory,PR	Solana, Immutable Labs, Offchain labs	First-Time	Covers data-informed campaign planning, influencer and social media coordination, SEO, reputation management, and PR-related activities.
Pro Crypto	KOL marketing,Marketing advisory	Cypherium, Cypher Dog, Aventus, ScaleSwap, Swash	First-Time	Marketing and community operations agency covering SMM, community moderation, influencer coordination, events such as AMAs and contests, and promotional campaigns.
Hopp Digital	KOL marketing,Marketing advisory	OKX, CoinDCX, MEXC, ByBit, WeFi	First-Time	Focused on influencer marketing, content production and events management
Guerillabuzz	Community,Content,Marketing advisory,PR,SEO	AllNodes, Apeswap, Coingecko, Fetch, Caspian	First-Time	Marketing and PR agency with offerings in public relations, SEO and marketing
Market Across	Marketing advisory,PR	Polkadot, Near, KuCoin, DyDx, Ionet, Consensys	First-Time	PR agency with scope across end-to-end marketing, narrative development, and full-stack, success-based growth campaigns.
flexe.io	Exchange listings,Marketing advisory,PR,SEO	Pendle, Ramp, Edge, Nosana, Koi Finance, Gulf coin	First-Time	Focuses on social media advertising, targeted community engagement, and influencer outreach, with additional work in PR and promotional content across various digital channels.
Se7en and Co	Community,Content,Design,KOL marketing,Marketing advisory	Eigen Cloud, AltLayer, Synthr, Autonome, Lighthouse Perpetual	First-Time	Marketing advisory centered on GTM planning, research, KOLs marketing, content, community building and branding
Coinbound	Community,Content,Events,KOL marketing,Marketing advisory,PR	Sui, Gala, eToro, MetaMask, Nexo, Tron, Immutable	First-Time	Marketing agency focused on influencer marketing, media outreach, paid advertising, and social and community coordination, with additional work across PR, event production, branding, and advisory activities.
Crynet	Blockchain consulting,Community,Events,KOL marketing,PR	Coinmarketcap, Cointelegraph, Polymath, Etherscan	First-Time	Consulting agency with experience in influencer marketing PR and media engagement, event marketing, dvertising and token sale marketing.
Coinband	Community,KOL marketing,PR,SEO	GT Protocol, GG Token, Dexcheck, Rolaz Gold, Galaxy Arena	First-Time	Marketing agency covering PR, SEO, influencer and paid advertising, alongside website development.
Tokenminds	KOL marketing,Marketing advisory,PR,SEO,Tokenomics	Coinmarketcap, Birdchain, Capdax, Remme, Cexiswap, Crypto blades	First-Time	Marketing agency structured into multiple divisions, including web3 & AI development, and marketing, with work across promotion, token sales support, advisory, and tokenonomics
Chainstory	Content,PR,SEO	Dune, Syndika, Zenx labs, Masterkey	First-Time	Crypto-native public relations firm with focus on brand voice development through content and SEO strategy.
Reblonde	PR	Lava, ChainGPT, Bitgreen, Synapse network, Realio	First-Time	Public relations firm specializing in crypto, technology, and AI
Generis	Community,Content,Marketing advisory,PR,SEO	Purefi, Claimr, GT Protocol, Cointelegraph, Whiteswap, Coinpay	First-Time	Marketing agency covering go-to-market planning, scaling, product launches, and custom marketing programs.
Cryptic web3	Community,KOL marketing,Marketing advisory,PR	Algorand, OKX, Bybit, Pixel Realm, Hydra chain, SolarX	First-Time	Marketing agency focused on growth hacking, influencer marketing, trend analysis, and community building.
Hash Consulting	Events,KOL marketing,Marketing advisory	Pyth, Sui, DYDX, Bitpanda, Meria, Binance	First-Time	Go-to-market and growth studio for crypto companies that provides insights for growth strategy, KOL marketing, and event management.
Sal'Ad	Content,KOL marketing,Marketing advisory,PR	Gate.io, Bitmart, Polygon ventures, Zen capital, Cypher Capital	First-Time	Primary emphasis on PR, advertising promotion, influencer outreach, alongside sales- and outreach-related services
LKI Consulting	Community,HR agency,KOL marketing,Marketing advisory,PR,SEO	Mantle, Solana, Gate.io, Cardano, Taiko, Multiversx, Waves	First-Time	Marketing and design agency with services across marketing, branding, advertising, and recruitment service
Take3	Community,Content,Events,KOL marketing,Marketing advisory,PR,SEO	Coinbase, Zeebu, Protocol theory, Webmint, Bamboo, Orange	First-Time	Marketing studio with activities across strategic consulting and crypto marketing, including paid media, social, email and content marketing.
Distractive	Content,Design,Email,Events,Marketing advisory,PR	Polkadot, Acurast	First-Time	Full-stack marketing agency with scope across branding, content, design, and advertising.
Artiffine	Design,Tokenomics	Rewardable, Assetify Hub, USDFi, Darkfusion, Future Networks	First-Time	Full-service studio focused on branding, development, web3 legal and strategic consulting
Bond Finance	Community,Content,Market making,Marketing advisory	Suede labs, Bright Hub, Trippy labs, Orange, Pendo	First-Time	Focused on strategy, community operations, partnerships, and marketing execution.
Proleo	Content,Exchange listings,KOL marketing,Marketing advisory,PR,SEO	Privapp network, DFSocial gaming, Dexkit, Easy Finance Corp	First-Time	Works with crypto, blockchain, fintech, and NFT projects on communications, content, and social media execution.
Omni	Community,Content,KOL marketing,Marketing advisory	LBank, Immutable, OKX, PaySafe, Slingshot DAO, NitroDome, Seascape, Phantom Galaxies, WAGMI Games	First-Time	Provides services in strategic planning, community management, PPC advertising, influencer marketing and guerrilla marketing
Outset PR	Content,KOL marketing,PR,SEO	Step App, Change Now, Xpanceo, Choise, Gomining	First-Time	Crypto-focused public relations and communications agency.
Crypto Token Media	Content,Email,KOL marketing,PR,SEO	eToroX, Liquid.com, Nexo, OKX, Apeswap, Zignaly	First-Time	Full-stack crypto marketing agency with scope across content, advertising, email marketing, public relations, SEO, and influencer marketing
Melrose PR	Content,PR	Aztec, Avalanche, Pyth, Coinmarketcap, Polkadot, Babylon	First-Time	Crypto PR and communications agency.
Ace ace	Community,Content,Marketing advisory	Axie Infinity, Waves tech, Cheelee	First-Time	Focused on multi-format content and community expansion, with emphasis on audience development on X
Coinzaar	Exchange listings,Market making,Marketing advisory	EJICOIN, Coinzaar, White legit, Vault chain	First-Time	Crypto listing agency
Coinpresso	Community,Content,KOL marketing,PR,SEO	Exodus, BlockDAG, Edel, Etherland	First-Time	Scope across performance marketing, content, and public relations. Media relationships include Tier-1 outlets such as Forbes, CNN, and Nasdaq.
Influence Media	Content,Design,KOL marketing,Marketing advisory,PR	Eigen, Ethereum foundation, Arbitrum, Vertex, YGG	First-Time	Focused on social media, branding, public relations, KOL programs, and advisory services.
Mysoin	Community,Content,Events,KOL marketing,Marketing advisory,PR	Metamask, Wallet connect, Gaia, Near, Chainbase, Talent protocol	First-Time	Work focus is on pre-TGE strategy, KOL programs, and founder-led marketing
Crowwd	Community,Content,Marketing advisory	Biconomy, CoinDCX, Sui, ETHIndia, Aptos	First-Time	Marketing agency focused on organic, community-led go-to-market growth and KOL/influencer-driven marketing for blockchain and crypto brands
Serotonin	Marketing advisory	Alchemy, Aptos, Aleo, Galxe, Matterlabs, Celo, Near	First-Time	Focus on global reach and end-to-end advisory.
Buidl mode	Community,Content,Marketing advisory	The Arena, TradeSta, Defenders, Hefe	First-Time	Scope across storytelling, content, and community programs. Operates online shows including Coffee Break, Arena Mode, and Buidl Labs.
Activ8	Community,Events,KOL marketing,PR	Bitget, Jupiter exchange, Velo, Avail, Paradex	First-Time	Web3 marketing team with activity across 40+ countries, supported by a network of 15,000+ partners and a reported global reach exceeding 1.8 billion.
Dart Studio	Community,Content,Marketing advisory	Filecoin, Supernova, Dot connector	First-Time	Focused on social media, content, and community programs. Media features include Tier-1 outlets such as Forbes, Bloomberg, and Yahoo Finance.
ChainPeak	KOL marketing,Marketing advisory,PR	Sui, Pancakeswap, Layerzero, Bitget wallet	First-Time	KOL agency with specialization in Chinese KOLs, comprising 500+ creators across Tier 1 to Tier 4.
BMB Web3	Community,Events,Marketing advisory,PR,SEO	No clients mentioned on website	First-Time	Blockchain marketing firm with global presence across Dubai, the United States, and Spain. Service scope includes advisory, public relations, events, and community growth.
Inferno Labs	Content,KOL marketing,Marketing advisory	Polygon, Animoca Brands, Farcana, Moonray	First-Time	Web3 marketing and consulting agency. Service scope includes KOL programs, social media, community, branding, and related functions.
Dawin Corp.	KOL marketing,Marketing advisory	Puma, Yay, Oasys Games	First-Time	Japan-based Web3 consulting and marketing agency providing strategy, advisory, marketing, community management, and influencer campaigns. The agency also supports Web2 companies in entering and expanding within the Web3 space.
Backstage labs	Community,Events,KOL marketing,Marketing advisory	SynFutures, BSquared Network, Undead Genesis	First-Time	Marketing and advisory firm focusing on protocols, DEXes, NFTs, and gaming
Itk.digital	Community,Content,KOL marketing,Marketing advisory	Treehouse, Stake, Confiction, Go, EMoney	First-Time	GTM execution and growth agency focused on KOL programs, community building, storytelling, advisory, and partnerships.
BrightNode	Blockchain consulting,Tokenomics	SUI, Aptos, Solana	First-Time	Focused on helping businesses adopt on-chain solutions and create blockchain products
Tokenomics.net	Blockchain consulting,Tokenomics	Influx, DFinance, EarnOS	First-Time	Focused on designing and modeling token economies for blockchain projects. Its expertise covers tokenomics simulations, token economic modeling, consulting on token structure and investor materials, and related advisory support for crypto founders.
Black Tokenomics	Tokenomics	Pixion Games, Naoris Protocol	First-Time	Tokenomics consulting agency that provides design and optimization for blockchain project tokenomics
Blockchain App factory	Exchange listings,Tokenomics	Spot Trade, HUMXN, Ame Chain	First-Time	Tokenomics design and advisory service focused on creating sustainable token models, including strategic token design, allocation planning, incentive mechanisms, and governance frameworks for crypto projects
CHAINFORCE	Exchange listings,Tokenomics	Galileo Protocol, PIXPEL, Script Network	First-Time	Blockchain consultancy focused on tokenomics and token engineering for Web3 projects.
OnHires	HR agency	Revolut, Binance, BITFURY, BTCBIT	First-Time	Global tech recruitment and staffing agency that supports Web3 and blockchain companies in hiring talent.
Axiom	HR agency	Chainlink, Kraken, Protocol Labs	First-Time	Global recruitment agency specializing in Web3, blockchain, and crypto talent acquisition
Plexus	HR agency	Kaiko, DYDX Foundation, Boson	First-Time	Blockchain recruitment agency focused on connecting blockchain projects with talent across technical and non-technical roles.
Listing.help	Exchange listings	Sylo, Cratos, TON, Everscale	First-Time	Listing and marketing agency that supports Web3 projects with token exchange listings, market making, marketing support, advisory services, and related listing coordination.
Ninja Promo	Content,Marketing advisory,PR,SEO	Revolut, HTX, IronFX	First-Time	Focused on multi-channel marketing for blockchain projects. Its expertise spans social media marketing, influencer marketing, PPC and paid advertising, SEO, content creation, PR and outreach, and broader digital strategy services
Clarisco	Exchange listings	Unitic, D Wallet, REMPIC	First-Time	A blockchain and crypto firm specializing in exchange listing support.
Mediax agency	PR	KuCoin, MetaBell, TEN	First-Time	Provide PR, media outreach, influencer marketing, content strategy, and social media support for blockchain and decentralized projects
Antier Solutions	Blockchain consulting	Coin Trade	First-Time	Offer enterprise-grade blockchain solutions, Web3 product development, smart contract and tokenization services, and broader decentralized technology implementation support
FORMULA by Cointelegraph	KOL marketing,PR	Chainlink, Ripple, Stellar, Bybit, Polygon	First-Time	Marketing and PR agency by the Cointelegraph Media Group. It supports blockchain projects with communications, narrative strategy, public relations, influencer and media outreach
KolsKlub	Community,Content,Events,KOL marketing,Market making,Marketing advisory,PR	Polygon, Avalanche, Gate.io	First-Time	Help Web3 projects build visibility, trust, and community through influencer marketing.
Yap Market	KOL marketing	Hemi, Avail, Doma	First-Time	Attention marketplace for X mindshare boosting
Dopamyn.fun	Community,Content,KOL marketing,Marketing advisory,PR,SEO	RAAC, Yellow, askRoger	First-Time	An agentic marketing platform and agency working purely with data-driven strategies
MOIC Digital	Community,Content,KOL marketing,Marketing advisory	Trezor, Balancer, Centrifuge, Mantle, Kaia, Zircuit, Ready	First-Time	A firm focused on marketing architecture and strategy
Vyom Studio	Content,Design,Events	Polygon, Solana, Near	First-Time	Professional video editing, podcast production, website development, and creative design services
BlockBuzz	Content,Design,KOL marketing,Marketing advisory,PR,SEO,Tokenomics	Sphinx Protocol	First-Time	Full-service agency covering everything from strategic copywriting and tokenomics design to industry research, community building, and event management.
ColdChain	KOL marketing,Marketing advisory,PR,SEO	Rootstock, Elys Network, Atom Accelerator, Genomes	First-Time	A performance-first marketing agency focused on Web3, blockchain, and crypto, combining experience from leading Web2 enterprises with Web3-native execution.
Chain Gang Labs	Content,Design,Marketing advisory	Chain Gang Labs	First-Time	A marketing firm specializing in UX , research-driven approach.
Clique	Tokenomics	Eigenlayer, Aethir, Berachain, Babylon, Plume, Sentient, Openledger, Somnia, Intuition Labs, Cysic, Talus, Superform, B3, Stakestone, Humanity, 0G, Talus, Theoriq, Kaito & many more	First-Time	Token distribution and on-chain payment solutions service
Aragon	Blockchain consulting,Tokenomics	Polygon, Katana, Curve Finance, Boundless, Yieldbasis, LIDO, Taiko	First-Time	Crypto company specializes in products and custom services for onchain governance, tokenomics, and ownership.
X8C	Community,Content,Design,Events,KOL marketing,Marketing advisory,PR,SEO	frequency.xyz, AVAX Fusion, SUI, NEAR, Kite AI, LIFE AI	First-Time	Marketing & Design focused agency
Co/Unity	Community	Eigenlayer, Gnosis, Ritual, Gaia, Gensyn, Decent, Buck, Gas.zip, Ez-Verse, Pocket-Network	First-Time	Agency that helps Web3 communities thrive by aligning strategy, design, and tech to build purpose driven ecosystems.`;

function categorizeAgency(servicesStr) {
  const s = (servicesStr || '').toLowerCase();
  if (s.includes('tokenomics')) return 'Tokenomics & Governance';
  if (s.includes('kol') || s.includes('influencer')) return 'KOL Marketing & PR';
  if (s.includes('exchange listing') || s.includes('market making')) return 'Exchange Listings & Liquidity';
  if (s.includes('hr') || s.includes('recruitment') || s.includes('staffing')) return 'Talent & HR Recruitment';
  if (s.includes('design') || s.includes('video') || s.includes('creative')) return 'Design, Creative & Media';
  if (s.includes('pr') || s.includes('press')) return 'Public Relations & Comms';
  if (s.includes('consulting') || s.includes('blockchain')) return 'Blockchain & Technical Advisory';
  return 'Growth & Marketing Advisory';
}

async function run() {
  console.log('====================================================');
  console.log('   RAISEQUITY SERVICE PROVIDERS & EXPERTS SEEDER    ');
  console.log('====================================================');

  const lines = RAW_DATA.split('\n').map(l => l.trim()).filter(Boolean);
  console.log(`[1/2] Parsed ${lines.length} service providers & agencies.`);

  const batch = writeBatch(db);
  let count = 0;

  for (const line of lines) {
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 2) continue;

    const name = parts[0];
    const services = (parts[1] || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const clients = (parts[2] || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean)
      .slice(0, 10);
    const status = parts[3] || 'Vetted';
    const bio = parts[4] || `${name} provides institutional Web3 services across ${services.join(', ')}.`;

    const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 24);
    const expertId = `expert_${cleanSlug}`;
    const docRef = doc(db, 'experts', expertId);

    const primaryCategory = categorizeAgency(parts[1]);

    const tags = Array.from(new Set([
      ...services,
      ...clients.slice(0, 5),
      status,
      primaryCategory
    ]));

    batch.set(docRef, {
      id: expertId,
      title: name,
      company: name,
      category: primaryCategory,
      services,
      portfolio: clients,
      vetting_status: status,
      bio,
      tags,
      rate_per_hour: null,
      calendly_url: `https://raisequity.com/services/request?agency=${encodeURIComponent(name)}`,
      is_active: true,
      verified: status === 'Vetted',
      source: 'Verified Partner Ecosystem',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { merge: true });

    count++;
  }

  console.log(`[2/2] Committing ${count} service providers into Firestore "experts" collection...`);
  await batch.commit();

  console.log('====================================================');
  console.log(`🎉 SUCCESS! Seeded ${count} Service Providers & Experts.`);
  console.log('   - Stored in Firestore "experts" collection');
  console.log('   - Ready for Admin & Founder Hub viewing');
  console.log('====================================================');
}

run().catch(err => {
  console.error('Seeder execution error:', err);
  process.exit(1);
});
