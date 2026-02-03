export const formatCreatedAt = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  // You can customize the options below if you want a different format
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
