# 🚀 GitHub Setup Guide for Beginners

## Step 1: Install Git

### Windows
1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run installer → Accept defaults → Finish
3. Open **Git Bash** (right-click on desktop)

### Mac
```bash
# Install Homebrew first (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git
```

### Verify Installation
```bash
git --version
# Should show: git version 2.40+ 
```

---

## Step 2: Configure Git Identity

```bash
git config --global user.name "Uvais K B"
git config --global user.email "uvaise.basheer@gmail.com"
git config --global init.defaultBranch main
```

---

## Step 3: Create GitHub Account

1. Go to [github.com](https://github.com)
2. Sign up with your email
3. Verify email
4. Choose **Free** plan

---

## Step 4: Generate SSH Key (Recommended)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "uvaise.basheer@gmail.com"

# Press Enter 3 times (accept defaults)

# Copy the public key
cat ~/.ssh/id_ed25519.pub
# (Windows: cat C:/Users/YOURNAME/.ssh/id_ed25519.pub)
```

**Add to GitHub:**
1. GitHub → Settings (top right profile pic)
2. SSH and GPG keys → New SSH key
3. Paste the copied key → Add SSH key

**Test connection:**
```bash
ssh -T git@github.com
# Should say: "Hi uvaiskb! You've successfully authenticated"
```

---

## Step 5: Create Repository on GitHub

1. Click **+** (top right) → **New repository**
2. **Repository name:** `expensesplit-pro`
3. **Description:** `Full-stack expense splitting app with .NET 8 + React + AWS Lambda`
4. **Visibility:** Public (recruiters can see it)
5. ✅ **Add a README file** (check this)
6. ✅ **Add .gitignore** → Select **Node**
7. ✅ **Choose a license** → MIT License
8. Click **Create repository**

---

## Step 6: Upload Your Code

### Method A: Command Line (Recommended)

```bash
# 1. Navigate to your project folder
cd E:/ApiProject

# 2. Initialize Git (if not already done)
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit: ExpenseSplit Pro fullstack app"

# 5. Connect to GitHub (replace YOUR_USERNAME)
git remote add origin git@github.com:uvaiskb/expensesplit-pro.git

# 6. Push to GitHub
git branch -M main
git push -u origin main
```

### Method B: GitHub Desktop (Easier for beginners)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with your GitHub account
3. File → Add local repository → Select `E:/ApiProject`
4. Repository settings → Change remote URL to your GitHub repo
5. Commit and push

---

## Step 7: Verify Upload

1. Go to `github.com/uvaiskb/expensesplit-pro`
2. You should see all your files
3. Click on README.md to verify it rendered correctly

---

## Step 8: Make It Interview-Ready

### Add Topics (Tags)
On GitHub repo page → About (gear icon) → Topics:
```
dotnet react typescript aws-lambda fintech expense-tracker
```

### Pin to Profile
1. Go to your GitHub profile
2. Customize your pins
3. Pin `expensesplit-pro` to top

### Add Live Demo Link
In README.md, update the Live Demo link after deployment:
```markdown
[Live Demo](https://your-cloudfront-url)
```

---

## 🔄 Daily Git Workflow

```bash
# Pull latest changes (before starting work)
git pull origin main

# Create feature branch
git checkout -b feature/add-authentication

# Make changes, then...
git add .
git commit -m "feat: add JWT authentication middleware"

# Push branch
git push -u origin feature/add-authentication

# Create Pull Request on GitHub
# Merge when ready
git checkout main
git pull origin main
```

---

## 🆘 Common Issues & Fixes

### "Permission denied (publickey)"
```bash
# Your SSH key isn't added to GitHub
# Re-do Step 4
```

### "fatal: not a git repository"
```bash
# You forgot to run git init
cd your-project-folder
git init
```

### "Updates were rejected"
```bash
# Remote has changes you don't have
git pull origin main --rebase
git push origin main
```

### "Merge conflict"
```bash
# Open the conflicting files, look for <<<<<<< HEAD
# Keep the code you want, remove conflict markers
git add .
git commit -m "fix: resolve merge conflict"
```

---

## 📋 Pre-Interview Checklist

- [ ] Repo is **Public**
- [ ] README has **screenshots/demo GIF**
- [ ] Code is **well-commented**
- [ ] No **sensitive data** (API keys, passwords)
- [ ] **GitHub profile** is professional
- [ ] **LinkedIn** links to this project
- [ ] **Portfolio site** mentions it

---

## 🎯 What Interviewers Look For

| Aspect | What They Check |
|--------|----------------|
| **Code Quality** | Clean architecture, naming conventions |
| **Documentation** | README clarity, inline comments |
| **CI/CD** | GitHub Actions, automated testing |
| **Cloud Skills** | AWS services used, infrastructure as code |
| **Problem Solving** | Algorithm efficiency (greedy optimization) |
| **Full-Stack** | Both frontend & backend proficiency |

---

**Need help?** Open an issue on this repo or email uvaise.basheer@gmail.com
