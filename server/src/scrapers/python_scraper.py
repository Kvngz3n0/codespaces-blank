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


# Media extensions (from Duke2.py)
MEDIA_EXTENSIONS = {
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    'videos': ['.mp4', '.webm', '.avi', '.mov'],
    'audio': ['.mp3', '.ogg', '.wav', '.flac', '.m4a'],
    'documents': ['.pdf', '.epub', '.docx', '.txt', '.doc', '.xls', '.xlsx'],
    'archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'ebooks': ['.mobi', '.azw3', '.azw']
}

def is_media_file(url, extensions):
    """Check if URL ends with media extension"""
    return any(url.lower().endswith(ext) for ext in extensions)

def extract_media_links(soup, base_url, media_type):
    """Extract media links by type (images, videos, audio, documents, archives, ebooks)"""
    links = set()
    if media_type == 'images':
        tags = soup.find_all(['img', 'source', 'meta'])
        for tag in tags:
            for attr in ['src', 'data-src', 'content']:
                src = tag.get(attr)
                if src:
                    full_url = urljoin(base_url, src)
                    links.add(full_url)
    elif media_type in ['videos', 'audio']:
        tags = soup.find_all([media_type, 'source'])
        for tag in tags:
            src = tag.get('src')
            if src:
                full_url = urljoin(base_url, src)
                links.add(full_url)
    else:  # documents, archives, ebooks
        for tag in soup.find_all('a', href=True):
            href = tag.get('href')
            if is_media_file(href, MEDIA_EXTENSIONS[media_type]):
                full_url = urljoin(base_url, href)
                links.add(full_url)
    return list(links)

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

    paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if p.get_text(strip=True)][:10]

    # Extract media by type
    media_by_type = {}
    for mtype in MEDIA_EXTENSIONS.keys():
        media_by_type[mtype] = extract_media_links(soup, url, mtype)

    return {
        'url': url,
        'title': title,
        'description': description,
        'headings': headings,
        'links': links,
        'paragraphs': paragraphs,
        'media': media_by_type,
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
    ignore_robots = str(args.get('ignoreRobots', 'false')).lower() in ('1', 'true', 'yes')
    if not start:
        return {'error': 'url required'}

    parsed = urlparse(start)
    base = f"{parsed.scheme}://{parsed.netloc}"

    # check robots unless ignoreRobots is set
    rp = urllib.robotparser.RobotFileParser() if not ignore_robots else None
    try:
        if rp:
            rp.set_url(urljoin(base, '/robots.txt'))
            rp.read()
    except Exception:
        pass

    visited = set()
    queue = [(start, 0)]
    results = []
    all_media = {mtype: set() for mtype in MEDIA_EXTENSIONS.keys()}

    headers = {'User-Agent': 'python-requests/2.x'}

    while queue and len(visited) < max_pages:
        url, depth = queue.pop(0)
        if url in visited or depth > max_depth:
            continue
        # Respect robots unless ignoreRobots is set
        if rp:
            try:
                allow = rp.can_fetch(headers['User-Agent'], url) if hasattr(rp, 'can_fetch') else True
                if not allow:
                    visited.add(url)
                    continue
            except Exception:
                pass

        try:
            r = fetch_url(url, headers=headers)
            page = parse_page(url, r.text)
            # Collect media from this page
            for mtype, links in page.get('media', {}).items():
                all_media[mtype].update(links)
            results.append(page)
            visited.add(url)
            soup = BeautifulSoup(r.text, 'html.parser')
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith('#'):
                    continue
                next_url = urljoin(url, href)
                parsed_next = urlparse(next_url)
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
        'media': {mtype: list(links)[:100] for mtype, links in all_media.items()},
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
