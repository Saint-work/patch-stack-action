#!/usr/bin/env bash
# Close upstream PRs and archive branches that upstream has superseded.
#
# Requires env: GH_TOKEN, UPSTREAM_REPO, UPSTREAM_BRANCH, DRY_RUN,
#               SUPERSEDED_PATCHES

set -euo pipefail

echo "$SUPERSEDED_PATCHES" | tr ',' '\n' | while read -r branch; do
  [[ -z "$branch" ]] && continue
  safe="${branch//\//_}"
  pr_num=$(cat "/tmp/meta_num_${safe}" 2>/dev/null || true)
  archived="archived/${branch#patch/}"

  echo "Superseded: $branch -> $archived (PR #${pr_num:-none})"
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [dry-run] skipping archive + PR close"
    continue
  fi

  if [[ -n "$pr_num" ]]; then
    if ! gh pr comment "$pr_num" \
      --repo "$UPSTREAM_REPO" \
      --body "patch-stack-bot: The changes in this PR appear to already be present in upstream \`${UPSTREAM_BRANCH}\` (likely applied via a different commit). Closing and archiving the branch -- reopen if this is incorrect." \
      2>/dev/null; then
      echo "::warning::Could not comment on PR #${pr_num} in ${UPSTREAM_REPO}" \
        "(app may not be installed on upstream)"
    fi
    if ! gh pr close "$pr_num" --repo "$UPSTREAM_REPO" 2>/dev/null; then
      echo "::warning::Could not close PR #${pr_num} in ${UPSTREAM_REPO}" \
        "(app may not be installed on upstream)"
    fi
  fi

  # Rename: push to archived/* then delete patch/*
  git push origin "${branch}:refs/heads/${archived}" --quiet
  git push origin --delete "$branch" 2>/dev/null || true
  echo "  Archived as $archived"
done
