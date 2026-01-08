/**
 * Date and Time Utilities for Countdown Feature
 * Handles timezone conversion, validation, and countdown formatting
 */

/**
 * Convert local datetime to UTC ISO string
 * @param localDateStr - Date string in YYYY-MM-DD format
 * @param localTimeStr - Time string in HH:MM format
 * @returns ISO 8601 datetime string in UTC
 */
export function toUTCISOString(localDateStr: string, localTimeStr: string): string {
	// Combine date and time
	const localDatetime = `${localDateStr}T${localTimeStr}:00`;
	const date = new Date(localDatetime);
	
	// Convert to UTC ISO string
	return date.toISOString();
}

/**
 * Convert UTC ISO string to local date and time
 * @param utcISOString - ISO 8601 datetime string in UTC
 * @returns Object with local date and time strings
 */
export function fromUTCISOString(utcISOString: string): { date: string; time: string } {
	const date = new Date(utcISOString);
	
	// Get local date in YYYY-MM-DD format
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const localDate = `${year}-${month}-${day}`;
	
	// Get local time in HH:MM format
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const localTime = `${hours}:${minutes}`;
	
	return { date: localDate, time: localTime };
}

/**
 * Check if a datetime is in the future
 * @param utcISOString - ISO 8601 datetime string in UTC
 * @returns true if datetime is in the future
 */
export function isFuture(utcISOString: string): boolean {
	const scheduledDate = new Date(utcISOString);
	const now = new Date();
	return scheduledDate > now;
}

/**
 * Calculate time remaining until scheduled datetime
 * @param utcISOString - ISO 8601 datetime string in UTC
 * @returns Object with days, hours, minutes, seconds, and total milliseconds
 */
export function getTimeRemaining(utcISOString: string): {
	total: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
} {
	const scheduledDate = new Date(utcISOString);
	const now = new Date();
	const total = scheduledDate.getTime() - now.getTime();
	
	if (total <= 0) {
		return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
	}
	
	const seconds = Math.floor((total / 1000) % 60);
	const minutes = Math.floor((total / 1000 / 60) % 60);
	const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
	const days = Math.floor(total / (1000 * 60 * 60 * 24));
	
	return { total, days, hours, minutes, seconds };
}

/**
 * Format countdown for display
 * @param utcISOString - ISO 8601 datetime string in UTC
 * @returns Formatted countdown string
 */
export function formatCountdown(utcISOString: string): string {
	const remaining = getTimeRemaining(utcISOString);
	
	if (remaining.total <= 0) {
		return 'Available now';
	}
	
	// More than 24 hours: show days and hours
	if (remaining.days > 0) {
		if (remaining.days === 1) {
			return `${remaining.days} day ${remaining.hours}h`;
		}
		return `${remaining.days} days ${remaining.hours}h`;
	}
	
	// Less than 24 hours but more than 1 hour: show HH:MM:SS
	if (remaining.hours > 0) {
		const h = String(remaining.hours).padStart(2, '0');
		const m = String(remaining.minutes).padStart(2, '0');
		const s = String(remaining.seconds).padStart(2, '0');
		return `${h}:${m}:${s}`;
	}
	
	// Less than 1 hour: show MM:SS
	if (remaining.minutes > 0) {
		const m = String(remaining.minutes).padStart(2, '0');
		const s = String(remaining.seconds).padStart(2, '0');
		return `${m}:${s}`;
	}
	
	// Less than 1 minute: show seconds
	return `${remaining.seconds}s`;
}

/**
 * Format countdown with labels for display
 * @param utcISOString - ISO 8601 datetime string in UTC
 * @returns Object with formatted parts and labels
 */
export function formatCountdownWithLabels(utcISOString: string): {
	display: string;
	parts: { value: string; label: string }[];
} {
	const remaining = getTimeRemaining(utcISOString);
	
	if (remaining.total <= 0) {
		return {
			display: 'Available now',
			parts: []
		};
	}
	
	const parts: { value: string; label: string }[] = [];
	
	// More than 24 hours
	if (remaining.days > 0) {
		parts.push({ value: String(remaining.days), label: remaining.days === 1 ? 'day' : 'days' });
		parts.push({ value: String(remaining.hours), label: 'hrs' });
		return {
			display: `${remaining.days} ${remaining.days === 1 ? 'day' : 'days'} ${remaining.hours} hrs`,
			parts
		};
	}
	
	// Less than 24 hours
	if (remaining.hours > 0) {
		parts.push({ value: String(remaining.hours).padStart(2, '0'), label: 'hrs' });
	}
	parts.push({ value: String(remaining.minutes).padStart(2, '0'), label: 'min' });
	parts.push({ value: String(remaining.seconds).padStart(2, '0'), label: 'sec' });
	
	return {
		display: formatCountdown(utcISOString),
		parts
	};
}

/**
 * Get minimum datetime for input (current time + 1 minute)
 * @returns Object with min date and time strings for HTML input
 */
export function getMinDateTime(): { date: string; time: string; datetime: string } {
	const now = new Date();
	// Add 1 minute to ensure it's in the future
	now.setMinutes(now.getMinutes() + 1);
	
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	
	return {
		date: `${year}-${month}-${day}`,
		time: `${hours}:${minutes}`,
		datetime: `${year}-${month}-${day}T${hours}:${minutes}`
	};
}

/**
 * Validate if selected datetime is valid (in the future)
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timeStr - Time string in HH:MM format
 * @returns true if valid, false otherwise
 */
export function isValidSchedule(dateStr: string, timeStr: string): boolean {
	if (!dateStr || !timeStr) return false;
	
	const selectedDatetime = new Date(`${dateStr}T${timeStr}:00`);
	const now = new Date();
	
	return selectedDatetime > now;
}
