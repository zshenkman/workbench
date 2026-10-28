# Workbench

Agent skills I use every day. They work in Claude Code, Codex, Cursor, and other agents.

## Skills

| Skill | What it does |
| --- | --- |
| [`beautiful-code`](skills/beautiful-code/SKILL.md) | Code-quality principles for any task that touches code, each with a BAD and GOOD example. |
| [`file-pr`](skills/file-pr/SKILL.md) | Writes a PR title and description a reviewer can read cold: the problem first, then the change, its behavior changes, and the proof. |

## Install

Install every skill:

```sh
npx skills add zshenkman/workbench
```

Install one skill:

```sh
npx skills add zshenkman/workbench --skill file-pr
```
