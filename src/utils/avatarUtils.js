/**
 * Generate initials from a name
 * Examples: "Community Activity" -> "CA", "Green Room" -> "GR"
 */
export function getInitials(name) {
    if (!name) return '??';
    
    const words = name.trim().split(/\s+/);
    
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color based on a string
 */
export function getColorFromString(str) {
    const colors = [
        '#10b981', // emerald
        '#06b6d4', // cyan
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#f59e0b', // amber
        '#3b82f6', // blue
        '#14b8a6', // teal
        '#f97316', // orange
        '#6366f1', // indigo
        '#84cc16', // lime
    ];
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}
