# Pendle Merkle Script - Internal Fork

This repository is forked from [pendle-finance/pendle-merkle-script](https://github.com/pendle-finance/pendle-merkle-script) for our team's internal reward calculation operations.

## Usage

This repository is used to update reward data:

1. **Ensure data is up-to-date**: Check if automatic sync is current, or manually sync if needed
2. **Run the reward update script**:
   ```bash
   yarn hardhat run scripts/main-penpie.ts
   ```

The script will automatically:
- Calculate reward distributions
- Upload JSON data to S3
- Upload CSV data to Dune Analytics

## Automatic Synchronization

- **Schedule**: Every Monday at UTC 00:00 via GitHub Actions
- **Purpose**: Keeps our fork synchronized with Pendle team updates
- **Status**: Check the **Actions** tab for sync results

## Manual Sync (When Needed)

If immediate updates are required:

```bash
# One-time setup
git remote add upstream https://github.com/pendle-finance/pendle-merkle-script.git

# Manual sync
git fetch upstream
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

- **Check sync status**: Go to Actions tab → "Sync Fork with Upstream" workflow
- **If sync fails**: Check error messages in Actions, then manually sync
- **For complex issues**: Contact team lead

## Important Notes

- This fork is for internal use only
- No contributions back to upstream repository
- Automatic sync prevents most conflicts when development guidelines are followed