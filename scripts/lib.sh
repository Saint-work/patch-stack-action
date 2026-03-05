#!/usr/bin/env bash
# Common functions shared across patch-stack scripts.
# Source this file: source "$(dirname "$0")/lib.sh"

set -euo pipefail

# Resolve the parent branch for a given patch branch.
# Root branches (no "--") rebase onto upstream; children strip the last segment.
#
# Requires: UPSTREAM_BRANCH env var
get_parent() {
  local branch="${1#patch/}"
  if [[ "$branch" == *"--"* ]]; then
    echo "patch/${branch%--*}"
  else
    echo "upstream/$UPSTREAM_BRANCH"
  fi
}
