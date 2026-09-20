/**
 * Single source of truth for where the session JWT lives. The repository, the
 * auth context and the socket adapter all read the same key, so a token written
 * at sign-in is the token restored on reload and sent on the handshake.
 */
export const TOKEN_KEY = 'token';