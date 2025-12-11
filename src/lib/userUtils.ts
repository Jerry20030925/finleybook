import type { User } from 'firebase/auth'

/**
 * Gets a user-friendly display name from Firebase User object
 * Priority: displayName > derived from email > fallback
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'User'
  
  // Priority 1: Use displayName if available
  if (user.displayName?.trim()) {
    return user.displayName.trim()
  }
  
  // Priority 2: Derive from email
  if (user.email) {
    const emailPart = user.email.split('@')[0]
    // Convert common patterns to readable names
    // e.g., "jerry5270919" -> "Jerry", "john.doe" -> "John Doe"
    return formatEmailToDisplayName(emailPart)
  }
  
  return 'User'
}

/**
 * Converts email username part to a more readable display name
 */
function formatEmailToDisplayName(emailPart: string): string {
  // Remove numbers from the end (common pattern: name + random numbers)
  const withoutNumbers = emailPart.replace(/\d+$/, '')
  
  // Handle common separators (dots, underscores, hyphens)
  const words = withoutNumbers.split(/[._-]+/).filter(Boolean)
  
  if (words.length === 0) {
    // If no words left after processing, use first part of original
    const firstPart = emailPart.substring(0, Math.min(emailPart.length, 10))
    return capitalize(firstPart)
  }
  
  // Capitalize each word and join with spaces
  return words.map(capitalize).join(' ')
}

/**
 * Capitalizes first letter of a word
 */
function capitalize(word: string): string {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/**
 * Masks email for privacy-first display
 * e.g., "jerry5270919@gmail.com" -> "j***@gmail.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''
  
  const [username, domain] = email.split('@')
  if (!username || !domain) return email
  
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`
  }
  
  const maskedUsername = `${username[0]}${'*'.repeat(Math.min(username.length - 1, 3))}`
  return `${maskedUsername}@${domain}`
}

/**
 * Gets user initials for avatar display
 */
export function getUserInitials(user: User | null): string {
  const displayName = getUserDisplayName(user)
  const words = displayName.split(' ')
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  
  return displayName.substring(0, 2).toUpperCase()
}