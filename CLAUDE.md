# GURUji — Claude Code Instructions

## Git & GitHub Workflow

**Commit and push after every meaningful unit of work.** This ensures nothing is ever lost and the project history stays clean and revertable.

### Rules

- Commit after every meaningful change — new features, bug fixes, refactors, config changes, etc.
- Always push to GitHub (`git push`) immediately after committing. Never leave commits local-only.
- Write clean, descriptive commit messages using conventional format:
  - `feat: add lesson player controls`
  - `fix: correct canvas coordinate scaling`
  - `refactor: extract timeline engine logic`
  - `chore: update .gitignore`
  - `style: format code`
- Do not batch unrelated changes into a single commit — one logical change per commit.
- Never force push to `main` without explicit user confirmation.

### Commit Message Format

```
<type>: <short summary>

[optional body explaining why, not what]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### When to Commit

- After adding a new file or feature
- After fixing a bug
- After updating configuration or dependencies
- After any refactor or cleanup
- Before and after making large structural changes

## Project

- **Stack**: Next.js (App Router), Tailwind CSS, shadcn/ui, Zustand, Supabase, next-pwa
- **GitHub**: https://github.com/hruaia21hrahsel/GURUji
- **Dev server**: `npm run dev` → localhost:3000
