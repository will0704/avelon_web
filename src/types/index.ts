/**
 * Local copy of shared types from @avelon_capstone/types.
 * Inlined here because the monorepo sibling package is not available
 * on Vercel's build environment.
 */

export enum UserRole {
    ADMIN = 'ADMIN',
    BORROWER = 'BORROWER',
    INVESTOR = 'INVESTOR',
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
