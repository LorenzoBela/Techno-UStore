// Device detection utilities for client-side usage

export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent;
    const mobilePatterns = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i,
        /Opera Mini/i,
        /IEMobile/i,
        /Mobile/i,
    ];
    
    return mobilePatterns.some((pattern) => pattern.test(userAgent));
}

export function isTabletDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent;
    return /iPad|Android(?!.*Mobile)/i.test(userAgent);
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (isMobileDevice()) {
        if (isTabletDevice()) return 'tablet';
        return 'mobile';
    }
    return 'desktop';
}

// Cookie helpers for device preference override
export function setDevicePreference(preference: 'mobile' | 'desktop' | 'auto'): void {
    if (typeof document === 'undefined') return;
    
    if (preference === 'auto') {
        document.cookie = 'admin-device-preference=; path=/; max-age=0';
    } else {
        document.cookie = `admin-device-preference=${preference}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
    }
}

export function getDevicePreference(): 'mobile' | 'desktop' | 'auto' {
    if (typeof document === 'undefined') return 'auto';
    
    const match = document.cookie.match(/admin-device-preference=(mobile|desktop)/);
    return match ? (match[1] as 'mobile' | 'desktop') : 'auto';
}

