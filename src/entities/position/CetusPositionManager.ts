import {
  Transaction,
  TransactionArgument,
  TransactionResult,
} from "@mysten/sui/transactions";
import {
  normalizeStructTag,
  SUI_CLOCK_OBJECT_ID,
  SUI_TYPE_ARG,
} from "@mysten/sui/utils";

import { MaxUint64, Percent } from "@flowx-finance/sdk";

import {
  IncreaseLiquidityOptions,
  DecreaseLiquidityOptions,
  CollectRewardsOptions,
  CollectOptions,
} from "../../types";
import { PositionManager } from "./PositionManager";
import { CETUS_CONFIG } from "../../constants";
import { Position } from "./Position";
import { getLogger } from "../../utils/Logger";

export class CetusPositionManager implements PositionManager {
  private readonly logger = getLogger(module);

  openPosition = (position: Position) => (tx: Transaction) => {
    const { packageId, globalConfigId } = CETUS_CONFIG;

    // Cetus uses I32 type for tick indices similar to FlowX
    const [tickLowerI32, tickUpperI32] = [
      tx.moveCall({
        target: `${packageId}::i32::${
          position.tickLower >= 0 ? `from` : `neg_from`
        }`,
        arguments: [tx.pure.u32(Math.abs(position.tickLower))],
      }),
      tx.moveCall({
        target: `${packageId}::i32::${
          position.tickUpper >= 0 ? `from` : `neg_from`
        }`,
        arguments: [tx.pure.u32(Math.abs(position.tickUpper))],
      }),
    ];

    return tx.moveCall({
      target: `${packageId}::position_manager::open_position`,
      typeArguments: [
        position.amountX.coin.coinType,
        position.amountY.coin.coinType,
      ],
      arguments: [
        tx.object(globalConfigId),
        tx.object(position.pool.id),
        tickLowerI32,
        tickUpperI32,
      ],
    });
  };

  closePosition = (position: Position) => (tx: Transaction) => {
    const { packageId } = CETUS_CONFIG;
    tx.moveCall({
      target: `${packageId}::position_manager::close_position`,
      typeArguments: [
        position.amountX.coin.coinType,
        position.amountY.coin.coinType,
      ],
      arguments: [tx.object(position.id)],
    });
  };

  increaseLiquidity =
    (position: Position, options: IncreaseLiquidityOptions) =>
    (tx: Transaction) => {
      const { amountX: amountXDesired, amountY: amountYDesired } =
        position.mintAmounts;

      const minimumAmounts = {
        amountX: new Percent(1)
          .subtract(options.slippageTolerance)
          .multiply(amountXDesired)
          .asFraction.toFixed(0),
        amountY: new Percent(1)
          .subtract(options.slippageTolerance)
          .multiply(amountYDesired)
          .asFraction.toFixed(0),
      };
      const amountXMin = minimumAmounts.amountX.toString();
      const amountYMin = minimumAmounts.amountY.toString();

      let positionObject: TransactionResult | TransactionArgument;
      if (options.createPosition) {
        positionObject = this.openPosition(position)(tx);
      } else {
        positionObject = tx.object(position.id);
      }

      const [coinAIn, coinBIn] = [
        options.coinXIn ?? tx.splitCoins(tx.gas, [tx.pure.u64(amountXDesired.toString())]),
        options.coinYIn ?? tx.splitCoins(tx.gas, [tx.pure.u64(amountYDesired.toString())]),
      ];

      const { packageId, globalConfigId } = CETUS_CONFIG;
      tx.moveCall({
        target: `${packageId}::position_manager::add_liquidity`,
        typeArguments: [
          position.amountX.coin.coinType,
          position.amountY.coin.coinType,
        ],
        arguments: [
          tx.object(globalConfigId),
          tx.object(position.pool.id),
          positionObject,
          coinAIn,
          coinBIn,
          tx.pure.u64(amountXMin),
          tx.pure.u64(amountYMin),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

      if (options.createPosition) {
        return positionObject as TransactionResult;
      }
    };

  decreaseLiquidity =
    (position: Position, options: DecreaseLiquidityOptions) =>
    (tx: Transaction) => {
      this.logger.debug(
        `Decreasing liquidity for position ${position.id} liquidity: ${position.liquidity.toString()}`
      );
      const { amountX: amountXDesired, amountY: amountYDesired } =
        position.mintAmounts;

      const minimumAmounts = {
        amountX: new Percent(1)
          .subtract(options.slippageTolerance)
          .multiply(amountXDesired)
          .asFraction.toFixed(0),
        amountY: new Percent(1)
          .subtract(options.slippageTolerance)
          .multiply(amountYDesired)
          .asFraction.toFixed(0),
      };

      const amountXMin = minimumAmounts.amountX.toString();
      const amountYMin = minimumAmounts.amountY.toString();

      const { packageId, globalConfigId } = CETUS_CONFIG;
      const removeLiquidityResult = tx.moveCall({
        target: `${packageId}::position_manager::remove_liquidity`,
        typeArguments: [
          position.amountX.coin.coinType,
          position.amountY.coin.coinType,
        ],
        arguments: [
          tx.object(globalConfigId),
          tx.object(position.pool.id),
          tx.object(position.id),
          tx.pure.u128(position.liquidity.toString()),
          tx.pure.u64(amountXMin),
          tx.pure.u64(amountYMin),
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

      return removeLiquidityResult;
    };

  collect =
    (position: Position, options: CollectOptions) => (tx: Transaction) => {
      const { packageId, globalConfigId } = CETUS_CONFIG;

      const collectResult = tx.moveCall({
        target: `${packageId}::position_manager::collect_fee`,
        typeArguments: [
          position.amountX.coin.coinType,
          position.amountY.coin.coinType,
        ],
        arguments: [
          tx.object(globalConfigId),
          tx.object(position.pool.id),
          tx.object(position.id),
          tx.pure.bool(true), // collect_all parameter
        ],
      });

      return collectResult;
    };

  collectReward =
    (position: Position, options: CollectRewardsOptions) =>
    (tx: Transaction) => {
      const { packageId, globalConfigId } = CETUS_CONFIG;
      const collectedReward = tx.moveCall({
        target: `${packageId}::position_manager::collect_reward`,
        typeArguments: [
          position.amountX.coin.coinType,
          position.amountY.coin.coinType,
          options.rewardCoin.coinType,
        ],
        arguments: [
          tx.object(globalConfigId),
          tx.object(position.pool.id),
          tx.object(position.id),
          tx.object(position.pool.id), // vault_index parameter
          tx.pure.bool(true), // collect_all parameter
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

      return collectedReward;
    };
}
