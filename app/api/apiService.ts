import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";


export interface ApiResponse<T> {
  data: T;
  headers: Headers;
}

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }

  private getHeaders(): HeadersInit {
    let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    if (token) {
      token = token.replace(/"/g, '');
    }

    return {
      ...this.defaultHeaders,
      ...(token ? { "Authorization": token } : {}),
    };
  }

  private async processResponse<T>(
    res: Response,
    errorMessage: string,
  ): Promise<ApiResponse<T>> {
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorInfo = await res.json();
        if (errorInfo?.message) {
          errorDetail = errorInfo.message;
        } else {
          errorDetail = JSON.stringify(errorInfo);
        }
      } catch {
        // If parsing fails, keep using res.statusText
      }
      const detailedMessage = `${errorMessage} (${res.status}: ${errorDetail})`;
      const error: ApplicationError = new Error(
        detailedMessage,
      ) as ApplicationError;
      error.info = JSON.stringify(
        { status: res.status, statusText: res.statusText },
        null,
        2,
      );
      error.status = res.status;
      throw error;
    }

    const data = res.headers.get("Content-Type")?.includes("application/json")
      ? await res.json()
      : ({} as T);

    return { data, headers: res.headers };
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> { 
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(), 
    });
    return this.processResponse<T>(
      res,
      "An error occurred while fetching the data.\n",
    );
  }

  public async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> { 
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(), 
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(
      res,
      "An error occurred while posting the data.\n",
    );
  }

  public async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> { 
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(), 
      body: JSON.stringify(data),
    });
    return this.processResponse<T>(
      res,
      "An error occurred while updating the data.\n",
    );
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> { 
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(), 
    });
    return this.processResponse<T>(
      res,
      "An error occurred while deleting the data.\n",
    );
  }
}