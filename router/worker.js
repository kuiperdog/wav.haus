export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const config = env.kv.get(url.hostname.split('.').reverse()[2]);

		if (!config || !config.settings)
			return new Response('https://wav.haus', 302)
		
		switch (config.settings.type) {
			case "carrd":
				const content = await fetch(config.settings.url + url.pathname + url.search + url.hash);
				// Appends the original host to relative asset paths to reduce additional requests:
				var html = (await content.text()).replace(/(src|href)=["']((?!http|\/\/|#)[^"']+)/g, `$1="${config.settings.url}/$2`);
				if (config.settings.nofooter)
					html = html.replace(/<[^>]*id\s*=\s*["']credits["'][^>]*>.*?<\/[^>]*>/g, '');
				return new Response(html, {headers: content.headers});

		}

		return new Response();
	},
};