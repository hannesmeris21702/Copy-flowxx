# Cetus Integration Testing Guide

This document provides instructions for testing the Cetus protocol integration with real Sui network data (mainnet or testnet).

## Prerequisites

1. **Node.js** version 18 or higher
2. **Yarn** package manager
3. **Sui RPC Endpoint** access (testnet or mainnet)
4. **Environment Configuration** properly set up

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build the Project

```bash
yarn build
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
# Required: Sui RPC endpoint
JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443

# Optional: Specify network for tests (defaults to testnet)
TEST_NETWORK=testnet

# For logging
LOG_LEVEL=info
```

**Available RPC Endpoints:**

- **Testnet**: `https://fullnode.testnet.sui.io:443`
- **Mainnet**: `https://fullnode.mainnet.sui.io:443`

## Running Tests

### Option 1: Integration Tests (Jest)

Run the automated integration tests:

```bash
# Run all Cetus integration tests
yarn test cetus.integration.spec.ts

# Or run with pattern matching
yarn test:integration
```

**What it tests:**
- ✅ CetusPoolProvider can fetch pool data
- ✅ CetusPositionProvider can fetch position data
- ✅ CetusPositionManager methods are available
- ✅ Network connectivity
- ✅ Configuration validation

### Option 2: Manual Test Script

Run the interactive test script:

```bash
# Test with testnet (default)
node scripts/test-cetus-integration.js

# Test with mainnet
node scripts/test-cetus-integration.js mainnet
```

**What it does:**
1. Initializes Cetus SDK
2. Fetches real pools from the network
3. Tests CetusPoolProvider with actual pool data
4. Verifies CetusPositionManager instantiation
5. Validates all required methods exist

## Test Scenarios

### 1. Pool Provider Test

Tests that the CetusPoolProvider can:
- Connect to the Sui network
- Fetch pool data by ID
- Parse pool information correctly
- Extract coin types, fees, liquidity, etc.

**Example Output:**
```
✓ Pool fetched successfully:
  - Pool ID: 0xabc123...
  - Coins: SUI/USDC
  - Fee: 500
  - Liquidity: 1234567890
```

### 2. Position Provider Test

Tests that the CetusPositionProvider can:
- Fetch position data by ID
- Find the largest position for an owner
- Parse tick ranges and liquidity correctly

**Note:** Requires actual position IDs from the network.

### 3. Position Manager Test

Verifies that CetusPositionManager has all required methods:
- `openPosition` - Create new positions
- `closePosition` - Close existing positions
- `increaseLiquidity` - Add liquidity to positions
- `decreaseLiquidity` - Remove liquidity from positions
- `collect` - Collect trading fees
- `collectReward` - Collect reward tokens

### 4. Network Connectivity Test

Verifies connection to Sui network:
- Chain identifier validation
- Latest checkpoint retrieval
- RPC endpoint responsiveness

## Troubleshooting

### Issue: "JSON_RPC_ENDPOINT not set"

**Solution:** Create a `.env` file with the RPC endpoint:
```env
JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443
```

### Issue: "Could not load compiled providers"

**Solution:** Build the project first:
```bash
yarn build
```

### Issue: "No pools found"

**Possible Causes:**
1. Network connection issues
2. RPC endpoint is down
3. Wrong network specified

**Solution:** 
- Check your internet connection
- Verify RPC endpoint is correct
- Try a different RPC endpoint

### Issue: "Failed to fetch pool data"

**Possible Causes:**
1. Invalid pool ID
2. Pool doesn't exist on the network
3. Network issues

**Solution:**
- Use the test script to fetch valid pool IDs
- Verify you're using the correct network (testnet vs mainnet)
- Check RPC endpoint health

### Issue: Integration tests skip

**Cause:** No JSON_RPC_ENDPOINT environment variable set

**Solution:** Set the environment variable before running tests:
```bash
export JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443
yarn test cetus.integration.spec.ts
```

## Testnet vs Mainnet

### Testnet
- **Pros**: Free to use, no real funds required
- **Cons**: May be reset periodically, pool IDs can change
- **Use for**: Development and testing
- **RPC**: `https://fullnode.testnet.sui.io:443`

### Mainnet  
- **Pros**: Stable, permanent pools
- **Cons**: Real funds required for transactions
- **Use for**: Production validation
- **RPC**: `https://fullnode.mainnet.sui.io:443`

## Finding Pool IDs

### Using Cetus SDK

```javascript
const { initCetusSDK } = require('@cetusprotocol/cetus-sui-clmm-sdk');

const sdk = initCetusSDK({ network: 'testnet' });
const pools = await sdk.Pool.getPools({ limit: 10 });

pools.data.forEach(pool => {
  console.log(`${pool.coin_a_symbol}/${pool.coin_b_symbol}: ${pool.poolAddress}`);
});
```

### Using Cetus App

Visit the Cetus DEX and copy pool addresses:
- **Testnet**: Check Cetus documentation for testnet pools
- **Mainnet**: https://app.cetus.zone/

## Expected Test Results

### Successful Run

```
🔧 Cetus Integration Test
========================
Network: testnet
RPC Endpoint: https://fullnode.testnet.sui.io:443

1️⃣  Initializing Cetus SDK...
   ✓ SDK initialized

2️⃣  Fetching Cetus pools...
   ✓ Found 5 pools

3️⃣  Testing CetusPoolProvider...
   Pool ID: 0x...
   ✓ Pool fetched successfully:
     - Protocol: CETUS
     - Coins: SUI/USDC
     - Fee Rate: 500
     - Tick Current: 12345
     - Liquidity: 1234567890
     - Sqrt Price: 79228162514264337593543950336

4️⃣  Testing CetusPositionManager...
   ✓ Position manager instantiated
   ✓ Available methods:
     - openPosition
     - closePosition
     - increaseLiquidity
     - decreaseLiquidity
     - collect
     - collectReward

5️⃣  Testing CetusPositionProvider...
   ✓ Position provider instantiated
   Note: Position fetching requires actual position IDs

✅ All tests passed!

Summary:
--------
✓ Cetus SDK integration working
✓ CetusPoolProvider can fetch pool data
✓ CetusPositionProvider instantiated correctly
✓ CetusPositionManager has all required methods

🎉 Cetus integration is ready for use!
```

## CI/CD Integration

To run these tests in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Cetus Integration Tests
  env:
    JSON_RPC_ENDPOINT: https://fullnode.testnet.sui.io:443
    TEST_NETWORK: testnet
  run: |
    yarn install
    yarn build
    yarn test cetus.integration.spec.ts
```

## Next Steps

After successful testing:

1. **Configure for Production**: Update `.env` with mainnet RPC endpoint
2. **Set Protocol**: Set `PROTOCOL=CETUS` in `.env`
3. **Set Target Pool**: Find a Cetus pool ID and set `TARGET_POOL`
4. **Add Private Key**: Set `PRIVATE_KEY` for transaction signing
5. **Start Bot**: Run `yarn start` to begin rebalancing

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Cetus documentation: https://cetus-1.gitbook.io/cetus-developer-docs
3. Check Sui network status: https://status.sui.io/
4. Review project README for general setup instructions

## Security Notes

⚠️ **Important Security Considerations:**

- Never commit `.env` files with real private keys
- Use testnet for initial testing
- Start with small positions on mainnet
- Monitor gas costs and slippage
- Test rebalancing logic thoroughly before production use
- Keep RPC endpoints secure
- Use environment variables for sensitive data
