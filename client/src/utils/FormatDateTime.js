export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".");
  return `${formattedDate} At ${formattedTime}`;
};
