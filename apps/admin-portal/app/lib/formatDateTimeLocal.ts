export const formatDateTimeLocal = (date: string | Date) => {
  return new Date(date).toISOString().slice(0, 16);
};