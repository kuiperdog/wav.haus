import embedwrapper from './embed.html';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const config = JSON.parse(await env.kv.get(url.hostname.split('.').reverse()[2]));

		if (!config || !config.settings)
			return Response.redirect('https://wav.haus', 302);
		
		switch (config.settings.type) {
			case "carrd":
				const content = await fetch(config.settings.url + url.pathname + url.search + url.hash);
				// Appends the original host to relative asset paths to reduce additional requests:
				if (content.headers.get('Content-Type').includes('text/html')) {
					var html = (await content.text()).replace(/(src|href)=["']((?!http|\/\/|#)[^"']+)/g, `$1="${config.settings.url}/$2`);
					if (config.settings.nofooter)
						html = html.replace(/<[^>]*id\s*=\s*["']credits["'][^>]*>.*?<\/[^>]*>/g, '');
					return new Response(html, {headers: content.headers});
				}
				return new Response(content.body, content);
			case "embed":
				var html = embedwrapper.replace('%DOMAIN%', url.hostname).replace('%LINK%', config.settings.url);
				return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
			case "redirect":
				return Response.redirect(config.settings.url, 302);
		}

		return new Response();
	},
};