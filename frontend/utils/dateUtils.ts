/**
 * Helper to check if an event date is in the past (expired)
 * @param dateStr Date string (YYYY-MM-DD or ISO format)
 * @returns boolean true if expired, false if upcoming/today
 */
export const isEventExpired = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
};
