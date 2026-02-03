/**
 * Utility functions for masking sensitive data in public tracking
 */

export const maskPhone = (phone: string): string => {
    if (!phone || phone.length < 4) return '***';
    const lastThree = phone.slice(-3);
    const firstThree = phone.slice(0, 4);
    return `${firstThree}***...${lastThree}`;
};

export const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return '***@***.com';
    const [username, domain] = email.split('@');
    if (!username || !domain) return '***@***.com';
    const maskedUsername = username.length > 2
        ? `${username[0]}***${username[username.length - 1]}`
        : `${username[0]}***`;
    return `${maskedUsername}@${domain}`;
};

export const maskAddress = (_address: string, _city?: string, state?: string): string => {
    const statePart = state ? `, ${state} State` : '';
    return `*****${statePart}`;
};

export const maskFullName = (fullName: string): string => {
    if (!fullName) return '***';
    const parts = fullName.split(' ');
    if (parts.length === 1) {
        return parts[0] && parts[0][0] ? `${parts[0][0]}***` : '***';
    }
    const lastName = parts[parts.length - 1];
    return `${parts[0]} ${lastName && lastName[0] ? lastName[0] : ''}***`;
};
