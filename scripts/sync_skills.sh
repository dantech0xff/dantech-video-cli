#!/bin/bash
# Copy .agents/skills (nguồn chính) sang .claude/skills và .grok/skills. Không dùng symlink để chạy được trên Windows.
# usage: scripts/sync_skills.sh   (chạy lại sau khi sửa bất kỳ SKILL.md nào)
cd "$(dirname "$0")/.."
for d in .claude/skills .grok/skills; do rm -rf "$d"; mkdir -p "$d"; cp -r .agents/skills/. "$d/"; done
echo "synced $(ls .agents/skills | tr '\n' ' ')→ .claude/skills .grok/skills"
