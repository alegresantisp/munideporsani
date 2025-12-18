import { missionServerRepository } from "@/services/mission/mission.server.repository";
import MisionAdminClient from "./MisionAdminClient";

export const dynamic = "force-dynamic";

export default async function MisionAdminPage() {
  const content = await missionServerRepository.obtener();
  return <MisionAdminClient initialContent={content} />;
}
