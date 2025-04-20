import { Transaction, ProtocolInteraction, TransactionType } from '../types/transaction';
import { Wallet, ProtocolInteractionSummary, WalletType } from '../types/wallet';
import { Protocol, ProtocolCategory } from '../types/protocol';
import { KNOWN_PROTOCOLS, PROGRAM_ID_TO_PROTOCOL } from '../data/protocols';

/**
 * Get all protocols from the database
 */
export function getAllProtocols(): Protocol[] {
  return KNOWN_PROTOCOLS;
}

/**
 * Analyzes transaction data to detect protocol interactions
 */
export function detectProtocolInteractions(transaction: Transaction): ProtocolInteraction[] {
  if (!transaction.programIds || transaction.programIds.length === 0) {
    return [];
  }

  console.log('Detecting protocols for programIds:', transaction.programIds);
  
  const interactions: ProtocolInteraction[] = [];

  // Check each program ID against our protocol database
  for (const programId of transaction.programIds) {
    const protocol = PROGRAM_ID_TO_PROTOCOL.get(programId);
    if (protocol) {
      console.log('Protocol detected:', protocol.name, 'for programId:', programId);
      
      // Protocol found, create an interaction record
      interactions.push({
        protocolId: protocol.id,
        protocolName: protocol.name,
        programId: programId,
        category: protocol.category,
        action: inferProtocolAction(transaction, protocol),
        description: generateInteractionDescription(transaction, protocol),
      });
    }
  }

  return interactions;
}

/**
 * Analyze wallet activity to determine protocol affiliations and interactions
 */
export function analyzeWalletProtocolInteractions(
  wallet: Wallet, 
  transactions: Transaction[]
): Wallet {
  if (!transactions || transactions.length === 0) {
    return wallet;
  }

  const protocolInteractions = new Map<string, ProtocolInteractionSummary>();
  let dominantProtocolId: string | undefined;
  let dominantProtocolName: string | undefined;
  let dominantProtocolCategory: string | undefined;
  let highestInteractionCount = 0;

  // Process each transaction
  transactions.forEach(tx => {
    // Skip if no protocols detected
    if (!tx.protocols || tx.protocols.length === 0) {
      return;
    }

    // Count interactions with each protocol
    tx.protocols.forEach(protocol => {
      const existing = protocolInteractions.get(protocol.protocolId);
      
      if (existing) {
        existing.interactionCount++;
        if (tx.timestamp > existing.lastInteraction) {
          existing.lastInteraction = tx.timestamp;
        }
      } else {
        protocolInteractions.set(protocol.protocolId, {
          protocolId: protocol.protocolId,
          protocolName: protocol.protocolName,
          category: protocol.category,
          interactionCount: 1,
          lastInteraction: tx.timestamp,
        });
      }

      // Track the dominant protocol (most interactions)
      const currentCount = (protocolInteractions.get(protocol.protocolId)?.interactionCount || 0);
      if (currentCount > highestInteractionCount) {
        highestInteractionCount = currentCount;
        dominantProtocolId = protocol.protocolId;
        dominantProtocolName = protocol.protocolName;
        dominantProtocolCategory = protocol.category;
      }
    });
  });

  console.log('Protocol interactions for wallet:', wallet.address, Array.from(protocolInteractions.values()));

  // Determine if this is a protocol-affiliated wallet
  let updatedWalletType = wallet.type;
  if (
    highestInteractionCount > 5 || // Arbitrary threshold, can be adjusted
    (transactions.length > 0 && highestInteractionCount / transactions.length > 0.7) // 70% of transactions involve the same protocol
  ) {
    // This wallet is likely affiliated with the protocol
    updatedWalletType = mapProtocolCategoryToWalletType(dominantProtocolCategory as ProtocolCategory);
  }

  // Create the enhanced wallet object
  return {
    ...wallet,
    type: updatedWalletType,
    protocolId: dominantProtocolId,
    protocolName: dominantProtocolName,
    protocolCategory: dominantProtocolCategory,
    protocolInteractions: Array.from(protocolInteractions.values()),
  };
}

/**
 * Map protocol categories to specific wallet types
 */
function mapProtocolCategoryToWalletType(category: ProtocolCategory): WalletType {
  switch (category) {
    case ProtocolCategory.DEX:
      return WalletType.DEX;
    case ProtocolCategory.LENDING:
      return WalletType.LENDING;
    case ProtocolCategory.NFT:
      return WalletType.NFT_MARKETPLACE;
    case ProtocolCategory.STAKING:
      return WalletType.STAKING;
    case ProtocolCategory.YIELD:
      return WalletType.YIELD;
    case ProtocolCategory.BRIDGE:
      return WalletType.BRIDGE;
    case ProtocolCategory.GOVERNANCE:
      return WalletType.GOVERNANCE;
    default:
      return WalletType.PROTOCOL;
  }
}

/**
 * Infer what action is being performed on a protocol based on transaction data
 */
function inferProtocolAction(transaction: Transaction, protocol: Protocol): string | undefined {
  // This is a simplistic implementation that can be expanded
  switch (protocol.category) {
    case ProtocolCategory.DEX:
      // Check if it's a swap or liquidity operation
      if (transaction.type === TransactionType.SWAP) {
        return 'swap';
      } else if (transaction.type === TransactionType.LIQUIDITY_ADD) {
        return 'add_liquidity';
      } else if (transaction.type === TransactionType.LIQUIDITY_REMOVE) {
        return 'remove_liquidity';
      }
      break;
    
    case ProtocolCategory.LENDING:
      // Check for lending actions
      if (transaction.type === TransactionType.LENDING_DEPOSIT) {
        return 'deposit';
      } else if (transaction.type === TransactionType.LENDING_WITHDRAW) {
        return 'withdraw';
      } else if (transaction.type === TransactionType.LENDING_BORROW) {
        return 'borrow';
      } else if (transaction.type === TransactionType.LENDING_REPAY) {
        return 'repay';
      }
      break;
    
    case ProtocolCategory.STAKING:
      if (transaction.type === TransactionType.STAKE) {
        return 'stake';
      } else if (transaction.type === TransactionType.UNSTAKE) {
        return 'unstake';
      }
      break;

    // Add more cases for other protocol categories
  }

  // Default case
  return undefined;
}

/**
 * Generate a human-readable description of a protocol interaction
 */
function generateInteractionDescription(transaction: Transaction, protocol: Protocol): string | undefined {
  const action = inferProtocolAction(transaction, protocol);
  
  if (!action) {
    return `Interaction with ${protocol.name}`;
  }

  switch (action) {
    case 'swap':
      return `Token swap on ${protocol.name}`;
    case 'add_liquidity':
      return `Added liquidity to ${protocol.name}`;
    case 'remove_liquidity':
      return `Removed liquidity from ${protocol.name}`;
    case 'deposit':
      return `Deposited assets to ${protocol.name}`;
    case 'withdraw':
      return `Withdrew assets from ${protocol.name}`;
    case 'borrow':
      return `Borrowed assets from ${protocol.name}`;
    case 'repay':
      return `Repaid loan on ${protocol.name}`;
    case 'stake':
      return `Staked tokens with ${protocol.name}`;
    case 'unstake':
      return `Unstaked tokens from ${protocol.name}`;
    default:
      return `Interaction with ${protocol.name}`;
  }
}

/**
 * Get protocols by category
 */
export function getProtocolsByCategory(category: ProtocolCategory): Protocol[] {
  return KNOWN_PROTOCOLS.filter(protocol => protocol.category === category);
}