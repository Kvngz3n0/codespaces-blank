export interface JSScrapResult {
    url: string;
    title: string;
    content: string;
    html: string;
    screenshot?: string;
    timestamp: Date;
}
export declare function scrapeWithJS(url: string, takeScreenshot?: boolean): Promise<JSScrapResult>;
export declare function closeBrowser(): Promise<void>;
//# sourceMappingURL=jsScraper.d.ts.map