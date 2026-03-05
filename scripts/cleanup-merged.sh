#!/usr/bin/env bash
# Delete branches whose upstream PRs have been merged.
#
# Requires env: DRY_RUN, MERGED_PATCHES

set -euo pipefail

echo "$MERGED_PATCHES" | tr ',' '\n' | while read -r branch; do
  [[ -z "$branch" ]] && continue
  echo "Deleting merged branch: $branch"
  if [[ "$DRY_RUN" != "true" ]]; then
    git push origin --delete "$branch" 2>/dev/null || true
  else
    echo "  [dry-run] skipping delete"
  fi
done
