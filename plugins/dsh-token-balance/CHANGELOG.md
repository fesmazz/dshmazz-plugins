# Changelog — @mazz/dsh-token-balance

## [1.0.0] - 2026-11-07

### Added
- Host route `GET /dsh-token-balance`: remaining balance from the signed-in DeepSeek
  account wallet, with the `DEEPSEEK_API_KEY` / `api.deepseek.com/user/balance`
  fallback, plus token usage summed from live sessions.
- Web UI entry in the composer dock showing balance, input/output tokens and cache
  reads.

### Changed
- Moved from the `@local/` placeholder package into `dshmazz-plugins` as
  `@mazz/dsh-token-balance`.

### Known limits
- Token usage covers live sessions only; archived history needs `ctx.sessionQuery`.
- The rendered dock line was not visually verified; it loads on page refresh.
