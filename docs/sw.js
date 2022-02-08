const version = "v1";

const assets = [
	"index.html",
	"index.js",
	"index.css"
];

self.addEventListener("install", async (event) => {
	const cache = await caches.open(version);
	await cache.addAll(assets);
});

self.addEventListener("activate", async (event) => {
	const cacheNames = await caches.keys();
	await Promise.all(
		cacheNames
			.filter(name => name !== version)
			.map(name => caches.delete(name))
	);
});


/*self.addEventListener("fetch", event => {
	const {request} = event;
	event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
	const cached = await caches.match(request);
	return cached ?? await fetch(request);
}*/
