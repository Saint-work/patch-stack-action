# patch-stack-action

A reusable GitHub Actions workflow that maintains a fork where `main` always equals **upstream/main + your in-flight patches applied in order**.

Each patch corresponds to an open PR on the upstream repo. On each run the workflow:

1. **Discovers** all `patch/*` branches in your fork
2. **Checks** whether each patch's upstream PR has been merged or the problem fixed another way
3. **Rebases** each patch branch onto its parent (or upstream/main for roots)
4. **Rebuilds** `fork/main` = upstream/main + patches in topological order
5. **Resolves conflicts** using Claude Code when git can't do it cleanly
6. **Closes and archives** patches whose upstream PRs are superseded

## Repo structure

```
patch-stack-action/                  ← this repo (public, reusable)
  .github/workflows/
    patch-stack-sync.yml             ← the reusable workflow

your-fork/
  .github/workflows/
    patch-stack-sync.yml             ← 20-line caller (copy from example-caller.yml)
```

## Branch naming

Dependencies are encoded in the branch name using `--` as a separator. No config file needed.

```
patch/fix-auth                              # root — rebases onto upstream/main
patch/fix-auth--improve-token-refresh       # depends on fix-auth
patch/fix-auth--improve-token-refresh--cleanup  # depends on improve-token-refresh
patch/perf-improvement                      # independent root
```

The parent of any branch is its name with the last `--segment` stripped.
Roots (no `--`) rebase directly onto `upstream/main`.

When a PR is merged upstream → branch is deleted.
When upstream fixes the same problem another way → PR is closed, branch renamed to `archived/*`.

## Usage

Copy `example-caller.yml` into your fork at `.github/workflows/patch-stack-sync.yml` and update the two repo inputs:

```yaml
jobs:
  sync:
    uses: DJRHails/patch-stack-action/.github/workflows/patch-stack-sync.yml@main
    with:
      upstream_repo: vercel-labs/agent-browser   # ← change this
      fork_repo: djrhails/agent-browser           # ← change this
    secrets:
      app_id: ${{ secrets.PATCH_STACK_APP_ID }}
      app_private_key: ${{ secrets.PATCH_STACK_APP_PRIVATE_KEY }}
      claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `upstream_repo` | ✅ | — | `owner/repo` of the upstream |
| `upstream_branch` | | `main` | Branch to track on upstream |
| `fork_repo` | ✅ | — | `owner/repo` of your fork |
| `fork_main` | | `main` | Fork branch to keep rebuilt |
| `dry_run` | | `false` | Preview without pushing or closing PRs |

## Secrets

| Secret | Description |
|--------|-------------|
| `app_id` | GitHub App ID |
| `app_private_key` | GitHub App private key |
| `claude_code_oauth_token` | Claude Code OAuth token (Pro/Max subscription). Generate with `claude setup-token` |

## Setup

### 1. Create a GitHub App

A GitHub App token is required (not `GITHUB_TOKEN`) for three reasons:
- Pushes made by the action can trigger other workflows
- Cross-repo PR operations (closing PRs on the upstream)
- Cron-triggered runs — OIDC token exchange [fails on scheduled workflows](https://github.com/anthropics/claude-code-action/issues/814); passing a pre-generated App token via `github_token` bypasses this entirely

**Permissions needed:**
- Contents: Read & Write
- Pull requests: Read & Write
- Metadata: Read (auto-granted)

**Install the app on:**
- Your fork (required)
- The upstream repo (required for closing PRs — or ask upstream maintainers to install it; otherwise superseded-PR closing will silently fail but branches will still be archived)

Add to your fork's repository secrets:
- `PATCH_STACK_APP_ID`
- `PATCH_STACK_APP_PRIVATE_KEY`

### 2. Add Claude Code OAuth token

Generate a token locally with `claude setup-token`, then add it as `CLAUDE_CODE_OAUTH_TOKEN` in your fork's repository secrets.

### 3. Copy the caller workflow

```
cp example-caller.yml your-fork/.github/workflows/patch-stack-sync.yml
```

Edit `upstream_repo` and `fork_repo`, commit, push.

### 4. Open PRs from patch branches

Create branches named `patch/<description>` in your fork and open PRs from them against the upstream repo. The automation handles the rest.

## Notes on Claude Code auth

`claude-code-action` defaults to OIDC token exchange for GitHub auth. This **fails on cron-triggered runs** with a 401. We bypass it by passing the pre-generated App token directly as `github_token` — Claude Code then uses that instead of attempting OIDC. The `ssh_signing_key` is set to the App private key to give Claude full git CLI access for rebasing and force-pushing.

`CLAUDE_CODE_OAUTH_TOKEN` is passed via env (not as an action input) to work around a [bug](https://github.com/anthropics/claude-code-action/issues/676) where `claude-code-action@v1` clears it between phases when provided as an input.
