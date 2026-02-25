export interface ScrapedElement {
    tag: string;
    text: string;
    href?: string;
    attributes: Record<string, string>;
}
export interface MediaExtraction {
    images: string[];
    videos: string[];
    audio: string[];
    documents: string[];
    archives: string[];
    ebooks: string[];
}
export interface BasicScrapResult {
    url: string;
    title: string;
    description?: string;
    headings: string[];
    links: {
        text: string;
        href: string;
    }[];
    images: string[];
    paragraphs: string[];
    elements: ScrapedElement[];
    media?: MediaExtraction;
    timestamp: Date;
}
export declare function scrapeBasic(url: string): Promise<BasicScrapResult>;
export declare function scrapeWithPython(url: string): Promise<BasicScrapResult>;
//# sourceMappingURL=basicScraper.d.ts.map