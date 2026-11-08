# Delegation Models

`@mazz/dsh-delegation-models` makes a requested delegation model stick: it routes
subagent work through named model profiles and records the profile a session was
instructed to use.

## Tools

- **`delegate_model`** — starts a continuable subagent on a routed model (named
  profile, or explicit `provider` + `model` + `reasoning_effort`) and returns its
  `subagentId`. The child is a durable continuable subagent: `send_message`
  steers it while running or continues it after it finishes.
- **`set_delegation_profile`** — records the profile this session should use for
  later delegations; pass `{ "clear": true }` to remove it.

## Configuration

The plugin derives profiles automatically:

1. configured `profiles`;
2. otherwise the live `subagentModelSelection` allowed routes;
3. otherwise the Lead's current default model.

A row config in the profile patch (same row id) can pin profiles, a default, an
allowlist and the subagent backend:

```yaml
- id: delegation-models
  name: '@mazz/dsh-delegation-models'
  config:
    provider: spawn
    defaultProfile: cheap
    allowedModels:
      - provider: deepseek-account
        model: deepseek-flash
      - provider: deepseek-account
        model: deepseek-v4-pro
    profiles:
      cheap:
        provider: deepseek-account
        model: deepseek-flash
        reasoningEffort: high
        description: Fast, cheap work
      deep:
        provider: deepseek-account
        model: deepseek-v4-pro
        description: Deep implementation and review
```

Routing order: explicit `provider`+`model` wins; otherwise the named profile,
then the session profile, then the default. A profile's effort is used unless
the call names one; changing the route without naming an effort uses the model
default. Explicit routes must be in the allowlist when one is configured.

## Team limitation

`spawn_teammate` takes no model argument: teammates inherit the Lead model. For
model-specific work use `delegate_model` (a durable continuable subagent), or
pass `provider`/`model` to the built-in `subagent` tool. The plugin's
system-prompt section states this so the Lead routes accordingly.

## Verification

- `node --test` — policy unit tests (`test/policy.test.js`).
- Live probe: `delegate_model` returned a child id and the child session's
  `request/header` showed `deepseek-account/deepseek-flash`.
