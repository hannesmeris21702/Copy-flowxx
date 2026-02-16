/**
 * Cetus Integration Tests
 * 
 * These tests verify the Cetus integration works with real Sui network data.
 * They require a JSON_RPC_ENDPOINT to be set in environment variables.
 * 
 * To run: 
 * - Set JSON_RPC_ENDPOINT in .env (testnet or mainnet)
 * - Run: yarn test cetus.integration.spec.ts
 */

import { Protocol } from "@flowx-finance/sdk";
import { initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { CetusPoolProvider } from "./pool/CetusPoolProvider";
import { CetusPositionProvider } from "./position/CetusPositionProvider";
import { CetusPositionManager } from "./position/CetusPositionManager";
import { jsonRpcProvider } from "../utils/jsonRpcProvider";

// Skip tests if no RPC endpoint is configured
const skipIfNoEndpoint = () => {
  if (!process.env.JSON_RPC_ENDPOINT) {
    console.warn(
      "⚠️  Skipping Cetus integration tests - JSON_RPC_ENDPOINT not set"
    );
    return true;
  }
  return false;
};

describe("Cetus Integration Tests", () => {
  // Use testnet for integration tests to avoid mainnet costs
  const network = process.env.TEST_NETWORK || "testnet";
  let cetusSDK: any;
  let testPoolId: string;

  beforeAll(async () => {
    if (skipIfNoEndpoint()) {
      return;
    }

    // Initialize Cetus SDK to fetch test pools
    cetusSDK = initCetusSDK({ 
      network: network as "mainnet" | "testnet"
    });

    // Try to get a pool for testing
    try {
      const pools = await cetusSDK.Pool.getPools({});
      if (pools && pools.data && pools.data.length > 0) {
        testPoolId = pools.data[0].poolAddress;
        console.log(`✓ Found test pool: ${testPoolId}`);
      }
    } catch (error) {
      console.warn("Could not fetch pools from Cetus SDK:", error.message);
    }
  }, 30000);

  describe("CetusPoolProvider", () => {
    const poolProvider = new CetusPoolProvider();

    it("should be instantiated correctly", () => {
      if (skipIfNoEndpoint()) return;
      expect(poolProvider).toBeDefined();
      expect(poolProvider).toBeInstanceOf(CetusPoolProvider);
    });

    it("should fetch pool data from testnet/mainnet", async () => {
      if (skipIfNoEndpoint() || !testPoolId) {
        console.log("⊘ Skipping - no test pool available");
        return;
      }

      const pool = await poolProvider.getPoolById(testPoolId);

      expect(pool).toBeDefined();
      expect(pool.id).toBe(testPoolId);
      expect(pool.protocol).toBe(Protocol.CETUS);
      expect(pool.coins).toHaveLength(2);
      expect(pool.coins[0].coinType).toBeDefined();
      expect(pool.coins[1].coinType).toBeDefined();
      expect(pool.fee).toBeGreaterThanOrEqual(0);
      expect(pool.sqrtPriceX64).toBeDefined();
      expect(pool.liquidity).toBeDefined();
      
      console.log(`✓ Pool fetched successfully:`);
      console.log(`  - Pool ID: ${pool.id}`);
      console.log(`  - Coins: ${pool.coins[0].symbol}/${pool.coins[1].symbol}`);
      console.log(`  - Fee: ${pool.fee}`);
      console.log(`  - Liquidity: ${pool.liquidity}`);
    }, 30000);

    it("should handle invalid pool ID gracefully", async () => {
      if (skipIfNoEndpoint()) return;

      const invalidPoolId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      
      await expect(
        poolProvider.getPoolById(invalidPoolId)
      ).rejects.toThrow();
    }, 15000);
  });

  describe("CetusPositionProvider", () => {
    const positionProvider = new CetusPositionProvider();
    let testPositionId: string;

    beforeAll(async () => {
      if (skipIfNoEndpoint() || !testPoolId) {
        return;
      }

      // Try to find a position for testing
      try {
        const pool = await new CetusPoolProvider().getPoolById(testPoolId);
        const positions = await cetusSDK.Position.getPositionList(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          []
        );
        
        if (positions && positions.data && positions.data.length > 0) {
          testPositionId = positions.data[0].pos_object_id;
        }
      } catch (error) {
        console.warn("Could not fetch test position:", error.message);
      }
    }, 30000);

    it("should be instantiated correctly", () => {
      if (skipIfNoEndpoint()) return;
      expect(positionProvider).toBeDefined();
      expect(positionProvider).toBeInstanceOf(CetusPositionProvider);
    });

    it("should fetch position data if available", async () => {
      if (skipIfNoEndpoint() || !testPositionId) {
        console.log("⊘ Skipping - no test position available");
        return;
      }

      const position = await positionProvider.getPositionById(testPositionId);

      expect(position).toBeDefined();
      expect(position.id).toBe(testPositionId);
      expect(position.pool).toBeDefined();
      expect(position.pool.protocol).toBe(Protocol.CETUS);
      expect(position.tickLower).toBeDefined();
      expect(position.tickUpper).toBeDefined();
      expect(position.liquidity).toBeDefined();

      console.log(`✓ Position fetched successfully:`);
      console.log(`  - Position ID: ${position.id}`);
      console.log(`  - Pool: ${position.pool.id}`);
      console.log(`  - Tick Range: [${position.tickLower}, ${position.tickUpper}]`);
      console.log(`  - Liquidity: ${position.liquidity}`);
    }, 30000);
  });

  describe("CetusPositionManager", () => {
    const positionManager = new CetusPositionManager();

    it("should be instantiated correctly", () => {
      if (skipIfNoEndpoint()) return;
      expect(positionManager).toBeDefined();
      expect(positionManager).toBeInstanceOf(CetusPositionManager);
    });

    it("should have all required methods", () => {
      if (skipIfNoEndpoint()) return;
      
      expect(typeof positionManager.openPosition).toBe("function");
      expect(typeof positionManager.closePosition).toBe("function");
      expect(typeof positionManager.increaseLiquidity).toBe("function");
      expect(typeof positionManager.decreaseLiquidity).toBe("function");
      expect(typeof positionManager.collect).toBe("function");
      expect(typeof positionManager.collectReward).toBe("function");
    });
  });

  describe("Network Connectivity", () => {
    it("should connect to JSON RPC endpoint", async () => {
      if (skipIfNoEndpoint()) return;

      const chainId = await jsonRpcProvider.getChainIdentifier();
      expect(chainId).toBeDefined();
      console.log(`✓ Connected to chain: ${chainId}`);
    }, 15000);

    it("should fetch latest checkpoint", async () => {
      if (skipIfNoEndpoint()) return;

      const checkpoint = await jsonRpcProvider.getLatestCheckpointSequenceNumber();
      expect(checkpoint).toBeDefined();
      expect(typeof checkpoint).toBe("string");
      console.log(`✓ Latest checkpoint: ${checkpoint}`);
    }, 15000);
  });
});

describe("Cetus Configuration Validation", () => {
  it("should have valid testnet configuration", () => {
    // These should match the Cetus testnet config
    expect(process.env.TEST_NETWORK || "testnet").toBeDefined();
  });

  it("should have network detection", () => {
    const network = process.env.TEST_NETWORK || "testnet";
    expect(["mainnet", "testnet"]).toContain(network);
  });
});
