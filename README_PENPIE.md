# Pendle Merkle Script - Internal Fork

This repository is forked from [pendle-finance/pendle-merkle-script](https://github.com/pendle-finance/pendle-merkle-script) for our team's internal reward calculation operations.

## Usage

### Fully Automated (Recommended)
The repository is configured for **full automation**:
- **Data sync**: Every Monday at UTC 00:00 (syncs with Pendle team updates)
- **Reward update**: Automatically runs immediately after successful sync completion
- **No manual intervention needed** under normal circumstances

### Manual Execution (When Needed)
If you need to run the reward update manually:
```bash
yarn hardhat run scripts/main-penpie.ts
```

The script will automatically:
- Calculate reward distributions
- Upload JSON data to S3
- Upload CSV data to Dune Analytics

## Automation Overview

**Automated Pipeline:**
1. **Monday 00:00 UTC**: Sync with upstream Pendle repository
2. **Immediately after sync completion**: Automatically run reward calculations (if sync successful)
3. **Data Upload**: Results automatically uploaded to S3 and Dune Analytics
4. **Monitoring**: Check Actions tab for execution status

**Manual Triggers Available:**
- Reward update can be manually triggered from Actions tab anytime
- Manual sync available if immediate updates needed

## Manual Sync (When Needed)

If you need to manually sync with the upstream repository:

```bash
# Add upstream remote (one-time setup)
git remote add upstream https://github.com/pendle-finance/pendle-merkle-script.git

# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Development Guidelines

**⚠️ Critical Rule: Never modify original Pendle files**

- Create new files for custom functionality
- Use clear naming conventions (e.g., `custom-*.js`, `team-*.ts`)
- Keep all team-specific code in separate files
- This prevents merge conflicts during automatic sync

## Troubleshooting

- **Check automation status**: Actions tab → View both "Sync Fork" and "Auto Reward Data Update" workflows
- **If sync fails**: Reward update won't run automatically; manual intervention needed
- **If reward update fails**: Check Actions logs, then run manually if needed
- **For complex issues**: Contact team lead

**Common Issues:**
- Missing AWS credentials or OIDC configuration
- Network connectivity issues
- Data format changes from upstream

## Important Notes

- This fork is for internal use only
- No contributions back to upstream repository
- Automatic sync prevents most conflicts when development guidelines are followed
- All AWS operations use OIDC authentication for security