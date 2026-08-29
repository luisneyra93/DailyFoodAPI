/** Claims que viajan en el access token (formato estándar: `sub` = usuario). */
export interface JwtPayload {
  readonly sub: string;
  readonly userName: string;
  readonly iat?: number;
  readonly exp?: number;
}
