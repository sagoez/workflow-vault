# Workflow Vault

[![wf](https://img.shields.io/badge/wf-cli-black?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxNCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjMyIiB5PSI0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwtYXBwbGUtc3lzdGVtLHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc3R5bGU9Iml0YWxpYyIgZm9udC1zaXplPSIzMiIgZmlsbD0iIzAwMCI+d2Y8L3RleHQ+PC9zdmc+)](https://github.com/sagoez/workflow)

A curated collection of **94 reusable shell workflows** for [`wf`](https://github.com/sagoez/workflow) — a terminal-native alternative to Warp's Workflows. Every workflow is a parameterized command defined in YAML, resolved interactively at runtime, and copied to your clipboard.

Fully compatible with Warp's workflow format — you can copy-paste from either side.

## Use It

Install `wf`:

```bash
cargo install wf-cli
```

Sync this vault:

```bash
wf sync --remote-url https://github.com/sagoez/workflow-vault.git
# or, via SSH:
wf sync --remote-url git@github.com:sagoez/workflow-vault.git
```

Then just run `wf` — pick a workflow, fill in the prompts, paste the resolved command.

## What's In the Vault

94 workflows across the tags you'd expect from a backend engineer's daily shell use:

| Category | Count | Examples |
|---|---|---|
| git | 16 | `git_create_and_switch_branch`, `git_interactive_rebase`, `git_bisect_start` |
| networking | 14 | `dns_lookup`, `flush_dns_cache`, `check_if_port_is_open`, `check_ssl_certificate_expiry` |
| docker | 11 | `build_docker_image`, `docker_compose_up`, `exec_into_docker_container` |
| aws | 10 | `aws_list_ec2_instances`, `aws_ecr_login`, `aws_s3_sync_directory` |
| security | 8 | `generate_ssh_key`, `copy_ssh_key_to_server`, `generate_self_signed_certificate` |
| debugging | 8 | `monitor_file_changes`, process/port inspection |
| macos | 7 | `hide_hidden_files_in_finder`, `lock_screen`, Finder helpers |
| video (ffmpeg) | 5 | `ffmpeg_compress_video`, `ffmpeg_create_gif_from_video`, `ffmpeg_trim_video` |
| python / node | 10 | common `pip`, `npm`, `pnpm`, `yarn` tasks |
| kubernetes | 5 | `get_current_kubernetes_deployments`, rollout/scale helpers |

Files are named self-descriptively at the repo root — browse them directly, or grep:

```bash
ls *ecs*            # everything related to ECS
grep -l 'docker' *.yaml
```

## Workflow Format

Each `.yaml` file is a single workflow:

```yaml
---
name: Create and Switch to a New Branch
command: "git checkout -b {{branch_name}}"
description: Create a new branch and switch to it in one command
arguments:
  - name: branch_name
    arg_type: Text
    description: Name for the new branch
tags:
  - git
  - branch
shells: [Bash, Zsh]
```

`{{placeholders}}` are filled interactively. Arguments support `Text`, `Enum`, `MultiEnum`, `Number`, and `Boolean` types. See the [main `wf` README](https://github.com/sagoez/workflow#workflow-yaml-format) for the full schema, including dynamic enums resolved from shell commands.

## Contributing

1. Copy an existing `.yaml` as a starting point.
2. Use `snake_case` for the filename, matching the `name` field.
3. Tag it — one primary category (`aws`, `git`, etc.) plus any secondary tags.
4. Open a PR.

## License

MIT. Use these however you want.
