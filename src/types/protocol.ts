export interface Protocol {
    id: string;
    name: string;
    description?: string;
    programIds: string[];
    category: ProtocolCategory;
    website?: string;
    addresses: string[];
  }
  
  export enum ProtocolCategory {
    DEX = 'dex',
    LENDING = 'lending',
    YIELD = 'yield',
    NFT = 'nft',
    STAKING = 'staking',
    BRIDGE = 'bridge',
    GOVERNANCE = 'governance',
    OTHER = 'other',
  }