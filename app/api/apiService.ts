import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

//Generic interface that wraps any API response into a consistent shape
//<T> is a placeholder for whatever data type the response contains
export interface ApiResponse<T> {
  data: T; //response body
  headers: Headers; //response header
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
    //Safely read the token from localStorage (browser storage)
    //"typeof window !== undefined" checks if we're in a browser environment
    //localStorage doesn't exist on a server
    let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    //If a token exists, strip any accidental double-quote characters
    //'"abc123"' → 'abc123'
    //can happen if the token was stored with JSON.stringify() wrapping it
    if (token) {
      token = token.replace(/"/g, '');
    }
    //build and retrun the final header object
    return {
      ...this.defaultHeaders, //spread in default headers
      ...(token ? { "Authorization": token } : {}), // if token exists -> add Authorization header else adds nothing
      // ... Spread-Operator: unpacks the header and adds the tocken to it in a new object 
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
      headers: this.getHeaders(), //using my own function no defaultHeader
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
      headers: this.getHeaders(), //using my own function no defaultHeader
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
      headers: this.getHeaders(), //using my own function no defaultHeader
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
      headers: this.getHeaders(), //using my own function no defaultHeader
    });
    return this.processResponse<T>(
      res,
      "An error occurred while deleting the data.\n",
    );
  }
}