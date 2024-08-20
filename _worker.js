addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

function isValidDomain(domain) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle root path request
  if (url.pathname === '/') {
    return getHomepage(url.origin)
  }
  
  if(!/.*\.ico$/.test(url.pathname)) return new Response('Missing domain', { status: 400 });
  const domain = url.pathname.slice(1).replace(/\.ico$/, '')

  if (!isValidDomain(domain)) {
    return new Response('Invalid domain format', { status: 404 })
  }

  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=50`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ]
  const modifiedRequestInit = {
    method: request.method,
    headers: request.headers,
    redirect: 'follow'
  };

  let response = new Response();
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]
    try {
      response = await fetch(source, modifiedRequestInit)
       
      if (response.status == 200) {
        break;
      } 

    } catch (error) {
      console.error(`Error fetching from ${source}: ${error}`)
    }
  }

   if (response.status !== 200) {
    const firstLetter = domain.charAt(0).toUpperCase();
    const svgContent = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#cccccc"/>
        <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="middle" fill="#000000">${firstLetter}</text>
      </svg>
    `;
    return new Response(svgContent, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'Content-Type': 'image/svg+xml'
      }
    });
  } else {
    // Return the fetched favicon
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/x-icon',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
}

function getHomepage(origin) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Favicons Proxy - Easy Favicon Integration for Any Website</title>
    <meta name="description" content="Favicons Proxy: A simple and efficient way to add favicons to your website. Supports multiple sources including Google, DuckDuckGo, and Icon Horse.">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Favicons Proxy</h1>
    <p>Welcome to the Favicons Proxy service. This tool allows you to easily add favicons to your website by proxying requests through multiple sources.</p>
    
    <h2>Demo</h2>
    <p>Here are some example favicons:</p>
    <p>
        <img src="${origin}/google.com.ico" alt="Google Favicon"> Google<br>
        <img src="${origin}/github.com.ico" alt="GitHub Favicon"> GitHub<br>
        <img src="${origin}/stackoverflow.com.ico" alt="Stack Overflow Favicon"> Stack Overflow
    </p>
    
    <h2>How to Use</h2>
    <p>To use the Favicons Proxy in your HTML, simply use the following format in your <code>&lt;link&gt;</code> tag:</p>
    <pre><code>&lt;link rel="icon" href="${origin}/example.com.ico" type="image/x-icon"&gt;</code></pre>
    <p>Replace <code>example.com</code> with the domain you want to fetch the favicon for.</p>
    
    <h2>Features</h2>
    <ul>
        <li>Fetches favicons from multiple sources (Google, DuckDuckGo, Icon Horse)</li>
        <li>Handles failed requests gracefully</li>
        <li>Caches successful responses for improved performance</li>
        <li>Simple to use with a clean URL structure</li>
    </ul>
    
    <h2>API Usage</h2>
    <p>You can also use this service as an API. Simply make a GET request to:</p>
    <pre><code>${origin}/example.com.ico</code></pre>
    <p>This will return the favicon for example.com.</p>
    
    <footer>
        <p>Created by Sead Feng | <a href="https://github.com/seadfeng/favicons-proxy">GitHub Repository</a></p>
    </footer>
</body>
</html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}