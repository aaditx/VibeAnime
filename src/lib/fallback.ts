export async function fetchFallbackIframe(episodeId: string, server: "hd-1" | "hd-2", category: "sub" | "dub" | "raw"): Promise<string | null> {
    try {
        const epIdMatch = episodeId.match(/ep=(\d+)/);
        const epId = epIdMatch ? epIdMatch[1] : null;
        if (!epId) return null;

        // 1. Get raw HTML for servers
        const serversRes = await fetch(`https://hianimez.to/ajax/v2/episode/servers?episodeId=${epId}`);
        if (!serversRes.ok) return null;
        const serversJson = await serversRes.json();
        const html = serversJson.html || "";

        // Convert server name to HiAnime's internal server-id
        // hd-1 = 4, hd-2 = 1, etc.
        const internalServerId = server === "hd-1" ? "4" : "1";

        // 2. Find the data-id for the specific server and category
        // e.g. data-type="sub" ... data-server-id="4"
        const regex = new RegExp(`data-type="${category}"[^>]*data-id="(\\d+)"[^>]*data-server-id="${internalServerId}"`);
        let match = html.match(regex);

        // If exact server not found, fallback to anything in that category
        if (!match) {
            const fallbackRegex = new RegExp(`data-type="${category}"[^>]*data-id="(\\d+)"`);
            match = html.match(fallbackRegex);
        }

        if (!match) return null;
        const sourceId = match[1];

        // 3. Get the iframe link
        const linkRes = await fetch(`https://hianimez.to/ajax/v2/episode/sources?id=${sourceId}`);
        if (!linkRes.ok) return null;
        const linkJson = await linkRes.json();

        return linkJson.link || null;
    } catch (err) {
        console.error("[fetchFallbackIframe] Error:", err);
        return null;
    }
}
