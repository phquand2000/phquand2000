<img src="./assets/banner.png" alt="Quan Phan" width="100%" />

I work *down* the stack rather than across it — from patching Chromium in C++ to
driving those same browsers with AI agents. Most of what I build takes a closed
system (a browser, After Effects, Word, n8n) and makes it programmable.

<sub>Hanoi, Vietnam</sub>

### Where I work

```
  Agents & automation    MCP bridges · CEP / Office extensions · n8n AI builder
  ────────────────────────────────────────────────────────────────────────────
  Distributed systems    Go · Connect RPC · NATS JetStream · transactional outbox
  ────────────────────────────────────────────────────────────────────────────
  Browser internals      Chromium C++ · fingerprint, TLS and HTTP/2 surfaces
```

The interesting problems live at the seams between those layers.

### Selected work

**Anti-detect browser engine** — custom Chromium build, ~66 patches organised into six
layers (de-telemetry, module, automation, fingerprint, network). Spans canvas, audio,
WebGL and font surfaces through to TLS cipher ordering and HTTP/2 SETTINGS fingerprints.
`C++` · closed source — but the surface map is public: [browser-fingerprint-surfaces](https://github.com/phquand2000/browser-fingerprint-surfaces)

**Sourcing & fulfillment platform** — 22 Go services across 10 bounded contexts. Connect
RPC over Buf-generated protos, one Postgres per service, NATS JetStream carrying
proto-encoded CloudEvents, transactional outbox, in-repo OIDC provider.
`Go` `TypeScript` · closed source — architecture notes: [event-driven-go-notes](https://github.com/phquand2000/event-driven-go-notes)

**[AE AI Assistant](https://github.com/phquand2000/adobe_effects_ext)** — After Effects CEP
extension: 29 services and 158 actions for AI-driven VFX automation. `JavaScript`

**[Word GPT Plus](https://github.com/phquand2000/docs_ext)** — AI agent inside Microsoft
Word, bridged to external tools over MCP. `TypeScript`

**[n8n Premium](https://github.com/phquand2000/n8n_folk_premium)** — enterprise n8n fork
with a custom AI Workflow Builder. `JavaScript`

**[agent-config-architecture](https://github.com/phquand2000/agent-config-architecture)** — how to structure a
coding-agent setup so its rules actually hold: standing config, on-demand skills, blocking hooks.

<sub>Most of my work is closed source, so I publish the thinking instead. Happy to talk through the architecture.</sub>

### Reach me

[Email](mailto:huyquang29112001@gmail.com) — or `npx phquand`, if you would rather stay in
the terminal.

### Guestbook

[**Sign it →**](https://github.com/phquand2000/phquand2000/issues/new?title=guestbook&body=Write%20your%20message%20here.%20It%20will%20appear%20on%20my%20profile%20with%20your%20username.) — an issue opens, you write a line, an Action puts it here and closes the issue.

<!-- guestbook starts -->

<!-- guestbook ends -->

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/phquand2000/phquand2000/output/github-snake-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/phquand2000/phquand2000/output/github-snake.svg" />
    <img alt="contribution snake" src="https://raw.githubusercontent.com/phquand2000/phquand2000/output/github-snake.svg" width="100%" />
  </picture>
</p>
