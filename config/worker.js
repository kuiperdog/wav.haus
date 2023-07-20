const bcrypt = require('bcryptjs')

export default {
  async fetch(request, env, _) {
    if (request.method == "GET") {
      const name = new URL(request.url).searchParams.get('name')
      if (!name || name == "www" || name.startsWith('-') || name.endsWith('-'))
        return new Response('invalid');
      return new Response(await env.kv.get(name) ? 'taken' : 'available')
    } else if (request.method == "POST") {
      const config = await request.json();
      var entry = JSON.parse(await env.kv.get(config.name));

      if (!entry) {
        const hash = await bcrypt.hash(config.password, 10);
        if (!hash || !config.password)
          return new Response('error');

        await env.kv.put(config.name, JSON.stringify({ name: config.name, password: hash, settings: {} }));
        return new Response('success');
      }
      
      if (!await bcrypt.compare(config.password, entry.password))
        return new Response ('error');
              
      entry.settings = config.settings;
      await env.kv.put(config.name, JSON.stringify(entry));
      return new Response('success');
    }
    return new Response('');
  },
};
