/**
 * Interface for an HTTP client that provides methods for making HTTP requests.
 */

export interface HttpClient {
    get<T>(path: string, token?: string): Promise<T>;
    post<T>(path: string, body: any, token?: string): Promise<T>;
    put<T>(path: string, body: any, token?: string): Promise<T>;
    delete<T>(path: string, token?: string): Promise<T>;
}