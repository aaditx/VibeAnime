import { fetchFallbackIframe } from "./src/lib/fallback";
import { fetchEpisodeSources } from "./src/lib/streaming";

async function run() {
    const epId = "puella-magi-madoka-magica-the-movie-rebellion-126?ep=23351";

    console.log("=== Testing sources ===");
    const sources = await fetchEpisodeSources(epId, "hd-1", "sub");
    console.log("Sources:", sources.sources.length);

    console.log("\n=== Testing fallback iframe ===");
    const fallbackUrl = await fetchFallbackIframe(epId, "hd-1", "sub");
    console.log("Fallback URL:", fallbackUrl);

    console.log("\n=== Direct API test ===");
    const apiRes = await fetch(`https://aniwatch-api.vercel.app/api/v2/hianime/episode/sources?animeEpisodeId=${epId}&server=hd-1&category=sub`);
    const apiJson = await apiRes.json();
    console.log("Aniwatch API success:", apiJson.success);
    console.log("Iframe:", apiJson.data?.iframe || null);
    console.log("Sources count:", apiJson.data?.sources?.length || 0);

}

run().catch(console.error);
