"use client";

import Link from "next/link";
import { CalendarDays, Edit3, FolderPlus, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input, SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge, ProjectStatusBadge, TaskStatusBadge } from "@/components/shared/status-badges";
import { StatCard } from "@/components/shared/stat-card";
import { projectStatusOptions, taskPriorityOptions, taskStatusOptions } from "@/constants/options";
import type { Activity, Comment, Member, Project, ProjectStatus, Task, TaskPriority, TaskStatus, TeamFlowData } from "@/types";

type View = "dashboard" | "projects" | "project-new" | "project-detail" | "tasks" | "team" | "profile" | "settings";

type ProjectDraft = {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
};

type TaskDraft = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  projectId: string;
};

const emptyProject: ProjectDraft = {
  name: "",
  description: "",
  status: "active",
  startDate: "",
  targetDate: "",
};

const emptyTask: TaskDraft = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assigneeId: "",
  projectId: "",
};

export function TeamFlowWorkspace({
  initialData,
  view,
  projectId,
}: {
  initialData: TeamFlowData;
  view: View;
  projectId?: string;
}) {
  const [data, setData] = useState(initialData);
  const [projectQuery, setProjectQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | "all">("all");
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "all">("all");
  const [projectDialog, setProjectDialog] = useState<{ mode: "create" | "edit"; project?: Project } | null>(
    view === "project-new" ? { mode: "create" } : null,
  );
  const [taskDialog, setTaskDialog] = useState<{ mode: "create" | "edit"; task?: Task; projectId?: string } | null>(null);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<Project | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const currentProject = data.projects.find((project) => project.id === projectId) ?? data.projects[0];
  const myTasks = data.tasks.filter((task) => task.assigneeId === data.currentUser.id);
  const overdue = myTasks.filter((task) => isOverdue(task) && task.status !== "done");
  const dueToday = myTasks.filter((task) => isToday(task.dueDate) && task.status !== "done");

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function addActivity(message: string, type: Activity["type"], projectIdValue?: string, taskId?: string) {
    setData((current) => ({
      ...current,
      activities: [
        {
          id: crypto.randomUUID(),
          actorId: current.currentUser.id,
          projectId: projectIdValue,
          taskId,
          type,
          message,
          createdAt: new Date().toISOString(),
        },
        ...current.activities,
      ],
    }));
  }

  function saveProject(draft: ProjectDraft, id?: string) {
    if (!draft.name.trim()) {
      notify("Project name is required.");
      return;
    }

    if (id) {
      setData((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.id === id
            ? {
                ...project,
                ...draft,
                startDate: draft.startDate || null,
                targetDate: draft.targetDate || null,
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      }));
      addActivity(`updated ${draft.name}`, "project_updated", id);
      notify("Project updated.");
    } else {
      const nextProject: Project = {
        id: crypto.randomUUID(),
        name: draft.name.trim(),
        description: draft.description.trim(),
        status: draft.status,
        startDate: draft.startDate || null,
        targetDate: draft.targetDate || null,
        updatedAt: new Date().toISOString(),
        memberIds: [data.currentUser.id],
      };
      setData((current) => ({ ...current, projects: [nextProject, ...current.projects] }));
      addActivity(`created ${nextProject.name}`, "project_created", nextProject.id);
      notify("Project created.");
    }
    setProjectDialog(null);
  }

  function deleteProject(project: Project) {
    setData((current) => ({
      ...current,
      projects: current.projects.filter((item) => item.id !== project.id),
      tasks: current.tasks.filter((task) => task.projectId !== project.id),
      comments: current.comments.filter((comment) => current.tasks.find((task) => task.id === comment.taskId)?.projectId !== project.id),
    }));
    setConfirmDeleteProject(null);
    notify("Project deleted.");
  }

  function saveTask(draft: TaskDraft, id?: string) {
    if (!draft.title.trim()) {
      notify("Task title is required.");
      return;
    }

    const project = data.projects.find((item) => item.id === draft.projectId);
    if (!project) {
      notify("Choose a project.");
      return;
    }

    if (id) {
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                ...draft,
                assigneeId: draft.assigneeId || null,
                dueDate: draft.dueDate || null,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      }));
      notify("Task updated.");
    } else {
      const task: Task = {
        id: crypto.randomUUID(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
        assigneeId: draft.assigneeId || null,
        projectId: draft.projectId,
        creatorId: data.currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setData((current) => ({ ...current, tasks: [task, ...current.tasks] }));
      addActivity(`created ${task.title}`, "task_created", task.projectId, task.id);
      notify("Task created.");
    }
    setTaskDialog(null);
  }

  function updateTaskStatus(task: Task, status: TaskStatus) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((item) => (item.id === task.id ? { ...item, status, updatedAt: new Date().toISOString() } : item)),
    }));
    addActivity(`${status === "done" ? "completed" : "moved"} ${task.title}`, status === "done" ? "task_completed" : "task_status_changed", task.projectId, task.id);
  }

  function deleteTask(task: Task) {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((item) => item.id !== task.id),
      comments: current.comments.filter((comment) => comment.taskId !== task.id),
    }));
    setConfirmDeleteTask(null);
    setDetailsTask(null);
    notify("Task deleted.");
  }

  function addComment(task: Task, body: string) {
    if (!body.trim()) {
      return;
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      taskId: task.id,
      authorId: data.currentUser.id,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData((current) => ({ ...current, comments: [...current.comments, comment] }));
    addActivity(`commented on ${task.title}`, "comment_added", task.projectId, task.id);
  }

  const content = (() => {
    switch (view) {
      case "dashboard":
        return (
          <DashboardView
            data={data}
            dueToday={dueToday}
            myTasks={myTasks}
            overdue={overdue}
            onCreateProject={() => setProjectDialog({ mode: "create" })}
            onCreateTask={() => setTaskDialog({ mode: "create", projectId: data.projects[0]?.id })}
            onOpenTask={setDetailsTask}
          />
        );
      case "projects":
      case "project-new":
        return (
          <ProjectsView
            data={data}
            query={projectQuery}
            status={projectStatus}
            onQuery={setProjectQuery}
            onStatus={setProjectStatus}
            onCreate={() => setProjectDialog({ mode: "create" })}
            onEdit={(project) => setProjectDialog({ mode: "edit", project })}
            onDelete={setConfirmDeleteProject}
          />
        );
      case "project-detail":
        return currentProject ? (
          <ProjectDetailView
            data={data}
            project={currentProject}
            onCreateTask={() => setTaskDialog({ mode: "create", projectId: currentProject.id })}
            onDeleteProject={setConfirmDeleteProject}
            onEditProject={(project) => setProjectDialog({ mode: "edit", project })}
            onOpenTask={setDetailsTask}
            onStatusChange={updateTaskStatus}
          />
        ) : (
          <EmptyState title="Project not found" description="The project may have been deleted or is not available in this workspace." />
        );
      case "tasks":
        return (
          <TasksView
            data={data}
            filter={taskFilter}
            onFilter={setTaskFilter}
            onCreateTask={() => setTaskDialog({ mode: "create", projectId: data.projects[0]?.id })}
            onOpenTask={setDetailsTask}
            onStatusChange={updateTaskStatus}
          />
        );
      case "team":
        return <TeamView data={data} notify={notify} />;
      case "profile":
        return <ProfileView data={data} setData={setData} notify={notify} />;
      case "settings":
        return <SettingsView data={data} setData={setData} notify={notify} onDeleteProject={setConfirmDeleteProject} />;
      default:
        return null;
    }
  })();

  return (
    <>
      {content}
      <ProjectDialog dialog={projectDialog} onClose={() => setProjectDialog(null)} onSave={saveProject} />
      <TaskDialog data={data} dialog={taskDialog} onClose={() => setTaskDialog(null)} onSave={saveTask} />
      <TaskDetails
        comments={data.comments}
        members={data.members}
        projects={data.projects}
        task={detailsTask ? data.tasks.find((task) => task.id === detailsTask.id) ?? null : null}
        onClose={() => setDetailsTask(null)}
        onComment={addComment}
        onDelete={setConfirmDeleteTask}
        onEdit={(task) => setTaskDialog({ mode: "edit", task, projectId: task.projectId })}
        onStatusChange={updateTaskStatus}
      />
      <ConfirmDialog
        title="Delete project?"
        description="This deletes the project, its tasks, and comments in this local workspace view."
        open={Boolean(confirmDeleteProject)}
        onClose={() => setConfirmDeleteProject(null)}
        onConfirm={() => confirmDeleteProject && deleteProject(confirmDeleteProject)}
      />
      <ConfirmDialog
        title="Delete task?"
        description="This removes the task and its comments."
        open={Boolean(confirmDeleteTask)}
        onClose={() => setConfirmDeleteTask(null)}
        onConfirm={() => confirmDeleteTask && deleteTask(confirmDeleteTask)}
      />
      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-md border bg-card px-4 py-3 text-sm shadow-lg" role="status">
          {toast}
        </div>
      ) : null}
    </>
  );
}

