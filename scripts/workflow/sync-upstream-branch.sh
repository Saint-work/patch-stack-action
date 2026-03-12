#!/usr/bin/env bash
# Maintain a fork-local branch that mirrors upstream/<branch>, optionally
# pinned to the latest tag matching a glob pattern.
#
# Requires env: DRY_RUN, UPSTREAM_BRANCH, FORK_UPSTREAM_BRANCH
# Optional env: UPSTREAM_TAG_PATTERN (glob, e.g. "v*")
#               UPSTREAM_COMMIT_OVERRIDE (full or short SHA)
# Outputs (via GITHUB_OUTPUT): upstream_tag, upstream_sha

set -euo pipefail

target_ref="upstream/${UPSTREAM_BRANCH}"
upstream_tag=""

if [[ -n "${UPSTREAM_TAG_PATTERN:-}" ]]; then
  # Find the latest stable tag (exclude pre-release suffixes like -beta.1, -rc2)
  # reachable from the upstream branch, sorted by version.
  upstream_tag=$(
    git tag --list "$UPSTREAM_TAG_PATTERN" \
      --sort=-version:refname \
      --merged "upstream/${UPSTREAM_BRANCH}" \
    | grep -v -E -- '-' \
    | head -1
  ) || true

  if [[ -n "$upstream_tag" ]]; then
    echo "Pinning to tag: ${upstream_tag}"
    target_ref="$upstream_tag"
  else
    echo "::warning::No tag matching '${UPSTREAM_TAG_PATTERN}' found on upstream/${UPSTREAM_BRANCH}; falling back to branch HEAD"
  fi
fi

# Allow a commit override to skip ahead of the latest tag.  The override
# expires automatically once a tag is released that contains the commit.
if [[ -n "${UPSTREAM_COMMIT_OVERRIDE:-}" ]]; then
  # The commit may not be reachable from the branch/tags already fetched
  # (e.g. it lives on a topic branch).  Fetch it explicitly first.
  if ! git rev-parse --verify "${UPSTREAM_COMMIT_OVERRIDE}^{commit}" &>/dev/null; then
    echo "Fetching override commit ${UPSTREAM_COMMIT_OVERRIDE} from upstream..."
    git fetch upstream "${UPSTREAM_COMMIT_OVERRIDE}" --quiet 2>/dev/null || true
  fi

  override_sha=$(git rev-parse --verify "${UPSTREAM_COMMIT_OVERRIDE}^{commit}" 2>/dev/null) || {
    echo "::error::upstream_commit_override '${UPSTREAM_COMMIT_OVERRIDE}' is not a valid commit"
    exit 1
  }

  if [[ -n "$upstream_tag" ]] && git merge-base --is-ancestor "$override_sha" "$upstream_tag" 2>/dev/null; then
    echo "Override commit ${UPSTREAM_COMMIT_OVERRIDE} is already contained in ${upstream_tag}; ignoring override"
  else
    echo "Applying commit override: ${UPSTREAM_COMMIT_OVERRIDE} (${override_sha})"
    target_ref="$override_sha"
    upstream_tag="${upstream_tag:+${upstream_tag}+}${override_sha:0:12}"
  fi
fi

echo "Syncing ${FORK_UPSTREAM_BRANCH} -> ${target_ref}"
git branch -f "$FORK_UPSTREAM_BRANCH" "$target_ref" >/dev/null

upstream_sha=$(git rev-parse "$FORK_UPSTREAM_BRANCH")

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "upstream_tag=${upstream_tag}" >> "$GITHUB_OUTPUT"
  echo "upstream_sha=${upstream_sha}" >> "$GITHUB_OUTPUT"
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo "  [dry-run] skipping push"
  exit 0
fi

git fetch origin \
  "+refs/heads/${FORK_UPSTREAM_BRANCH}:refs/remotes/origin/${FORK_UPSTREAM_BRANCH}" \
  --quiet 2>/dev/null || true

git push --force-with-lease origin "$FORK_UPSTREAM_BRANCH" --quiet

echo "${FORK_UPSTREAM_BRANCH} updated"
