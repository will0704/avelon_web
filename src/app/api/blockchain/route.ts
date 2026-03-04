/**
 * /api/blockchain
 * Proxies to: /api/v1/admin/blockchain
 * Blockchain overview for admin dashboard.
 */
import { proxyToBackend, jsonResponse, errorResponse } from '../_lib/proxy'

/**
 * GET /api/blockchain
 * Get blockchain network status, contract addresses, and balances
 * Backend: GET /api/v1/admin/blockchain
 */
export async function GET(request: Request) {
    const result = await proxyToBackend({
        backendPath: '/api/v1/admin/blockchain',
        request,
    })

    if (result?.success) {
        return jsonResponse(result.data)
    }

    if (result?.error) {
        return errorResponse(result.error, result.status)
    }

    // Fallback when backend is unreachable
    return jsonResponse({
        online: false,
        network: { name: 'offline', chainId: '0' },
        blockNumber: 0,
        deployer: { address: null, balance: '0' },
        contracts: {
            avelonLending: null,
            collateralManager: null,
            repaymentSchedule: null,
        },
        treasury: { address: null, balance: '0' },
        collateralPool: { address: null, balance: '0' },
        onChainLoanCount: 0,
        _warning: 'Backend unreachable',
    })
}
