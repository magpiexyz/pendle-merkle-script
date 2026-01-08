# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an internal fork of [pendle-finance/pendle-merkle-script](https://github.com/pendle-finance/pendle-merkle-script) for calculating Pendle merkle reward distributions. The repository queries user rewards from vePendle voting and distributes them proportionally based on voting power.

**Critical Rule**: Never modify original Pendle files (`scripts/data/*`, `scripts/helper/*`, `scripts/main.ts`). These are maintained upstream and synced automatically. All custom functionality lives in separate `-penpie` suffixed files.

## Essential Commands

### Running Scripts

```bash
# Run the internal reward calculation script (main use case)
yarn hardhat run scripts/main-penpie.ts

# Run the upstream example script (for testing/reference)
yarn hardhat run scripts/main.ts
```

### Development

```bash
# Install dependencies
yarn install

# TypeScript compilation (via hardhat)
yarn hardhat compile
```

## Architecture

### Core Data Flow

1. **Data Ingestion**: `scripts/data/swap-result.json` contains raw reward distribution data, updated by upstream Pendle team
2. **Position Querying**: GraphQL queries fetch voting positions and vePendle lock positions from Pendle's subgraph
3. **Reward Calculation**: Proportional distribution based on voting power at specific week timestamps
4. **Export**: Results uploaded to S3 (JSON) and Dune Analytics (CSV)

### Key Components

#### `scripts/helper/` (Upstream - Do Not Modify)
- **queryPositions.ts**: GraphQL queries for voting/locking events from Pendle subgraph
  - `queryVotePositions()`: Fetches pool voting data
  - `queryLockPositions()`: Fetches vePendle lock data
  - `queryAllPositions()`: Combines both datasets
- **types.ts**: Core data structures
  - `VeBalanceSnapshot`: Point-in-time voting power snapshot
  - `UserVeBalanceList`: Time-series of user voting power with efficient `valueAt()` lookup
  - `PoolsData`: Nested structure `[pool][user] => UserVeBalanceList`
- **misc.ts**: Utilities for week timestamp calculations and BigNumber conversions

#### `scripts/helper-penpie.ts` (Custom - Safe to Modify)
Internal utilities for data export:
- **S3 Operations**: `loadFromS3()`, `uploadToS3()` for JSON storage
- **Dune Integration**: `uploadCSVToDune()` for analytics
- **Data Conversion**: `arrayToCSV()`, `arrayToCSVString()` for CSV generation

#### Main Scripts
- **scripts/main.ts** (Upstream): Example script for querying single account rewards
- **scripts/main-penpie.ts** (Custom): Production script with S3/Dune upload, handles week ranges

### Reward Distribution Logic

The algorithm distributes rewards based on proportional voting power:

```typescript
// For each pool-week pair in swap-result.json:
1. Calculate total voting power at week timestamp
2. If pool has zero votes, fallback to vePendle token holders
3. Calculate user's share: (userVotingPower / totalVotingPower) * poolReward
4. Aggregate rewards across pools and weeks
```

**Key Constants**:
- `WTIME_INF = 2^31 - 1`: Used to query all historical positions
- `VEPENDLE = 0x4f30a9d41b80ecc5b94306ab4364951ae3170210`: Fallback distribution address
- Week timestamps: Unix timestamp at start of 7-day period (604800 seconds)

### Data Structures

**`VeBalanceSnapshot`**: Linear decay model for voting power
- `bias`: Initial voting power
- `slope`: Decay rate per second
- `valueAt(time)`: Returns `max(0, bias - slope * time)`

**`UserVeBalanceList`**: Optimized time-series lookup
- Maintains snapshots in chronological order
- Uses binary search-style index tracking for efficient `valueAt()` queries
- Handles weekly reward lookups across multiple epochs

## Automation

> **💡 提示**: 如果想要真正的即時同步（當上游更新時立即觸發），可以考慮使用 Pull App。詳細設置指南請參考 [docs/PULL_APP_SETUP.md](docs/PULL_APP_SETUP.md)。

### GitHub Actions Workflows

**Auto Sync** (`.github/workflows/auto-sync.yml`):
- **Schedule**: Every 6 hours on Mon/Wed/Fri (`cron: '0 */6 * * 1,3,5'`)
- **Purpose**: Merges entire upstream repository (not just data files)
- **Process**:
  1. Fetches from `pendle-finance/pendle-merkle-script`
  2. Compares commit SHAs to detect changes
  3. Performs `git merge upstream/main --no-edit` if updates exist
  4. Pushes merged changes to origin
- **Trigger**: Also manually dispatchable via Actions tab
- **Important**: This syncs ALL upstream changes, not just `swap-result.json`

**Auto Reward Update** (`.github/workflows/auto-reward-update.yml`):
- **Triggers**:
  1. Automatically after "Auto Sync from Pendle" workflow completes successfully
  2. Manual dispatch via Actions tab
- **Authentication**: AWS OIDC (role: `arn:aws:iam::784497868863:role/pendle-merkle-updater`)
- **Process**:
  1. Installs dependencies (`yarn install --frozen-lockfile`)
  2. Configures AWS credentials via OIDC
  3. Runs `yarn hardhat run scripts/main-penpie.ts`
  4. Uploads results to S3 bucket `automa-data` and Dune Analytics
  5. Sends Telegram notification with reward summary
- **Conditional Execution**: Only runs if sync succeeded OR manually triggered
- **Region**: us-west-1
- **Notifications**: Sends detailed summary to Telegram group (see [docs/TELEGRAM_NOTIFICATION_SETUP.md](docs/TELEGRAM_NOTIFICATION_SETUP.md))

### Archive Data

The `archive_data/` directory contains historical exports:
- Format: `vependle_fee_{startWeek}_{endWeek}.{json|csv}`
- Used for record-keeping and data recovery
- Not used in active calculations

## External Dependencies

- **Hardhat**: Ethereum development environment (network forking for queries)
- **ethers.js v5**: Blockchain interaction and BigNumber handling
- **graphql-request**: Queries Pendle's subgraph at `api.subgraph.ormilabs.com`
- **AWS SDK v3**: S3 client for data storage
- **Dune Analytics SDK**: CSV upload to analytics platform

## Network Configuration

Hardhat is configured to fork Ethereum mainnet via Ankr RPC:
- Network: `mainnet` (chainId: 1)
- RPC: `https://rpc.ankr.com/eth`
- Used for contract interactions during reward calculation

## Modifying Reward Logic

When customizing reward calculations:

1. **Create new files** with `-penpie` suffix (e.g., `custom-logic-penpie.ts`)
2. **Import from `helper/`** for core functionality (positions, types, misc)
3. **Use `helper-penpie.ts`** for export utilities
4. **Test with `main.ts`** logic as reference before modifying `main-penpie.ts`
5. **Never change** `scripts/data/*` or `scripts/helper/*` to avoid merge conflicts

## Common Troubleshooting

**Subgraph Query Failures**: The GraphQL endpoint uses pagination (1000 items/query). If queries fail, check:
- Network connectivity to `api.subgraph.ormilabs.com`
- `syncingIndex` pagination in `queryPositions.ts`

**Timestamp Mismatches**: Week timestamps must align to 604800-second boundaries. Use `getWeekStartTimestamp()` and `getWeekEndTimestamp()` from `misc.ts`.

**AWS Upload Failures**: Ensure GitHub Actions has OIDC trust relationship configured with AWS role `arn:aws:iam::784497868863:role/pendle-merkle-updater`.
