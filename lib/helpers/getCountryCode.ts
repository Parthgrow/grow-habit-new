import { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { CountryCode } from "dodopayments/resources/misc.mjs";

/**
 * Gets the country code from the request's geolocation.
 * Falls back to "US" if no country is detected.
 *
 * @param request - The Next.js request object
 * @returns The country code as a CountryCode type
 */
export function getCountryCode(request: NextRequest): CountryCode {
    const { country } = geolocation(request);
    return (country as CountryCode) || "US";
}
