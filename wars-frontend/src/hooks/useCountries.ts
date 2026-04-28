import { useState, useEffect, useCallback } from "react";

export interface CountryData {
  id: string;
  code: string;
  cca2: string;
  name: string;
  flag: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd,cca2");
      const data = await response.json();
      const formatted = data.map((c: any) => ({
        id: c.cca2,
        cca2: c.cca2,
        name: c.name.common,
        code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ""),
        flag: `https://flagcdn.com/w40/${c.cca2.toLowerCase()}.png`
      })).filter((c: any) => c.code).sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCountries(formatted);
    } catch (err) {
      console.error("Failed to fetch countries", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  return { countries, loading };
}
