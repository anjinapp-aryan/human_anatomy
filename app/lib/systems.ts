import { organs, type Organ } from "./anatomy-data";

/**
 * Body systems are *derived* from the organ data rather than stored separately.
 *
 * Every organ already declares the system it belongs to, so grouping on that
 * field keeps `anatomy-data.ts` the single source of truth: adding an organ adds
 * it to its system automatically, and there is no second copy of anatomy content
 * to drift out of sync.
 *
 * Deliberately, no system carries an authored description. Writing new prose
 * about what each system does would introduce anatomical statements that nothing
 * in this repository sources or reviews. Everything a system page shows is
 * already-authored organ content.
 */
export type BodySystem = {
  /** URL slug, derived from the name — "Nervous System" -> "nervous-system". */
  slug: string;
  name: string;
  organs: Organ[];
};

export function systemSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const systems: BodySystem[] = (() => {
  const grouped = new Map<string, Organ[]>();
  for (const organ of organs) {
    const list = grouped.get(organ.system);
    if (list) list.push(organ);
    else grouped.set(organ.system, [organ]);
  }
  return [...grouped.entries()]
    .map(([name, members]) => ({ slug: systemSlug(name), name, organs: members }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

export const systemBySlug = Object.fromEntries(
  systems.map((system) => [system.slug, system]),
) as Record<string, BodySystem | undefined>;
