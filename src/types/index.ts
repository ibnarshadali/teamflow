export type Role = "owner" | "member";
export type ProjectStatus = "planning" | "active" | "paused" | "completed";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type Workspace = {
  id: string;
  name: string;
  logoUrl?: string | null;
  ownerId: string;
};

export type Member = Profile & {
  role: Role;
  assignedTaskCount: number;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: string | null;
  targetDate?: string | null;
  updatedAt: string;
  memberIds: string[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  projectId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  actorId: string;
  projectId?: string | null;
  taskId?: string | null;
  type:
    | "workspace_created"
    | "project_created"
    | "project_updated"
    | "task_created"
    | "task_assigned"
    | "task_status_changed"
    | "comment_added"
    | "task_completed";
  message: string;
  createdAt: string;
};

export type TeamFlowData = {
  currentUser: Profile;
  workspace: Workspace;
  members: Member[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  activities: Activity[];
  role: Role;
  demoMode: boolean;
};
