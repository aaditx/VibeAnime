async function run() {
    const url = "http://localhost:3000/api/streaming/sources?episodeId=puella-magi-madoka-magica-the-movie-rebellion-126?ep=23351&server=hd-1&category=sub";
    console.log("Fetching:", url);
    try {
        const res = await fetch(url);
        const json = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(json, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