function DashboardView({
  data,
  myTasks,
  overdue,
  dueToday,
  onCreateProject,
  onCreateTask,
  onOpenTask,
}: {
  data: TeamFlowData;
  myTasks: Task[];
  overdue: Task[];
  dueToday: Task[];
  onCreateProject: () => void;
  onCreateTask: () => void;
  onOpenTask: (task: Task) => void;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${data.currentUser.name.split(" ")[0]}`}
        description="A focused start-of-day view for assigned work, deadlines, and recent movement."
        actions={
          <>
            <Button variant="secondary" onClick={onCreateProject}><FolderPlus className="size-4" />Project</Button>
            <Button onClick={onCreateTask}><Plus className="size-4" />Task</Button>
          </>
        }
      />
      {data.projects.length === 0 ? (
        <EmptyState title="Create your workspace first project" description="TeamFlow starts clean. Add one project, then create tasks and invite members when Supabase is configured." action={<Button onClick={onCreateProject}>Create project</Button>} />
      ) : null}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="My open tasks" value={myTasks.filter((task) => task.status !== "done").length} detail="Assigned to you" />
        <StatCard label="Overdue" value={overdue.length} detail="Needs attention" />
        <StatCard label="Due today" value={dueToday.length} detail="Plan next" />
        <StatCard label="Active projects" value={data.projects.filter((project) => project.status === "active").length} detail="In motion" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <TaskSection title="My Tasks" tasks={myTasks.filter((task) => task.status !== "done")} data={data} onOpenTask={onOpenTask} />
        <TaskSection title="Overdue Tasks" tasks={overdue} data={data} onOpenTask={onOpenTask} />
        <TaskSection title="Tasks Due Today" tasks={dueToday} data={data} onOpenTask={onOpenTask} />
        <ActivitySection data={data} />
        <ProjectSummary data={data} />
        <Deadlines data={data} />
      </div>
    </div>
  );
}

function ProjectsView({
  data,
  query,
  status,
  onQuery,
  onStatus,
  onCreate,
  onEdit,
  onDelete,
}: {
  data: TeamFlowData;
  query: string;
  status: ProjectStatus | "all";
  onQuery: (query: string) => void;
  onStatus: (status: ProjectStatus | "all") => void;
  onCreate: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const projects = useMemo(
    () =>
      data.projects
        .filter((project) => project.name.toLowerCase().includes(query.toLowerCase()))
        .filter((project) => (status === "all" ? true : project.status === status))
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [data.projects, query, status],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Plan, track, and review active team work." actions={<Button onClick={onCreate}><Plus className="size-4" />Create Project</Button>} />
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <SearchInput value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search projects" />
        <Select value={status} onChange={(event) => onStatus(event.target.value as ProjectStatus | "all")}>
          <option value="all">All statuses</option>
          {projectStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
      </div>
      {projects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard data={data} key={project.id} project={project} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <EmptyState title="No projects match this view" description="Adjust search or status filters, or create a project to start organizing work." action={<Button onClick={onCreate}>Create project</Button>} />
      )}
    </div>
  );
}

function ProjectCard({
  data,
  project,
  onEdit,
  onDelete,
}: {
  data: TeamFlowData;
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const tasks = data.tasks.filter((task) => task.projectId === project.id);
  const done = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link className="text-base font-semibold hover:text-primary" href={`/projects/${project.id}`}>{project.name}</Link>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Metric label="Tasks" value={tasks.length} />
          <Metric label="Members" value={project.memberIds.length} />
          <Metric label="Updated" value={formatDate(project.updatedAt, "short")} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(project)}><Edit3 className="size-4" />Edit</Button>
          {data.role === "owner" ? <Button variant="ghost" size="sm" onClick={() => onDelete(project)}><Trash2 className="size-4" />Delete</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectDetailView({
  data,
  project,
  onCreateTask,
  onOpenTask,
  onStatusChange,
  onEditProject,
  onDeleteProject,
}: {
  data: TeamFlowData;
  project: Project;
  onCreateTask: () => void;
  onOpenTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}) {
  const [tab, setTab] = useState<"overview" | "board" | "members" | "activity">("overview");
  const projectTasks = data.tasks.filter((task) => task.projectId === project.id);
  const members = data.members.filter((member) => project.memberIds.includes(member.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description}
        actions={
          <>
            <Button variant="secondary" onClick={() => onEditProject(project)}><Edit3 className="size-4" />Edit</Button>
            {data.role === "owner" ? <Button variant="destructive" onClick={() => onDeleteProject(project)}><Trash2 className="size-4" />Delete</Button> : null}
            <Button onClick={onCreateTask}><Plus className="size-4" />Task</Button>
          </>
        }
      />
      <div className="flex gap-2 overflow-x-auto border-b">
        {(["overview", "board", "members", "activity"] as const).map((item) => (
          <button className={`border-b-2 px-3 py-2 text-sm font-medium capitalize ${tab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} key={item} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <TaskSection title="Upcoming Tasks" tasks={projectTasks.filter((task) => task.status !== "done")} data={data} onOpenTask={onOpenTask} />
          <Card className="p-5">
            <CardTitle>Members</CardTitle>
            <div className="mt-4 space-y-3">{members.map((member) => <MemberRow key={member.id} member={member} />)}</div>
          </Card>
          <ActivitySection data={{ ...data, activities: data.activities.filter((activity) => activity.projectId === project.id) }} />
          <Card className="p-5">
            <CardTitle>Quick actions</CardTitle>
            <div className="mt-4 grid gap-2">
              <Button onClick={onCreateTask}><Plus className="size-4" />Create task</Button>
              <Button variant="secondary" onClick={() => onEditProject(project)}>Update project details</Button>
            </div>
          </Card>
        </div>
      ) : null}
      {tab === "board" ? <KanbanBoard data={data} tasks={projectTasks} onOpenTask={onOpenTask} onStatusChange={onStatusChange} /> : null}
      {tab === "members" ? <Card className="p-5"><div className="grid gap-3 md:grid-cols-2">{members.map((member) => <MemberRow key={member.id} member={member} />)}</div></Card> : null}
      {tab === "activity" ? <ActivitySection data={{ ...data, activities: data.activities.filter((activity) => activity.projectId === project.id) }} /> : null}
    </div>
  );
}

