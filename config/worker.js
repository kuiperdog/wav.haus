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

      if (!config.password)
        return new Response('fail');

      if (!entry) {
        const hash = await bcrypt.hash(config.password, 10);
        if (!hash)
          return new Response('fail');

        await env.kv.put(config.name, JSON.stringify({ name: config.name, password: hash, settings: {} }));
        return new Response('success');
      }
      
      if (!await bcrypt.compare(config.password, entry.password) || !config.settings)
        return new Response ('fail');
      
      var dnserr = false;
      if (entry.settings && (entry.settings.type == 'ghpages' || entry.settings.type == 'dns'))
        dnserr = await unsetRecords(config.name, entry);
      if (config.settings.type == 'ghpages' || config.settings.type == 'dns')
        dnserr = await setRecords(config.name, config);
      if (dnserr)
        return new Response('error');

      entry.settings = config.settings;
      await env.kv.put(config.name, JSON.stringify(entry));
      return new Response('success');
    }
    return new Response('');
  },
};

async function setRecords(name, config) {
  return await fetch('https://api.cloudflare.com/client/v4/zones/' + env.cf_zone + '/dns_records', {
    method: 'POST',
    headers: {
      'Authorzation': 'Bearer ' + env.cf_token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: config.settings.type == 'dns' ? 'NS' : 'CNAME',
      name: name + '.wav.haus',
      content: config.settings.url
    })
  }).ok;
}

async function unsetRecords(name, config) {
  const res = await fetch('https://api.cloudflare.com/client/v4/zones/' + env.cf_zone + '/dns_records?name=' + name,
    { headers: { 'Authorzation': 'Bearer ' + env.cf_token} });
  
  if (!res.ok)
    return false;
  
    const data = await res.json();
    const record = data.result.find(i => i.type == 'NS' || i.type == 'CNAME');

  return await fetch('https://api.cloudflare.com/client/v4/zones/' + env.cf_zone + '/dns_records/' + record,
    { method: 'DELETE', headers: { 'Authorzation': 'Bearer ' + env.cf_token} }).ok;
}