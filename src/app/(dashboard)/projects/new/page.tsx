import { TeamFlowWorkspace } from "@/features/workspace/teamflow-workspace";
import { getCurrentUserData } from "@/lib/data";

export default async function NewProjectPage() {
  return <TeamFlowWorkspace initialData={await getCurrentUserData()} view="project-new" />;
}
