import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

export default function useFetch(endpoint, token = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiRequest(endpoint, "GET", null, token)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}
