export const PROJECT_STATUS = ["Not Started", "In Progress", "Completed", "On Hold"];
export const TASK_STATUS = ["To Do", "In Progress", "Done", "Cancelled"];
export const TASK_PRIORITY = ["Low", "Medium", "High", "Critical"];

export const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "No due date";
