import { searchHiAnimeId } from "./src/lib/streaming";

async function main() {
  const result = await searchHiAnimeId("The Seven Deadly Sins OVA", "OVA");
  console.log("Outcome for OVA:", result);

  const result2 = await searchHiAnimeId("The Seven Deadly Sins: Bandit Ban", "OVA");
  console.log("Outcome for Bandit Ban (fallback heuristic test):", result2);
}

main().catch(console.error);
