import { FetchOptions, SimpleAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";

const MODULE1 = "0x9f17a5d7cd90181a34a2011e900b440d71e2c011";
const USDT0 = "0xe7cd86e13AC4309349F30B3435a9d337750fC82D";

// Revenue is 3% of the deposited volume.
const FEE_RATE_BPS = 300n; // 3% expressed in basis points (300 / 10000)

const fetch = async (options: FetchOptions) => {
  const dailyFees = options.createBalances();
  const dailyVolume = options.createBalances();

  const logs = await options.getLogs({
    target: MODULE1,
    eventAbi: "event DepositReceived(address indexed sender, uint256 amount, uint256 feeAmount, uint256 netAmount, uint256 newContractBalance)",
  });

  for (const log of logs) {
    const amount = BigInt(log.amount);
    dailyVolume.add(USDT0, amount);
    dailyFees.add(USDT0, (amount * FEE_RATE_BPS) / 10000n);
  }

  return {
    dailyVolume,
    dailyFees,
    dailyRevenue: dailyFees,
    dailyProtocolRevenue: dailyFees,
  };
};

const adapter: SimpleAdapter = {
  version: 2,
  pullHourly: true,
  methodology: {
    Volume: "Total amount deposited through the contract.",
    Fees: "3% fee charged on every deposit.",
    Revenue: "Same as fees - no supply-side split.",
    ProtocolRevenue: "Same as fees - no supply-side split.",
  },
  adapter: {
    [CHAIN.FLARE]: {
      fetch,
      start: '2026-06-12',
    },
  },
};

export default adapter;
