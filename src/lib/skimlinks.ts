export const SKIMLINKS_ID = '295600X1782999'

/**
 * Generates a Skimlinks redirect URL with user tracking.
 * 
 * @param targetUrl The merchant URL you want to link to (e.g., Amazon product page)
 * @param userId The ID of the user to track (will be passed as xcust)
 * @returns The full Skimlinks redirect URL
 */
export function getSkimlinksUrl(targetUrl: string, userId: string): string {
    const encodedUrl = encodeURIComponent(targetUrl)
    const encodedUserId = encodeURIComponent(userId)

    // Base URL for Skimlinks redirects
    return `http://go.redirectingat.com/?id=${SKIMLINKS_ID}&url=${encodedUrl}&xcust=${encodedUserId}`
}
