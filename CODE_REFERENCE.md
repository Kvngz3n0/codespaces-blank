# Key Implementation Code Snippets

## 1. Media Extraction in Python Scraper

```python
# Media extensions by type (from Duke2.py pattern)
MEDIA_EXTENSIONS = {
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    'videos': ['.mp4', '.webm', '.avi', '.mov'],
    'audio': ['.mp3', '.ogg', '.wav', '.flac', '.m4a'],
    'documents': ['.pdf', '.epub', '.docx', '.txt', '.doc', '.xls', '.xlsx'],
    'archives': ['.zip', '.rar', '.7z', '.tar', '.gz'],
    'ebooks': ['.mobi', '.azw3', '.azw']
}

def extract_media_links(soup, base_url, media_type):
    """Extract media links by type"""
    links = set()
    if media_type == 'images':
        # Extract from img, source, meta tags
        tags = soup.find_all(['img', 'source', 'meta'])
        for tag in tags:
            for attr in ['src', 'data-src', 'content']:
                src = tag.get(attr)
                if src:
                    full_url = urljoin(base_url, src)
                    links.add(full_url)
    elif media_type in ['videos', 'audio']:
        # Extract from video/audio source tags
        tags = soup.find_all([media_type, 'source'])
        for tag in tags:
            src = tag.get('src')
            if src:
                full_url = urljoin(base_url, src)
                links.add(full_url)
    else:  # documents, archives, ebooks
        # Extract from anchor tags by extension
        for tag in soup.find_all('a', href=True):
            href = tag.get('href')
            if is_media_file(href, MEDIA_EXTENSIONS[media_type]):
                full_url = urljoin(base_url, href)
                links.add(full_url)
    return list(links)

def parse_page(url, html):
    soup = BeautifulSoup(html, 'html.parser')
    # ... get title, description, headings, links, paragraphs ...
    
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
        'media': media_by_type,  # ← NEW: Structured media object
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    }
```

## 2. ignoreRobots Support in Crawler

```python
def mode_crawl(args):
    start = args.get('url')
    max_depth = int(args.get('maxDepth', 2))
    max_pages = int(args.get('maxPages', 50))
    ignore_robots = str(args.get('ignoreRobots', 'false')).lower() in ('1', 'true', 'yes')
    
    # ... setup ...
    
    # Only check robots if ignoreRobots is NOT set
    rp = urllib.robotparser.RobotFileParser() if not ignore_robots else None
    try:
        if rp:
            rp.set_url(urljoin(base, '/robots.txt'))
            rp.read()
    except Exception:
        pass
    
    # ... crawl logic ...
    
    while queue and len(visited) < max_pages:
        url, depth = queue.pop(0)
        
        # Respect robots unless ignoreRobots is set
        if rp:
            try:
                allow = rp.can_fetch(headers['User-Agent'], url)
                if not allow:
                    visited.add(url)
                    continue
            except Exception:
                pass
        
        # ... rest of crawl ...
```

## 3. Node Wrapper for Media Mapping

```typescript
export async function scrapeWithPython(url: string): Promise<BasicScrapResult> {
  try {
    const script = path.resolve(process.cwd(), 'src', 'scrapers', 'python_scraper.py');
    const args = ['mode=scrape', `url=${url}`];
    const res = spawnSync('python3', [script, ...args], { encoding: 'utf-8', timeout: 30000, env: process.env });
    
    const out = JSON.parse(res.stdout || '{}');
    
    // Map Python result to BasicScrapResult with media extraction
    return {
      url: out['url'] ? out['url'] : url,
      title: out['title'] || 'No title',
      description: out['description'] || '',
      headings: out['headings'] || [],
      links: (out['links'] || []).map((l: any) => ({ text: l.text || '', href: l.href || '' })),
      images: out['images'] || [],
      paragraphs: out['paragraphs'] || [],
      elements: [],
      media: out['media'] ? {  // ← NEW: Map media from Python
        images: out['media']['images'] || [],
        videos: out['media']['videos'] || [],
        audio: out['media']['audio'] || [],
        documents: out['media']['documents'] || [],
        archives: out['media']['archives'] || [],
        ebooks: out['media']['ebooks'] || []
      } : undefined,
      timestamp: new Date()
    } as BasicScrapResult;
  } catch (err) {
    throw new Error(`Python scraper error: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

## 4. Crawler ignoreRobots Parameter Passing

```typescript
export async function crawlWithPython(url: string, maxDepth: number = 2, maxPages: number = 50, ignoreRobots: boolean = false): Promise<CrawlResult> {
  try {
    const script = path.resolve(process.cwd(), 'src', 'scrapers', 'python_scraper.py');
    const args = ['mode=crawl', `url=${url}`, `maxDepth=${maxDepth}`, `maxPages=${maxPages}`, `ignoreRobots=${ignoreRobots ? 'true' : 'false'}`];
    const res = spawnSync('python3', [script, ...args], { encoding: 'utf-8', timeout: 120000, env: process.env });
    
    const out = JSON.parse(res.stdout);
    
    return {
      startUrl: out.start || url,
      pagesVisited: (out.results || []).length,
      pagesCrawled: (out.results || []).map((p: any) => ({ /* ... */ })),
      totalLinks: (out.results || []).reduce((sum: number, p: any) => sum + ((p['links'] || []).length), 0),
      media: out['media'] ? {  // ← NEW: Media from crawl
        images: out['media']['images'] || [],
        videos: out['media']['videos'] || [],
        // ... other types ...
      } : undefined,
      errors: {},
      duration: 0,
      timestamp: new Date()
    };
  } catch (err) {
    throw new Error(`Python crawler error: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

