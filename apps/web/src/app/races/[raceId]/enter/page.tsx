// Server component: can access params synchronously
import EnterRaceClient from "./EnterRaceClient";

export default function Page({ params }: { params: { raceId: string } }) {
  return <EnterRaceClient raceId={params.raceId} />;
}
