export function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "#B8860B"; // Yellow
    case "already":
      return "#008000"; // Green
    default:
      return "#808080"; // Gray for unknown statuses
  }
}