function TasksView({
  data,
  filter,
  onFilter,
  onCreateTask,
  onOpenTask,
  onStatusChange,
}: {
  data: TeamFlowData;
  filter: TaskStatus | "all";
  onFilter: (status: TaskStatus | "all") => void;
  onCreateTask: () => void;
  onOpenTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const assigned = data.tasks.filter((task) => task.assigneeId === data.currentUser.id);
  const visible = assigned.filter((task) => (filter === "all" ? true : task.status === filter));
  return (
    <div className="space-y-6">
      <PageHeader title="My Tasks" description="Assigned work grouped by urgency and status." actions={<Button onClick={onCreateTask}><Plus className="size-4" />Create Task</Button>} />
      <div className="flex max-w-xs"><Select value={filter} onChange={(event) => onFilter(event.target.value as TaskStatus | "all")}><option value="all">All assigned tasks</option>{taskStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></div>
      <KanbanBoard data={data} tasks={visible} onOpenTask={onOpenTask} onStatusChange={onStatusChange} />
    </div>
  );
}

function TeamView({ data, notify }: { data: TeamFlowData; notify: (message: string) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Workspace members and their current assignment load."
        actions={data.role === "owner" ? <Button onClick={() => notify("Local invitation recorded. Configure Supabase email delivery for real invites.")}><Plus className="size-4" />Invite member</Button> : undefined}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.members.map((member) => (
          <Card className="p-5" key={member.id}>
            <MemberRow member={member} />
            <div className="mt-4 flex justify-between border-t pt-4 text-sm">
              <span className="text-muted-foreground">Assigned tasks</span>
              <span className="font-medium">{member.assignedTaskCount}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfileView({
  data,
  setData,
  notify,
}: {
  data: TeamFlowData;
  setData: React.Dispatch<React.SetStateAction<TeamFlowData>>;
  notify: (message: string) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const avatarUrl = String(form.get("avatarUrl") ?? "");
    setData((current) => ({
      ...current,
      currentUser: { ...current.currentUser, name, avatarUrl },
      members: current.members.map((member) => (member.id === current.currentUser.id ? { ...member, name, avatarUrl } : member)),
    }));
    notify("Profile updated.");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your identity and password settings." />
      <Card className="max-w-2xl p-5">
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Name"><Input name="name" defaultValue={data.currentUser.name} /></Field>
          <Field label="Avatar URL"><Input name="avatarUrl" defaultValue={data.currentUser.avatarUrl ?? ""} /></Field>
          <Field label="Email"><Input value={data.currentUser.email} disabled readOnly /></Field>
          <Field label="New password"><Input type="password" placeholder="Configure Supabase to update password" /></Field>
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
    </div>
  );
}

function SettingsView({
  data,
  setData,
  notify,
  onDeleteProject,
}: {
  data: TeamFlowData;
  setData: React.Dispatch<React.SetStateAction<TeamFlowData>>;
  notify: (message: string) => void;
  onDeleteProject: (project: Project) => void;
}) {
  const owner = data.role === "owner";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!owner) {
      notify("Only workspace owners can update settings.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setData((current) => ({
      ...current,
      workspace: {
        ...current.workspace,
        name: String(form.get("name") ?? current.workspace.name),
        logoUrl: String(form.get("logoUrl") ?? current.workspace.logoUrl),
      },
    }));
    notify("Workspace settings updated.");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Owner-only workspace configuration and guarded destructive actions." />
      {!owner ? <EmptyState title="Owner access required" description="Members can view workspace information but cannot change owner-only settings." /> : null}
      <Card className="max-w-2xl p-5">
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Workspace name"><Input name="name" defaultValue={data.workspace.name} disabled={!owner} /></Field>
          <Field label="Workspace logo URL"><Input name="logoUrl" defaultValue={data.workspace.logoUrl ?? ""} disabled={!owner} /></Field>
          <Button type="submit" disabled={!owner}>Save workspace</Button>
        </form>
      </Card>
      <Card className="p-5">
        <CardTitle>Danger zone</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.projects.map((project) => (
            <div className="flex items-center justify-between gap-3 rounded-md border p-3" key={project.id}>
              <span className="min-w-0 truncate text-sm font-medium">{project.name}</span>
              <Button variant="destructive" size="sm" disabled={!owner} onClick={() => onDeleteProject(project)}>Delete</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KanbanBoard({
  data,
  tasks,
  onOpenTask,
  onStatusChange,
}: {
  data: TeamFlowData;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {taskStatusOptions.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.value);
        return (
          <section className="min-h-72 rounded-md border bg-muted/35 p-3" key={column.value}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{column.label}</h2>
              <Badge tone="muted">{columnTasks.length}</Badge>
            </div>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard data={data} key={task.id} task={task} onOpen={onOpenTask} onStatusChange={onStatusChange} />
              ))}
              {columnTasks.length === 0 ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No tasks here.</p> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TaskSection({ title, tasks, data, onOpenTask }: { title: string; tasks: Task[]; data: TeamFlowData; onOpenTask: (task: Task) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {tasks.length ? tasks.slice(0, 6).map((task) => <TaskCard compact data={data} key={task.id} task={task} onOpen={onOpenTask} />) : <p className="text-sm text-muted-foreground">No tasks in this section.</p>}
      </CardContent>
    </Card>
  );
}

function TaskCard({
  task,
  data,
  onOpen,
  onStatusChange,
  compact,
}: {
  task: Task;
  data: TeamFlowData;
  onOpen: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  compact?: boolean;
}) {
  const assignee = data.members.find((member) => member.id === task.assigneeId);
  const project = data.projects.find((item) => item.id === task.projectId);
  return (
    <Card className="p-4">
      <button className="block w-full text-left" onClick={() => onOpen(task)}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-sm font-semibold">{task.title}</h3>
          <PriorityBadge priority={task.priority} />
        </div>
        {!compact ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{task.description || "No description."}</p> : null}
      </button>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <TaskStatusBadge status={task.status} />
        {task.dueDate ? <span className={isOverdue(task) ? "font-medium text-destructive" : ""}><CalendarDays className="mr-1 inline size-3" />{formatDate(task.dueDate)}</span> : null}
        <span>{project?.name}</span>
        {assignee ? <span>{assignee.name}</span> : <span>Unassigned</span>}
      </div>
      {onStatusChange ? (
        <div className="mt-3">
          <Select value={task.status} onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)}>
            {taskStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
        </div>
      ) : null}
    </Card>
  );
}

function ActivitySection({ data }: { data: TeamFlowData }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.activities.length ? data.activities.slice(0, 7).map((activity) => {
          const actor = data.members.find((member) => member.id === activity.actorId) ?? data.currentUser;
          return (
            <div className="flex gap-3" key={activity.id}>
              <Avatar name={actor.name} src={actor.avatarUrl} className="size-8" />
              <div>
                <p className="text-sm"><span className="font-medium">{actor.name}</span> {activity.message}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
              </div>
            </div>
          );
        }) : <p className="text-sm text-muted-foreground">No activity yet.</p>}
      </CardContent>
    </Card>
  );
}

function ProjectSummary({ data }: { data: TeamFlowData }) {
  return (
    <Card>
      <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {data.projects.filter((project) => project.status === "active").map((project) => <ProjectCard data={data} key={project.id} project={project} onEdit={() => undefined} onDelete={() => undefined} />)}
      </CardContent>
    </Card>
  );
}

function Deadlines({ data }: { data: TeamFlowData }) {
  const deadlines = data.tasks.filter((task) => task.dueDate && task.status !== "done").sort((a, b) => Date.parse(a.dueDate ?? "") - Date.parse(b.dueDate ?? "")).slice(0, 5);
  return (
    <Card>
      <CardHeader><CardTitle>Upcoming Deadlines</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {deadlines.length ? deadlines.map((task) => <div className="flex justify-between gap-3 text-sm" key={task.id}><span className="min-w-0 truncate">{task.title}</span><span className="text-muted-foreground">{formatDate(task.dueDate)}</span></div>) : <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>}
      </CardContent>
    </Card>
  );
}

function ProjectDialog({ dialog, onClose, onSave }: { dialog: { mode: "create" | "edit"; project?: Project } | null; onClose: () => void; onSave: (draft: ProjectDraft, id?: string) => void }) {
  const project = dialog?.project;
  return (
    <Dialog open={Boolean(dialog)} title={dialog?.mode === "edit" ? "Edit project" : "Create project"} onClose={onClose}>
      <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSave({
          name: String(form.get("name") ?? ""),
          description: String(form.get("description") ?? ""),
          status: form.get("status") as ProjectStatus,
          startDate: String(form.get("startDate") ?? ""),
          targetDate: String(form.get("targetDate") ?? ""),
        }, project?.id);
      }}>
        <Field label="Name"><Input name="name" defaultValue={project?.name ?? emptyProject.name} required /></Field>
        <Field label="Description"><Textarea name="description" defaultValue={project?.description ?? emptyProject.description} /></Field>
        <Field label="Status"><Select name="status" defaultValue={project?.status ?? emptyProject.status}>{projectStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date"><Input name="startDate" type="date" defaultValue={dateInput(project?.startDate)} /></Field>
          <Field label="Target date"><Input name="targetDate" type="date" defaultValue={dateInput(project?.targetDate)} /></Field>
        </div>
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save project</Button></div>
      </form>
    </Dialog>
  );
}

function TaskDialog({ data, dialog, onClose, onSave }: { data: TeamFlowData; dialog: { mode: "create" | "edit"; task?: Task; projectId?: string } | null; onClose: () => void; onSave: (draft: TaskDraft, id?: string) => void }) {
  const task = dialog?.task;
  return (
    <Dialog open={Boolean(dialog)} title={dialog?.mode === "edit" ? "Edit task" : "Create task"} onClose={onClose}>
      <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSave({
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          status: form.get("status") as TaskStatus,
          priority: form.get("priority") as TaskPriority,
          dueDate: String(form.get("dueDate") ?? ""),
          assigneeId: String(form.get("assigneeId") ?? ""),
          projectId: String(form.get("projectId") ?? ""),
        }, task?.id);
      }}>
        <Field label="Title"><Input name="title" defaultValue={task?.title ?? emptyTask.title} required /></Field>
        <Field label="Description"><Textarea name="description" defaultValue={task?.description ?? emptyTask.description} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project"><Select name="projectId" defaultValue={task?.projectId ?? dialog?.projectId ?? data.projects[0]?.id ?? ""}>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field>
          <Field label="Assignee"><Select name="assigneeId" defaultValue={task?.assigneeId ?? data.currentUser.id}><option value="">Unassigned</option>{data.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</Select></Field>
          <Field label="Status"><Select name="status" defaultValue={task?.status ?? emptyTask.status}>{taskStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>
          <Field label="Priority"><Select name="priority" defaultValue={task?.priority ?? emptyTask.priority}>{taskPriorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field>
          <Field label="Due date"><Input name="dueDate" type="date" defaultValue={dateInput(task?.dueDate)} /></Field>
        </div>
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save task</Button></div>
      </form>
    </Dialog>
  );
}

function TaskDetails({
  task,
  members,
  projects,
  comments,
  onClose,
  onEdit,
  onDelete,
  onComment,
  onStatusChange,
}: {
  task: Task | null;
  members: Member[];
  projects: Project[];
  comments: Comment[];
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComment: (task: Task, body: string) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const [comment, setComment] = useState("");
  if (!task) {
    return null;
  }
  const assignee = members.find((member) => member.id === task.assigneeId);
  const project = projects.find((item) => item.id === task.projectId);
  const taskComments = comments.filter((item) => item.taskId === task.id);
  return (
    <Dialog open={Boolean(task)} title={task.title} description={project?.name} onClose={onClose} className="sm:max-w-3xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">{task.description || "No description provided."}</p>
          <div>
            <h3 className="text-sm font-semibold">Comments</h3>
            <div className="mt-3 space-y-3">
              {taskComments.map((item) => {
                const author = members.find((member) => member.id === item.authorId);
                return <div className="rounded-md border p-3" key={item.id}><p className="text-sm">{item.body}</p><p className="mt-2 text-xs text-muted-foreground">{author?.name ?? "Unknown"} · {formatDate(item.createdAt)}</p></div>;
              })}
            </div>
            <form className="mt-3 space-y-2" onSubmit={(event) => { event.preventDefault(); onComment(task, comment); setComment(""); }}>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" />
              <Button type="submit">Comment</Button>
            </form>
          </div>
        </div>
        <aside className="space-y-4 rounded-md border bg-muted/30 p-4">
          <Info label="Status"><Select value={task.status} onChange={(event) => onStatusChange(task, event.target.value as TaskStatus)}>{taskStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Info>
          <Info label="Priority"><PriorityBadge priority={task.priority} /></Info>
          <Info label="Due date">{task.dueDate ? formatDate(task.dueDate) : "No due date"}</Info>
          <Info label="Assignee">{assignee ? <span className="flex items-center gap-2"><Avatar name={assignee.name} src={assignee.avatarUrl} className="size-7" />{assignee.name}</span> : "Unassigned"}</Info>
          <Info label="Created">{formatDate(task.createdAt)}</Info>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(task)}><Edit3 className="size-4" />Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(task)}><Trash2 className="size-4" />Delete</Button>
          </div>
        </aside>
      </div>
    </Dialog>
  );
}

function ConfirmDialog({ open, title, description, onClose, onConfirm }: { open: boolean; title: string; description: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} title={title} description={description} onClose={onClose} className="sm:max-w-md">
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm}>Confirm delete</Button>
      </div>
    </Dialog>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={member.name} src={member.avatarUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
      <Badge tone={member.role === "owner" ? "default" : "muted"}>{member.role}</Badge>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm font-medium"><span>{label}</span>{children}</label>;
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{label}</p><div className="text-sm">{children}</div></div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md bg-muted p-2 text-center"><p className="font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}

function isOverdue(task: Task) {
  if (!task.dueDate) {
    return false;
  }
  return Date.parse(task.dueDate) < startOfToday().getTime();
}

function isToday(value?: string | null) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  const today = startOfToday();
  return date >= today && date < new Date(today.getTime() + 86400000);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(value?: string | null, style: "default" | "short" = "default") {
  if (!value) {
    return "Not set";
  }
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", ...(style === "default" ? { year: "numeric" } : {}) }).format(new Date(value));
}

function dateInput(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
