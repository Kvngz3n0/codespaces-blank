#!/usr/bin/env python3
import os
import sys
import json
import time
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import urllib.robotparser
import urllib3

# Control SSL verification via environment variable.
# By default verification is enabled (production-safe). To disable
# verification for local/dev containers set PYTHON_SCRAPER_INSECURE=1 or true.
INSECURE = str(os.getenv('PYTHON_SCRAPER_INSECURE', 'false')).lower() in ('1', 'true', 'yes')
if INSECURE:
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def fetch_url(url, headers=None, timeout=12):
    headers = headers or {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
    r = requests.get(url, headers=headers, timeout=timeout, verify=not INSECURE)
    r.raise_for_status()
    return r


def parse_page(url, html):
    soup = BeautifulSoup(html, 'html.parser')
    title = soup.title.string.strip() if soup.title and soup.title.string else ''
    desc_tag = soup.find('meta', attrs={'name': 'description'})
    description = desc_tag['content'].strip() if desc_tag and desc_tag.get('content') else ''

    headings = [h.get_text(strip=True) for h in soup.find_all(['h1','h2','h3'])][:20]

    links = []
    for a in soup.find_all('a', href=True):
        href = a['href']
        links.append({'text': a.get_text(strip=True)[:100], 'href': href})

    images = [img.get('src') or '' for img in soup.find_all('img')][:30]
    paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if p.get_text(strip=True)][:10]

    return {
        'url': url,
        'title': title,
        'description': description,
        'headings': headings,
        'links': links,
        'images': images,
        'paragraphs': paragraphs,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }


def mode_scrape(args):
    url = args.get('url')
    if not url:
        return {'error': 'url required'}
    try:
        r = fetch_url(url)
        return parse_page(url, r.text)
    except Exception as e:
        return {'error': str(e)}


def mode_crawl(args):
    start = args.get('url')
    max_depth = int(args.get('maxDepth', 2))
    max_pages = int(args.get('maxPages', 50))
    if not start:
        return {'error': 'url required'}

    parsed = urlparse(start)
    base = f"{parsed.scheme}://{parsed.netloc}"

    # check robots
    rp = urllib.robotparser.RobotFileParser()
    try:
        rp.set_url(urljoin(base, '/robots.txt'))
        rp.read()
    except Exception:
        # If robots can't be read, proceed but don't aggressively crawl
        pass

    visited = set()
    queue = [(start, 0)]
    results = []

    headers = {'User-Agent': 'python-requests/2.x'}

    while queue and len(visited) < max_pages:
        url, depth = queue.pop(0)
        if url in visited or depth > max_depth:
            continue
        # Respect robots
        try:
            allow = True
            if hasattr(rp, 'can_fetch'):
                allow = rp.can_fetch(headers['User-Agent'], url)
            if not allow:
                visited.add(url)
                continue
        except Exception:
            pass

        try:
            r = fetch_url(url, headers=headers)
            page = parse_page(url, r.text)
            results.append(page)
            visited.add(url)
            soup = BeautifulSoup(r.text, 'html.parser')
            for a in soup.find_all('a', href=True):
                href = a['href']
                # normalize
                if href.startswith('#'):
                    continue
                next_url = urljoin(url, href)
                parsed_next = urlparse(next_url)
                # same host only
                if parsed_next.netloc != parsed.netloc:
                    continue
                if next_url not in visited:
                    queue.append((next_url, depth + 1))
                if len(visited) + len(queue) >= max_pages:
                    break
        except Exception:
            visited.add(url)
            continue

    return {
        'start': start,
        'pagesCrawled': len(results),
        'results': results,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }


def main():
    try:
        payload = {}
        # Try reading JSON from stdin; if empty, fall back to command-line args
        raw = ''
        try:
            raw = sys.stdin.read()
        except Exception:
            raw = ''

        if raw and raw.strip():
            try:
                payload = json.loads(raw)
            except Exception:
                payload = {}
        else:
            # fallback to args
            for arg in sys.argv[1:]:
                if '=' in arg:
                    k, v = arg.split('=', 1)
                    payload[k] = v

        mode = payload.get('mode', 'scrape')
        if mode == 'scrape':
            out = mode_scrape(payload)
        elif mode == 'crawl':
            out = mode_crawl(payload)
        else:
            out = {'error': 'unknown mode'}

        print(json.dumps(out))
    except Exception as e:
        print(json.dumps({'error': str(e)}))


if __name__ == '__main__':
    main()
