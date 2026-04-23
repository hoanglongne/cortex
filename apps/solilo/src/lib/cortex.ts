/**
 * Solilo Analytics/Log Helper
 */

const API_URL = 'http://localhost:3001';

export async function logSoliloAction(
    userId: string,
    actionType: string,
    metadata: Record<string, unknown>,
) {
    try {
        const response = await fetch(`${API_URL}/actions/log`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                appSource: 'solilo',
                actionType,
                metadata,
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('[Solilo] Failed to send log to Cortex:', error);
        return null;
    }
}
