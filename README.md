# dsh-command-rea

A tiny DeepSeek Harness host plugin that registers `/rea` in the Web/TUI command
menu.

```
/rea 分析 /opt/app/resources/app.asar
```

It appends a normal user message asking the agent to load the
`reverse-engineer-anything` skill and use the REA MCP tools. The command result
is rendered outside model history, like other slash commands.

## Install

```bash
# from the registry
dsh plugin --profile web add dsh-command-rea

# or from a local checkout, while developing
dsh plugin --profile web add link:/path/to/dsh-command-rea
```

The package ships its own bundle patch (`dsh.bundle.patch`), so the row mounts
through `~/.dsh/profiles/web/package.json` → `dsh.profile.bundles`. Nothing has
to be added to `cordis.patch.yml`; an older manual `command-rea` row must be
removed first, otherwise the same id would be inserted twice.

New bundles are composed into a running profile by HMR; if the row does not
appear, restart the web service once:

```bash
systemctl --user restart dsh-web.service
```

## Requirement

The command only formats the prompt. Running the actual analysis needs the
`reverse-engineer-anything` skill and the REA MCP server in the same profile.
