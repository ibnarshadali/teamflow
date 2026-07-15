import { TeamFlowWorkspace } from "@/features/workspace/teamflow-workspace";
import { getCurrentUserData } from "@/lib/data";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <TeamFlowWorkspace initialData={await getCurrentUserData()} projectId={projectId} view="project-detail" />;
}
