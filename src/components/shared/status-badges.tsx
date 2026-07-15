import { Badge } from "@/components/ui/badge";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@/types";

const projectLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={status === "completed" ? "success" : status === "paused" ? "warning" : "default"}>{projectLabels[status]}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={status === "done" ? "success" : status === "in_progress" ? "default" : "muted"}>{statusLabels[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={priority === "urgent" ? "danger" : priority === "high" ? "warning" : priority === "medium" ? "default" : "muted"}>{priorityLabels[priority]}</Badge>;
}
