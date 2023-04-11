type headers = HeadersInit | undefined;

export const get = async (
  path: string,
  headers: headers,
): Promise<Response> => {
  return await fetch(`http://localhost:3000/${path}`, {
    headers: { "content-type": "application/json", ...headers },
    method: "GET",
  });
};
export const post = async <T>(
  path: string,
  data: T,
  headers: headers,
): Promise<Response> => {
  return await fetch(`http://localhost:3000/${path}`, {
    headers: { "content-type": "application/json", ...headers },
    body: typeof data === "string" ? data : JSON.stringify(data),
    method: "POST",
  });
};
