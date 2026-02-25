import { fetchEpisodesForAnime, fetchEpisodeSources } from "./src/lib/streaming";

async function run() {
    console.log("Testing fetchEpisodesForAnime...");
    try {
        const result = await fetchEpisodesForAnime("Madoka Magica Rebellion", "MOVIE");
        console.log("Episodes result hianimeId:", result.hianimeId);

        if (result.hianimeId) {
            console.log("Testing fetchEpisodeSources for first episode...");
            const sources = await fetchEpisodeSources(`${result.hianimeId}?ep=${result.episodes[0]?.id || ""}`);
            console.log("Sources result:", sources.sources.length, "sources found");
        }
    } catch (e) {
        console.error("Error during tests:", e);
    }
}

run().catch(console.error);
