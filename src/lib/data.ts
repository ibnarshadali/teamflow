import { demoData } from "@/lib/demo-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Activity, Comment, Member, Project, Task, TeamFlowData, Workspace } from "@/types";

type WorkspaceMemberRow = {
  role: "owner" | "member";
  profiles:
    | { id: string; full_name: string | null; email: string | null; avatar_url: string | null }
    | { id: string; full_name: string | null; email: string | null; avatar_url: string | null }[]
    | null;
};

export async function getCurrentUserData(): Promise<TeamFlowData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return demoData;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ...demoData, demoMode: true };
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role, workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!member) {
    return {
      ...demoData,
      demoMode: false,
      currentUser: {
        id: user.id,
        name: profile?.full_name ?? user.email ?? "New user",
        email: user.email ?? "",
        avatarUrl: profile?.avatar_url,
      },
      workspace: { id: "needs-workspace", name: "Create your workspace", ownerId: user.id },
      members: [],
      projects: [],
      tasks: [],
      comments: [],
      activities: [],
      role: "owner",
    };
  }

  const workspaceId = member.workspace_id as string;
  const [{ data: workspace }, { data: memberRows }, { data: projectRows }, { data: taskRows }, { data: commentRows }, { data: activityRows }] =
    await Promise.all([
      supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
      supabase.from("workspace_members").select("role, profiles(id, full_name, email, avatar_url)").eq("workspace_id", workspaceId),
      supabase.from("projects").select("*, project_members(user_id)").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }),
      supabase.from("comments").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true }),
      supabase.from("activities").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(50),
    ]);

  const tasks = (taskRows ?? []).map(
    (task): Task => ({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      projectId: task.project_id,
      creatorId: task.creator_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }),
  );

  const members = ((memberRows ?? []) as WorkspaceMemberRow[]).map((row): Member => {
    const profileRow = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: profileRow?.id ?? "",
      name: profileRow?.full_name ?? "Workspace member",
      email: profileRow?.email ?? "",
      avatarUrl: profileRow?.avatar_url,
      role: row.role,
      assignedTaskCount: tasks.filter((task) => task.assigneeId === profileRow?.id).length,
    };
  });

  return {
    demoMode: false,
    role: member.role,
    currentUser: {
      id: user.id,
      name: profile?.full_name ?? user.email ?? "TeamFlow user",
      email: user.email ?? "",
      avatarUrl: profile?.avatar_url,
    },
    workspace: {
      id: workspace?.id ?? workspaceId,
      name: workspace?.name ?? "Workspace",
      logoUrl: workspace?.logo_url,
      ownerId: workspace?.owner_id ?? user.id,
    } satisfies Workspace,
    members,
    projects: (projectRows ?? []).map(
      (project): Project => ({
        id: project.id,
        name: project.name,
        description: project.description ?? "",
        status: project.status,
        startDate: project.start_date,
        targetDate: project.target_date,
        updatedAt: project.updated_at,
        memberIds: (project.project_members ?? []).map((projectMember: { user_id: string }) => projectMember.user_id),
      }),
    ),
    tasks,
    comments: (commentRows ?? []).map(
      (comment): Comment => ({
        id: comment.id,
        taskId: comment.task_id,
        authorId: comment.author_id,
        body: comment.body,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
      }),
    ),
    activities: (activityRows ?? []).map(
      (activity): Activity => ({
        id: activity.id,
        actorId: activity.actor_id,
        projectId: activity.project_id,
        taskId: activity.task_id,
        type: activity.type,
        message: activity.message,
        createdAt: activity.created_at,
      }),
    ),
  };
}
