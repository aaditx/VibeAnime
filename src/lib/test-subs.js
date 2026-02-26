// Using dynamic import since the library is TypeScript

async function run() {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch('http://localhost:3000/api/streaming/sources?episodeId=one-piece-100?ep=2142&server=hd-1&category=dub');
    const data = await res.json();
    console.log("Subtitles array length:", data.subtitles?.length);
    console.log(data.subtitles);
}
run();
