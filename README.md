# Favicons Proxy

Favicons Proxy is a Cloudflare Worker that serves as a middleman for fetching website favicons. It attempts to retrieve favicons from multiple sources in a specified order, ensuring that you get the best available icon for any given domain.

## Features

- Fetches favicons from multiple sources:
  1. Google Favicons
  2. DuckDuckGo Icons
  3. Icon Horse
- Handles failed requests gracefully by trying the next source
- Validates domain format before making requests
- Caches successful responses for improved performance
- Simple to use with a clean URL structure

## Usage

To use the Favicons Proxy, simply make a GET request to the worker URL with the desired domain:

```
https://favicons.seadfeng.workers.dev/example.com.ico
```

Replace `example.com` with the domain you want to fetch the favicon for.

## How It Works

1. The worker receives a request for a domain's favicon.
2. It validates the domain format to ensure it's potentially valid.
3. If the domain is valid, it attempts to fetch the favicon from the following sources in order:
   - `https://www.google.com/s2/favicons?domain=${domain}&sz=50`
   - `https://icons.duckduckgo.com/ip3/${domain}.ico`
   - `https://icon.horse/icon/${domain}`
4. If a favicon is successfully retrieved from any source, it is returned to the user.
5. If all sources fail, a 404 error is returned.

## Deployment

To deploy this worker:

1. Log in to your Cloudflare dashboard.
2. Navigate to the Workers section.
3. Create a new Worker.
4. Copy the provided Worker script into the editor.
5. Save and deploy the Worker.
6. (Optional) Set up a custom subdomain for your Worker, e.g., `favicons.yourdomain.workers.dev`.

## Configuration

The Worker doesn't require any additional configuration. However, you can modify the `sources` array in the script if you want to add, remove, or reorder the favicon sources.

## Limitations

- The proxy doesn't verify if the returned image is actually a favicon; it trusts the source.
- It always returns the Content-Type as `image/x-icon`, which may not be accurate for all responses.
- There's no built-in rate limiting, so consider implementing this if you expect high traffic.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Created by Sead Feng