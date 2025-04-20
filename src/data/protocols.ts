import { Protocol, ProtocolCategory } from '../types/protocol';

/**
 * Database of known Solana protocols with their program IDs
 */
export const KNOWN_PROTOCOLS: Protocol[] = [
  // DEX Protocols
  {
    id: 'jupiter',
    name: 'Jupiter',
    description: 'Leading Solana DEX aggregator',
    programIds: [
      'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB', // Jupiter v4
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter v6
    ],
    category: ProtocolCategory.DEX,
    website: 'https://jup.ag',
    addresses: []
  },
  {
    id: 'openbook',
    name: 'OpenBook',
    description: 'Decentralized exchange on Solana',
    programIds: [
      'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX', // OpenBook v2
      '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', // Serum/OpenBook v3
    ],
    category: ProtocolCategory.DEX,
    website: 'https://www.openbook-solana.com',
    addresses: []
  },
  {
    id: 'orca',
    name: 'Orca',
    description: 'AMM and concentrated liquidity DEX',
    programIds: [
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca Whirlpools
      '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP', // Orca v2
    ],
    category: ProtocolCategory.DEX,
    website: 'https://www.orca.so',
    addresses: []
  },
  {
    id: 'raydium',
    name: 'Raydium',
    description: 'AMM and liquidity provider for Serum',
    programIds: [
      '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', // Raydium Liquidity Pool V4
      'RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr', // Raydium Stable Swap
    ],
    category: ProtocolCategory.DEX,
    website: 'https://raydium.io',
    addresses: []
  },

  // Lending Protocols
  {
    id: 'solend',
    name: 'Solend',
    description: 'Algorithmic lending protocol on Solana',
    programIds: [
      'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo', // Solend Main program 
    ],
    category: ProtocolCategory.LENDING,
    website: 'https://solend.fi',
    addresses: []
  },
  {
    id: 'mango',
    name: 'Mango Markets',
    description: 'Decentralized trading platform with margin',
    programIds: [
      'mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDTG52b', // Mango v4
    ],
    category: ProtocolCategory.LENDING,
    website: 'https://mango.markets',
    addresses: []
  },

  // NFT Protocols
  {
    id: 'metaplex',
    name: 'Metaplex',
    description: 'NFT infrastructure on Solana',
    programIds: [
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', // Token Metadata
      'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98', // Metaplex Auction
    ],
    category: ProtocolCategory.NFT,
    website: 'https://www.metaplex.com',
    addresses: []
  },
  {
    id: 'magic-eden',
    name: 'Magic Eden',
    description: 'NFT marketplace',
    programIds: [
      'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K', // Magic Eden v2
    ],
    category: ProtocolCategory.NFT,
    website: 'https://magiceden.io',
    addresses: []
  },

  // Staking Protocols
  {
    id: 'marinade',
    name: 'Marinade Finance',
    description: 'Liquid staking protocol',
    programIds: [
      'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD', // Marinade Staking
    ],
    category: ProtocolCategory.STAKING,
    website: 'https://marinade.finance',
    addresses: []
  },
  {
    id: 'lido',
    name: 'Lido',
    description: 'Liquid staking solution for Solana',
    programIds: [
      'CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi', // Lido Solana
    ],
    category: ProtocolCategory.STAKING,
    website: 'https://solana.lido.fi',
    addresses: []
  },

  // Yield Protocols
  {
    id: 'tulip',
    name: 'Tulip Protocol',
    description: 'Yield aggregator on Solana',
    programIds: [
      'TuLipcqtGVXP9hmUdqvFjVS39r8hMs8W7RJQzWi5uoZ', // Tulip V2
    ],
    category: ProtocolCategory.YIELD,
    website: 'https://tulip.garden',
    addresses: []
  },

  // Bridge Protocols
  {
    id: 'wormhole',
    name: 'Wormhole',
    description: 'Cross-chain bridge for Solana',
    programIds: [
      'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth', // Wormhole Core Bridge
      'wormDTUJ6cPLui2TrK8TiaHSb7cDuvXofr3TKTNhEHc', // Wormhole Token Bridge
    ],
    category: ProtocolCategory.BRIDGE,
    website: 'https://wormhole.com',
    addresses: []
  },

  // Governance Protocols
  {
    id: 'realm',
    name: 'Realms (SPL Governance)',
    description: 'Governance protocol for DAOs on Solana',
    programIds: [
      'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw', // SPL Governance
    ],
    category: ProtocolCategory.GOVERNANCE,
    website: 'https://realms.today',
    addresses: []
  },
];

/**
 * Maps program IDs to protocols for quick lookup
 */
export const PROGRAM_ID_TO_PROTOCOL = new Map<string, Protocol>();

// Initialize the program ID map
KNOWN_PROTOCOLS.forEach(protocol => {
  protocol.programIds.forEach(programId => {
    PROGRAM_ID_TO_PROTOCOL.set(programId, protocol);
  });
});

/**
 * Get protocol from program ID
 */
export function getProtocolFromProgramId(programId: string): Protocol | undefined {
  return PROGRAM_ID_TO_PROTOCOL.get(programId);
}

/**
 * Get all protocols for a specific category
 */
export function getProtocolsByCategory(category: ProtocolCategory): Protocol[] {
  return KNOWN_PROTOCOLS.filter(protocol => protocol.category === category);
}