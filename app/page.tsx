import { AnatomyApp } from "./components/AnatomyApp";
import { organById, type OrganId } from "./lib/anatomy-data";

/**
 * `?organ=heart` lets Library and Systems open Explore on a specific specimen,
 * so those pages lead somewhere concrete instead of dropping the student back
 * on the default view.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ organ?: string }>;
}) {
  const { organ } = await searchParams;
  const requested = organ && organ in organById ? (organ as OrganId) : undefined;
  return <AnatomyApp initialOrganId={requested} />;
}
