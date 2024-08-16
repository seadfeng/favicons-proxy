addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

function isValidDomain(domain) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

async function handleRequest(request) {
  const url = new URL(request.url)
  if(!/.*\.ico$/.test(url.pathname)) return new Response('Missing domain', { status: 400 });
  const domain = url.pathname.slice(1).replace(/\.ico$/, '')

  if (!isValidDomain(domain)) {
    return new Response('Invalid domain format', { status: 404 })
  }

  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=50`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://icon.horse/icon/${domain}`
  ]
  const modifiedRequestInit = {
    method: request.method,
    headers: request.headers,
    redirect: 'follow'
  };
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    try {
      
      const response = await fetch(source, modifiedRequestInit)
      
      // For Google and DuckDuckGo, we can check for 404
      if (i < 2 && response.status === 404) {
        continue
      }
      
      // For icon.horse, we can't reliably check for 404, so we'll just use it if we reach this point
      
      // If we've reached here, we have a valid response
      return new Response(response.body, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    } catch (error) {
      console.error(`Error fetching from ${source}: ${error}`)
    }
  }

  // If we've exhausted all sources, return a 404
  return new Response('Favicon not found', { status: 404 })
}