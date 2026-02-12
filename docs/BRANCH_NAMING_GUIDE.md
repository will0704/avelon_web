# 🌿 Branch Naming Guide — Avelon Web

> A quick reference for the team on how to name branches consistently.

## Format

```
<type>/<short-description>
```

- Use **lowercase** and **hyphens** (no underscores, no spaces, no dates)
- Keep descriptions short but meaningful (2–4 words max)

---

## Allowed Prefixes

| Prefix | When to Use | Example |
|---|---|---|
| `feature/` | New feature or functionality | `feature/loan-dashboard` |
| `fix/` | Bug fix | `fix/login-redirect` |
| `hotfix/` | Urgent production fix | `hotfix/auth-token-expiry` |
| `chore/` | Maintenance, dependency updates | `chore/update-dependencies` |
| `docs/` | Documentation only | `docs/api-endpoints` |
| `refactor/` | Code restructuring (no new features) | `refactor/admin-layout` |
| `test/` | Adding or updating tests | `test/wallet-integration` |

---

## ✅ Good Examples

```
feature/api-routes
feature/payment-history
fix/admin-login-error
chore/upgrade-nextjs
refactor/dashboard-components
docs/setup-guide
```

## ❌ Bad Examples

```
michaelfeb-11          ← no prefix, uses name + date
will_feb10             ← no prefix, uses name + date
update                 ← too vague, no prefix
my-branch              ← meaningless
JerieBranch            ← camelCase, no prefix
fix_bug                ← uses underscores instead of hyphens
```

---

## Quick Rules

1. **Never use your name or a date** as the branch name.
2. **Always start with a prefix** from the table above.
3. **Describe what the branch does**, not who made it or when.
4. **Use hyphens** (`-`) to separate words, not underscores (`_`).
5. **Keep it short** — if you can't describe it in 4 words, break it into smaller branches.

---

## Workflow Example

```bash
# Starting a new feature
git checkout develop
git pull origin develop
git checkout -b feature/wallet-connect

# Working on a bug fix
git checkout develop
git pull origin develop
git checkout -b fix/deposit-calculation

# When done, push and create a Pull Request
git push -u origin feature/wallet-connect
# Then open a PR on GitHub to merge into develop
```

---

> **TL;DR**: `type/what-it-does` — that's it. No names, no dates, no mystery. 🚀
