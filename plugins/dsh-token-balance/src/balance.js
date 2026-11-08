/**
 * Pure normalization of the two DeepSeek balance sources.
 *
 * - `normalizeAccountBalance` reads the signed-in account service outcome
 *   (`ctx.deepseekAccount.getBalance`) and is undefined when it carries no
 *   wallet.
 * - `normalizeApiKeyBalance` reads the official `GET /user/balance` body.
 */

function money(value) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null
}

/** Project one wallet record, or undefined when it is not an object. */
export function walletOf(wallet) {
  if (wallet === null || typeof wallet !== 'object') return undefined
  return {
    currency: typeof wallet.currency === 'string' ? wallet.currency : null,
    balance: typeof wallet.balance === 'string' || typeof wallet.balance === 'number' ? String(wallet.balance) : null,
  }
}

/** Project a wallet list, dropping non-wallet entries. */
export function walletsOf(list) {
  return Array.isArray(list) ? list.map(walletOf).filter((wallet) => wallet !== undefined) : []
}

/**
 * Normalize the account service balance outcome.
 * @param result - `ctx.deepseekAccount.getBalance` value.
 * @returns a balance view, or undefined when the account is signed out or the read failed.
 */
export function normalizeAccountBalance(result) {
  if (result === null || typeof result !== 'object' || result.status !== 'ready') return undefined
  const wallets = walletsOf(result.value)
  if (wallets.length === 0) return undefined
  const primary = wallets[0]
  return {
    configured: true,
    source: 'account',
    available: true,
    currency: primary.currency,
    total: primary.balance,
    wallets,
    bonusWallets: walletsOf(result.bonusWallets),
  }
}

/**
 * Normalize the official balance endpoint body.
 * @param body - parsed `GET https://api.deepseek.com/user/balance` response.
 * @returns a balance view.
 */
export function normalizeApiKeyBalance(body) {
  const info = Array.isArray(body?.balance_infos) ? body.balance_infos[0] : undefined
  return {
    configured: true,
    source: 'api-key',
    available: body?.is_available !== false,
    currency: typeof info?.currency === 'string' ? info.currency : null,
    total: money(info?.total_balance),
    granted: money(info?.granted_balance),
    toppedUp: money(info?.topped_up_balance),
  }
}
