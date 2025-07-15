import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Base URL for the API
const API_BASE_URL = "http://localhost:3000";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  console.log(`Making ${method} request to ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log("Raw response status:", res.status);
  console.log("Raw response text:", await res.clone().text());

  await throwIfResNotOk(res);
  return res;
}

export async function apiRequestAuthorization(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  console.log(`Making ${method} request to ${fullUrl}`);

  // Get the token from localStorage (or wherever it's stored securely)
  const token = localStorage.getItem("accessToken");

  // Set headers, including Authorization header if token is available
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // If token exists, add Authorization header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Prepare the request options
  const res = await fetch(fullUrl, {
    method,
    headers: headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Include credentials (like cookies)
  });

  console.log("Raw response status:", res.status);
  console.log("Raw response text:", await res.clone().text());

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey[0] as string;
    const fullUrl = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    console.log(`Making GET request to ${fullUrl}`);
    
    const token = localStorage.getItem("accessToken");
    const res = await fetch(fullUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
