# dsh-command-rea

A tiny DeepSeek Harness host plugin that registers `/rea` in the Web/TUI command
menu.

```
/rea 分析 /opt/app/resources/app.asar
```

The command injects one ordinary user message — the same way the built-in
commands do, through `createUserMessage()` semantics and `agent.followup()` —
asking the agent to load the `reverse-engineer-anything` skill and run the
request with the REA MCP tools:

```
请加载 reverse-engineer-anything 技能，并按它的流程用 REA 完成下面的任务。

任务：分析 /opt/app/resources/app.asar
```

Composer attachments (`input.attachments`) are admitted and published ahead of
that text, so a binary, an archive, or a screenshot can be handed to REA
directly. The command result is rendered outside model history, like other slash
commands.

### Why the plugin imports nothing from `@deepseek-ai/*`

A `link:` install is evaluated from its checkout, outside the profile directory,
and the launcher only routes bare `@deepseek-ai/*` specifiers for importers
inside the profile (or the installation). Importing `createUserMessage` from
`@deepseek-ai/dsh-llm` therefore fails at boot with `ERR_MODULE_NOT_FOUND` when
the package is linked, which takes the whole `/rea` row down:

```
command-rea (dsh-command-rea): failed to import: Cannot find package '@deepseek-ai/dsh-commands'
```

The plugin therefore mirrors the two framework values it needs — an equivalent
`createUserMessage()` (fresh identity, `user` role, user source, deep-frozen) and
the identity string of `CommandDefinitionId` — and imports only `node:crypto`.
That keeps checkout and registry installs loading identically.


## Command surface

| Field | Value |
|---|---|
| name | `rea` |
| definitionId | `dsh-command-rea` |
| title | 逆向分析 |
| icon | `IconInspectOutlineRegular` |
| description | 用 REA 逆向分析目标 |
| input hint | `<目标路径或问题>` |
| attachments | accepted |

`title` and `icon` are the command's own menu face: the Web client renders them
as the row title and glyph, so `/rea` sits beside first-party rows instead of
showing a bare `rea`. `icon` is an export name of
`@deepseek-ai/dsh-client-ui-primitives`; an unknown name falls back to the
generic plugin glyph. A definition that supplies neither still gets a row whose
title is its description.

Both fields need a Host that forwards them: `commands/list` must keep `title`
and `icon` on the descriptor (`@deepseek-ai/dsh` 0.2.1-rc.3 does not — the local
patch in this workspace's `research/dsh-command-face` adds the two fields to the
Host registration, to both wire schemas, and to the menu row builder). On a
Host release without that plumbing the fields are ignored and the row keeps the
description-as-title fallback written above.


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

The web profile's HMR watches profile configuration only, not linked module
roots, so a code change in a linked checkout needs one restart of the web
service:

```bash
systemctl --user restart dsh-web.service
```

## Requirement

The command only formats the prompt. Running the actual analysis needs the
`reverse-engineer-anything` skill and the REA MCP server in the same profile.
