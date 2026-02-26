import { fetchEpisodeSources } from './streaming';

async function test() {
    const episodeId = 'one-piece-100?ep=2142';
    try {
        const data = await fetchEpisodeSources(episodeId, 'hd-1', 'dub');
        let mergedSubtitles = data.subtitles || [];

        const subData = await fetchEpisodeSources(episodeId, 'hd-1', 'sub');
        if (subData?.subtitles?.length) {
            const existingLangs = new Set(mergedSubtitles.map(s => s.lang));
            const newSubs = subData.subtitles.filter(s => !existingLangs.has(s.lang));
            mergedSubtitles = [...mergedSubtitles, ...newSubs];
        }

        console.log("Merged sub count:", mergedSubtitles.length);
        console.log(mergedSubtitles);
    } catch (err) {
        console.error(err);
    }
}
test();
