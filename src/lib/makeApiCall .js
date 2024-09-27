export const makeApiCall = async (
  url,
  method,
  body = null,
  additionalHeaders = {}
) => {
  const options = {
    method,
    mode: "cors",
    headers: {
      "x-api-key": "Icui4cu@",
      ...additionalHeaders,
    },
  };

  if (body && !(body instanceof FormData)) {
    options.body = JSON.stringify(body);
    options.headers["Content-Type"] = "application/json";
  } else if (body instanceof FormData) {
    options.body = body;
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail);
    }

    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};
