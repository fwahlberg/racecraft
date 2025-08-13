// apps/web/src/app/races/[raceId]/enter/page.tsx
import EnterRaceClient from "./EnterRaceClient";

export default async function Page({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params; // ← unwrap the Promise
  return <EnterRaceClient raceId={raceId} />;
}