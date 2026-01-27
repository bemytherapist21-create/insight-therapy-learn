import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/config/constants";

export interface CrisisResource {
  name: string;
  number: string;
  type: "emergency" | "crisis" | "text" | "hotline";
}

export interface CountryInfo {
  code: string;
  name: string;
  region?: string;
}

// Comprehensive crisis resources by country
const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
  US: [
    { name: "Emergency", number: "911", type: "emergency" },
    { name: "Suicide & Crisis Lifeline", number: "988", type: "crisis" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", type: "text" },
  ],
  GB: [
    { name: "Emergency", number: "999", type: "emergency" },
    { name: "Samaritans", number: "116 123", type: "crisis" },
    { name: "NHS Mental Health", number: "111", type: "hotline" },
  ],
  IN: [
    { name: "Emergency", number: "112", type: "emergency" },
    { name: "Kiran Mental Health", number: "1800-599-0019", type: "crisis" },
    { name: "Vandrevala Foundation", number: "9999 666 555", type: "hotline" },
  ],
  CA: [
    { name: "Emergency", number: "911", type: "emergency" },
    { name: "Talk Suicide Canada", number: "1-833-456-4566", type: "crisis" },
    { name: "Crisis Text Line", number: "Text HOME to 686868", type: "text" },
  ],
  AU: [
    { name: "Emergency", number: "000", type: "emergency" },
    { name: "Lifeline Australia", number: "13 11 14", type: "crisis" },
    { name: "Beyond Blue", number: "1300 22 4636", type: "hotline" },
  ],
  DE: [
    { name: "Emergency", number: "112", type: "emergency" },
    { name: "Telefonseelsorge", number: "0800 111 0 111", type: "crisis" },
    {
      name: "Kinder & Jugendtelefon",
      number: "0800 111 0 333",
      type: "hotline",
    },
  ],
  FR: [
    { name: "Emergency", number: "15", type: "emergency" },
    { name: "SOS Amitié", number: "09 72 39 40 50", type: "crisis" },
    { name: "Fil Santé Jeunes", number: "0 800 235 236", type: "hotline" },
  ],
  JP: [
    { name: "Emergency", number: "110", type: "emergency" },
    { name: "TELL Lifeline", number: "03-5774-0992", type: "crisis" },
    { name: "Inochi no Denwa", number: "0120-783-556", type: "hotline" },
  ],
  BR: [
    { name: "Emergency", number: "190", type: "emergency" },
    { name: "CVV", number: "188", type: "crisis" },
    { name: "CAPS", number: "Dial local CAPS center", type: "hotline" },
  ],
  MX: [
    { name: "Emergency", number: "911", type: "emergency" },
    { name: "SAPTEL", number: "55 5259-8121", type: "crisis" },
    { name: "Línea de la Vida", number: "800 911 2000", type: "hotline" },
  ],
  ZA: [
    { name: "Emergency", number: "10111", type: "emergency" },
    { name: "SADAG", number: "0800 567 567", type: "crisis" },
    { name: "Lifeline SA", number: "0861 322 322", type: "hotline" },
  ],
  PH: [
    { name: "Emergency", number: "911", type: "emergency" },
    { name: "NCMH Crisis Hotline", number: "0917-899-8727", type: "crisis" },
    { name: "Hopeline", number: "0917-558-4673", type: "hotline" },
  ],
  SG: [
    { name: "Emergency", number: "999", type: "emergency" },
    { name: "SOS Singapore", number: "1800-221-4444", type: "crisis" },
    { name: "IMH Crisis Hotline", number: "6389 2222", type: "hotline" },
  ],
  NZ: [
    { name: "Emergency", number: "111", type: "emergency" },
    { name: "Lifeline NZ", number: "0800 543 354", type: "crisis" },
    { name: "1737", number: "1737", type: "text" },
  ],
  IE: [
    { name: "Emergency", number: "999", type: "emergency" },
    { name: "Samaritans Ireland", number: "116 123", type: "crisis" },
    { name: "Pieta House", number: "1800 247 247", type: "hotline" },
  ],
};

// Default fallback resources (International)
const DEFAULT_RESOURCES: CrisisResource[] = [
  { name: "International Emergency", number: "112", type: "emergency" },
  { name: "Find Local Help", number: "findahelpline.com", type: "crisis" },
  { name: "Befrienders Worldwide", number: "befrienders.org", type: "hotline" },
];

export const useCountryDetection = () => {
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [resources, setResources] = useState<CrisisResource[]>(
    CRISIS_RESOURCES["US"],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Check localStorage first for cached value
        const cached = localStorage.getItem("detected_country");
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const cacheAge = Date.now() - (parsedCache.timestamp || 0);
          // Use cache if less than 24 hours old
          if (cacheAge < 24 * 60 * 60 * 1000) {
            setCountry(parsedCache.country);
            setResources(
              CRISIS_RESOURCES[parsedCache.country.code] || DEFAULT_RESOURCES,
            );
            setLoading(false);
            return;
          }
        }

        const response = await fetch(API_ENDPOINTS.IPAPI);
        if (!response.ok) throw new Error("Failed to detect location");

        const data = await response.json();
        const countryInfo: CountryInfo = {
          code: data.country_code || "US",
          name: data.country_name || "United States",
          region: data.region || undefined,
        };

        setCountry(countryInfo);
        setResources(CRISIS_RESOURCES[countryInfo.code] || DEFAULT_RESOURCES);

        // Cache the result
        localStorage.setItem(
          "detected_country",
          JSON.stringify({
            country: countryInfo,
            timestamp: Date.now(),
          }),
        );
      } catch (err) {
        console.warn("Country detection failed, using US defaults:", err);
        setError("Could not detect location");
        // Default to US
        setCountry({ code: "US", name: "United States" });
        setResources(CRISIS_RESOURCES["US"]);
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  // Get resources for a specific country code
  const getResourcesForCountry = (code: string): CrisisResource[] => {
    return CRISIS_RESOURCES[code] || DEFAULT_RESOURCES;
  };

  // Format resources as a single-line string for display
  const getResourcesString = (): string => {
    if (resources.length === 0) return "";

    return resources.map((r) => `${r.name}: ${r.number}`).join(" | ");
  };

  // Get primary crisis number (for buttons)
  const getPrimaryCrisisNumber = (): string => {
    const crisisLine = resources.find((r) => r.type === "crisis");
    return crisisLine?.number.replace(/\D/g, "") || "988";
  };

  // Get emergency number
  const getEmergencyNumber = (): string => {
    const emergency = resources.find((r) => r.type === "emergency");
    return emergency?.number || "911";
  };

  return {
    country,
    resources,
    loading,
    error,
    getResourcesForCountry,
    getResourcesString,
    getPrimaryCrisisNumber,
    getEmergencyNumber,
    CRISIS_RESOURCES,
    DEFAULT_RESOURCES,
  };
};
