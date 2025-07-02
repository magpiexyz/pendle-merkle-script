# Setting Up Upstream Repository

This repository is forked from the original [pendle-finance/pendle-merkle-script](https://github.com/pendle-finance/pendle-merkle-script) to facilitate our team's internal operations and reward calculations. We maintain this fork to customize the scripts according to our specific requirements while staying synchronized with updates from the Pendle team.

## Initial Setup

### 1. Clone the Fork Repository
```bash
git clone https://github.com/magpiexyz/pendle-merkle-script.git
cd pendle-merkle-script
```

### 2. Add Upstream Remote
Add the original repository as the upstream remote:
```bash
git remote add upstream https://github.com/pendle-finance/pendle-merkle-script.git
```

### 3. Verify Remote Configuration
Check that both remotes are properly configured:
```bash
git remote -v
```

You should see output similar to:
```
origin    https://github.com/magpiexyz/pendle-merkle-script.git (fetch)
origin    https://github.com/magpiexyz/pendle-merkle-script.git (push)
upstream  https://github.com/pendle-finance/pendle-merkle-script.git (fetch)
upstream  https://github.com/pendle-finance/pendle-merkle-script.git (push)
```

## Working with Upstream

### Syncing with Original Repository
To keep your fork up-to-date with the original repository:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes into your main branch
git merge upstream/main

# Push the updated main branch to your fork
git push origin main
```

### Daily Development Workflow

1. **Before starting new work** - sync with upstream:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Work on your changes** and commit them:
   ```bash
   git add .
   git commit -m "Your commit message"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Push to your fork** and use for internal development:
   ```bash
   git push origin feature/your-feature-name
   ```
   
   **Note**: We do not create pull requests to the upstream repository as it belongs to another team.

## Important Notes

- **origin**: Points to your forked repository (magpiexyz/pendle-merkle-script)
- **upstream**: Points to the original repository (pendle-finance/pendle-merkle-script)
- **We only pull from upstream** to stay updated with the original codebase
- **We only push to origin** (our fork) for internal development
- **No contributions back to upstream**: This fork is for internal use only
- Always sync with upstream before starting new development work

## Troubleshooting

### If you already cloned without setting upstream:
If you've already cloned the repository and need to add upstream:
```bash
git remote add upstream https://github.com/pendle-finance/pendle-merkle-script.git
```

### If you accidentally push to upstream:
You should never push to upstream as we don't have write permissions. All development work should be done on your fork (`origin`).

### Resolving merge conflicts:
If there are conflicts when merging upstream changes:
1. Resolve conflicts in your code editor
2. Stage the resolved files: `git add .`
3. Complete the merge: `git commit`
4. Push to your fork: `git push origin main`