## 5. API Endpoint with ignoreRobots

```typescript
app.post('/api/crawl', async (req: Request, res: Response) => {
  try {
    const { url, maxDepth = 2, maxPages = 50, engine, fileType, engineOrder, ignoreRobots = false } = req.body;
    
    // ... validation ...
    
    const candidateEngines = engineOrder 
      ? engineOrder.split(',').map((e: string) => e.trim()).filter((e: string) => e)
      : ['python', 'html'];
    
    const handlers: Record<string, () => Promise<any>> = {
      python: async () => await crawlWithPython(url, depth, pages, ignoreRobots),  // ← Pass ignoreRobots
      html: async () => await crawlWebsite(url, depth, pages)
    };
    
    const { result, engine: usedEngine, attempts } = await tryEngines(candidateEngines, handlers);
    
    // ... return result ...
  } catch (err) {
    // ... error handling ...
  }
});
```

## 6. MediaDownloadPanel React Component

```typescript
const MediaDownloadPanel: React.FC<MediaDownloadPanelProps> = ({ media, title }) => {
  const [selected, setSelected] = useState<{ [key: string]: Set<number> }>({
    images: new Set(),
    videos: new Set(),
    // ... other types ...
  });
  
  const toggleItem = (mediaType: string, index: number) => {
    // Toggle individual item checkbox
  };
  
  const toggleAll = (mediaType: string) => {
    // Toggle all items in media type
  };
  
  const downloadSelected = () => {
    // Collect all selected URLs and open in new tabs
    const toDownload: string[] = [];
    Object.entries(selected).forEach(([mediaType, indices]) => {
      const items = (media as any)[mediaType] || [];
      indices.forEach((idx: number) => {
        if (items[idx]) toDownload.push(items[idx]);
      });
    });
    
    // Stagger opens to avoid popup blocking
    toDownload.forEach((url, idx) => {
      setTimeout(() => {
        window.open(url, '_blank');
      }, idx * 200);
    });
  };
  
  const downloadAll = () => {
    // Select all items then trigger download
  };
  
  return (
    <div className="media-panel">
      <div className="media-header">
        <h3>{title}</h3>
        <div className="media-actions">
          <button className="download-btn download-all" onClick={downloadAll}>⬇️ Download All</button>
          <button className="download-btn download-selected" onClick={downloadSelected}>⬇️ Download Selected</button>
        </div>
      </div>
      
      {/* Media sections with checkboxes and previews */}
    </div>
  );
};
```

## 7. CrawlerPanel UI Integration

```typescript
function CrawlerPanel({ /* props */ }) {
  const [ignoreRobots, setIgnoreRobots] = useState(false);
  
  const handleCrawl = async () => {
    try {
      const response = await axios.post('/api/crawl', {
        url: crawlUrl.trim(),
        maxDepth,
        maxPages,
        engine,
        fileType,
        engineOrder,
        ignoreRobots  // ← NEW: Send to API
      });
      onCrawlComplete(response.data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="crawler-panel">
      {/* ... other controls ... */}
      
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={ignoreRobots}
            onChange={(e) => setIgnoreRobots(e.target.checked)}
            disabled={loading}
          />
          Ignore robots.txt
        </label>
        <small>When enabled, crawls will bypass robots.txt restrictions</small>
      </div>
      
      {/* ... */}
    </div>
  );
}
```

## 8. TypeScript Interfaces

```typescript
// Media extraction type
interface MediaExtraction {
  images: string[];
  videos: string[];
  audio: string[];
  documents: string[];
  archives: string[];
  ebooks: string[];
}

// Updated result interfaces
interface BasicScrapResult {
  url: string;
  title: string;
  description?: string;
  headings: string[];
  links: { text: string; href: string }[];
  images: string[];
  paragraphs: string[];
  elements: ScrapedElement[];
  media?: MediaExtraction;  // ← NEW
  timestamp: Date;
}

interface CrawlResult {
  startUrl: string;
  pagesVisited: number;
  pagesCrawled: CrawlPage[];
  totalLinks: number;
  media?: MediaExtraction;  // ← NEW
  errors: Record<string, string>;
  duration: number;
  timestamp: Date;
}
```

## Key Features Summary

- ✅ **Media Extraction**: 6 types (images, videos, audio, documents, archives, ebooks)
- ✅ **Duke2.py Pattern**: Tag-based extraction mirrors Duke2.py implementation
- ✅ **ignoreRobots Opt-in**: Bypass robots.txt when needed for testing/research
- ✅ **Media Download UI**: Individual toggles + bulk download without zip
- ✅ **Type Safety**: Full TypeScript support with MediaExtraction interface
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Integration**: Seamlessly integrated into existing scraper/crawler UI
