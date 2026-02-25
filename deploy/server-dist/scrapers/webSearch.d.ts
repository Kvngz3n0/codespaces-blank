interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    domain?: string;
    date?: string;
}
interface SearchResponse {
    query: string;
    results: SearchResult[];
    totalResults?: number;
    searchTime?: number;
}
export declare function performWebSearch(query: string, language?: string, maxResults?: number): Promise<SearchResponse>;
export {};
//# sourceMappingURL=webSearch.d.ts.map