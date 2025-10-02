#!/bin/bash
# Sparkle Protocol GitHub Push Script
# This script will safely push your repository to GitHub

set -e  # Exit on error

echo "======================================"
echo "  Sparkle Protocol - GitHub Setup"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -f "LICENSE" ]; then
    echo "ERROR: Please run this script from the sparkle-protocol-github directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    echo "✓ Git initialized"
    echo ""
fi

# Check current status
echo "Current git status:"
git status --short
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "ERROR: GitHub username is required"
    exit 1
fi

# Prompt for repository name (default: sparkle-protocol)
read -p "Enter repository name [sparkle-protocol]: " REPO_NAME
REPO_NAME=${REPO_NAME:-sparkle-protocol}

echo ""
echo "Repository will be: https://github.com/$GITHUB_USER/$REPO_NAME"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "======================================"
echo "IMPORTANT: GitHub Token Setup"
echo "======================================"
echo ""
echo "You need a GitHub Personal Access Token with 'repo' permissions."
echo ""
echo "To create one:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Give it a name: 'Sparkle Protocol Deploy'"
echo "4. Check the 'repo' checkbox (full control of private repositories)"
echo "5. Click 'Generate token'"
echo "6. Copy the token (you won't see it again!)"
echo ""
read -p "Press Enter when you have your token ready..."
echo ""

# Prompt for token (hidden input)
read -s -p "Paste your GitHub token (hidden): " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "ERROR: Token is required"
    exit 1
fi

echo ""
echo "======================================"
echo "Step 1: Add all files"
echo "======================================"
git add .

echo ""
echo "Files to be committed:"
git status --short
echo ""

read -p "Proceed with commit? (y/n): " PROCEED
if [ "$PROCEED" != "y" ] && [ "$PROCEED" != "Y" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "======================================"
echo "Step 2: Create initial commit"
echo "======================================"
git commit -m "Initial commit: Sparkle Protocol v0.1.0

- SIP-1 JSON Schema specification
- Reference validator and test suite
- Reference indexer with REST API
- Reference coordinator for Lightning trades
- Complete documentation
- Security policy and contribution guidelines
"

echo "✓ Commit created"

echo ""
echo "======================================"
echo "Step 3: Configure remote"
echo "======================================"

# Remove existing origin if present
git remote remove origin 2>/dev/null || true

# Add remote with token authentication
REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
git remote add origin "$REMOTE_URL"

echo "✓ Remote configured"

echo ""
echo "======================================"
echo "Step 4: Push to GitHub"
echo "======================================"

# Rename branch to main
git branch -M main

echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "======================================"
echo "SUCCESS!"
echo "======================================"
echo ""
echo "Your repository is now live at:"
echo "https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "Next steps:"
echo "1. Visit your repository and verify files"
echo "2. Add topics: bitcoin, ordinals, lightning-network, nft, protocol"
echo "3. Create first release (v0.1.0)"
echo "4. Enable GitHub Discussions"
echo ""
echo "IMPORTANT: Your token is stored in .git/config"
echo "To remove it later, run: git remote set-url origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo ""
