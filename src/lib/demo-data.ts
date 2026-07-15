import type { TeamFlowData } from "@/types";

const today = new Date();
const iso = (offsetDays: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
};

export const demoData: TeamFlowData = {
  demoMode: true,
  role: "owner",
  currentUser: {
    id: "u-1",
    name: "Ava Khan",
    email: "ava@teamflow.test",
  },
  workspace: {
    id: "w-1",
    name: "TeamFlow Studio",
    ownerId: "u-1",
  },
  members: [
    { id: "u-1", name: "Ava Khan", email: "ava@teamflow.test", role: "owner", assignedTaskCount: 5 },
    { id: "u-2", name: "Mina Patel", email: "mina@teamflow.test", role: "member", assignedTaskCount: 4 },
    { id: "u-3", name: "Jon Bell", email: "jon@teamflow.test", role: "member", assignedTaskCount: 3 },
  ],
  projects: [
    {
      id: "p-1",
      name: "Client Portal",
      description: "A focused portal for customers to review milestones, tasks, and release notes.",
      status: "active",
      startDate: iso(-18),
      targetDate: iso(18),
      updatedAt: iso(-1),
      memberIds: ["u-1", "u-2"],
    },
    {
      id: "p-2",
      name: "Mobile QA Sprint",
      description: "Stabilize tablet and mobile workflows before the next production release.",
      status: "planning",
      startDate: iso(2),
      targetDate: iso(25),
      updatedAt: iso(-3),
      memberIds: ["u-1", "u-3"],
    },
    {
      id: "p-3",
      name: "Billing Settings",
      description: "Improve account settings IA and prepare billing surfaces for a later version.",
      status: "paused",
      targetDate: iso(45),
      updatedAt: iso(-8),
      memberIds: ["u-2", "u-3"],
    },
  ],
  tasks: [
    {
      id: "t-1",
      title: "Design project activity empty state",
      description: "Create an empty state that explains activity without feeling like tutorial copy.",
      status: "in_progress",
      priority: "high",
      dueDate: iso(0),
      assigneeId: "u-1",
      projectId: "p-1",
      creatorId: "u-1",
      createdAt: iso(-5),
      updatedAt: iso(-1),
    },
    {
      id: "t-2",
      title: "Wire Supabase RLS policies",
      description: "Validate access by workspace membership and owner-only settings actions.",
      status: "todo",
      priority: "urgent",
      dueDate: iso(-1),
      assigneeId: "u-1",
      projectId: "p-1",
      creatorId: "u-2",
      createdAt: iso(-7),
      updatedAt: iso(-2),
    },
    {
      id: "t-3",
      title: "QA compact task cards",
      description: "Make sure task cards wrap long titles and remain touch-friendly on mobile.",
      status: "todo",
      priority: "medium",
      dueDate: iso(3),
      assigneeId: "u-3",
      projectId: "p-2",
      creatorId: "u-1",
      createdAt: iso(-2),
      updatedAt: iso(-2),
    },
    {
      id: "t-4",
      title: "Publish first settings pass",
      description: "Owner can update workspace name and review danger-zone protections.",
      status: "done",
      priority: "low",
      dueDate: iso(-2),
      assigneeId: "u-2",
      projectId: "p-3",
      creatorId: "u-1",
      createdAt: iso(-12),
      updatedAt: iso(-1),
    },
  ],
  comments: [
    {
      id: "c-1",
      taskId: "t-1",
      authorId: "u-2",
      body: "Keep the copy short. The empty state should offer one clear next action.",
      createdAt: iso(-1),
      updatedAt: iso(-1),
    },
  ],
  activities: [
    { id: "a-1", actorId: "u-1", projectId: "p-1", type: "project_created", message: "created Client Portal", createdAt: iso(-18) },
    { id: "a-2", actorId: "u-2", projectId: "p-1", taskId: "t-1", type: "comment_added", message: "commented on Design project activity empty state", createdAt: iso(-1) },
    { id: "a-3", actorId: "u-1", projectId: "p-3", taskId: "t-4", type: "task_completed", message: "completed Publish first settings pass", createdAt: iso(-1) },
  ],
};
