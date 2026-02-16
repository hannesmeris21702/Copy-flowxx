# Cetus Integration Quick Test Guide

## Quick Start

```bash
# 1. Set environment
export JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443

# 2. Install & build
yarn install && yarn build

# 3. Run test
node scripts/test-cetus-integration.js testnet
```

## Expected Output (Success)

```
🔧 Cetus Integration Test
========================
Network: testnet
RPC Endpoint: https://fullnode.testnet.sui.io:443

1️⃣  Initializing Cetus SDK...
   ✓ SDK initialized

2️⃣  Fetching Cetus pools...
   ✓ Found X pools

3️⃣  Testing CetusPoolProvider...
   Pool ID: 0x...
   ✓ Pool fetched successfully

4️⃣  Testing CetusPositionManager...
   ✓ Position manager instantiated
   ✓ Available methods: (6 methods listed)

5️⃣  Testing CetusPositionProvider...
   ✓ Position provider instantiated

✅ All tests passed!
🎉 Cetus integration is ready for use!
```

## Common Issues

### "JSON_RPC_ENDPOINT not set"
```bash
export JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443
```

### "Could not load compiled providers"
```bash
yarn build
```

### "No pools found"
- Check network connectivity
- Try mainnet: `node scripts/test-cetus-integration.js mainnet`
- Use mainnet RPC: `export JSON_RPC_ENDPOINT=https://fullnode.mainnet.sui.io:443`

## Testing Checklist

- [ ] Dependencies installed (`yarn install`)
- [ ] Project built (`yarn build`)
- [ ] RPC endpoint set (environment variable)
- [ ] Network accessible (internet connection)
- [ ] Test script runs successfully
- [ ] Pool data fetches correctly
- [ ] All providers instantiate
- [ ] No errors in output

## Networks

### Testnet
```bash
export JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443
node scripts/test-cetus-integration.js testnet
```

### Mainnet
```bash
export JSON_RPC_ENDPOINT=https://fullnode.mainnet.sui.io:443
node scripts/test-cetus-integration.js mainnet
```

## What Gets Tested

✅ Cetus SDK initialization  
✅ Pool discovery and fetching  
✅ CetusPoolProvider functionality  
✅ CetusPositionProvider setup  
✅ CetusPositionManager methods  
✅ Network connectivity  
✅ Configuration validity  

## Full Documentation

For complete testing guide: [TESTING_CETUS.md](./TESTING_CETUS.md)

## Integration Test (Jest)

```bash
# Automated tests
export JSON_RPC_ENDPOINT=https://fullnode.testnet.sui.io:443
yarn test cetus.integration.spec.ts
```

## Next Steps After Testing

1. Configure `.env` for production:
   ```env
   PROTOCOL=CETUS
   TARGET_POOL=0x<your_pool_id>
   PRIVATE_KEY=<your_private_key>
   JSON_RPC_ENDPOINT=https://fullnode.mainnet.sui.io:443
   ```

2. Find a Cetus pool: https://app.cetus.zone/

3. Start the bot:
   ```bash
   yarn start
   ```

## Support

- Check [TESTING_CETUS.md](./TESTING_CETUS.md) for detailed troubleshooting
- Review [README.md](./README.md) for general configuration
- Cetus docs: https://cetus-1.gitbook.io/cetus-developer-docs
