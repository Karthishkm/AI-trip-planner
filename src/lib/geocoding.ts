import { OpenStreetMapProvider } from 'leaflet-geosearch';

const provider = new OpenStreetMapProvider();

// Cache successful geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, { lat: number; lng: number }>();

export async function geocode(address: string): Promise<{ lat: number; lng: number }> {
  try {
    // Check cache first
    const cachedResult = geocodeCache.get(address);
    if (cachedResult) {
      return cachedResult;
    }

    // Clean and normalize the address
    const cleanAddress = address
      .replace(/[^\w\s,.-]/g, '') // Remove special characters except common address ones
      .trim();

    if (!cleanAddress) {
      console.warn('Empty or invalid address provided for geocoding');
      return { lat: 0, lng: 0 };
    }

    // Attempt geocoding with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const results = await provider.search({ query: cleanAddress });
        
        if (results && results.length > 0) {
          const result = {
            lat: results[0].y,
            lng: results[0].x
          };
          
          // Cache the successful result
          geocodeCache.set(address, result);
          
          return result;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.warn(`Geocoding attempt ${attempts + 1} failed:`, error);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If all attempts fail, try with a more general search
    const generalAddress = cleanAddress.split(',')[0].trim();
    if (generalAddress !== cleanAddress) {
      const results = await provider.search({ query: generalAddress });
      if (results && results.length > 0) {
        const result = {
          lat: results[0].y,
          lng: results[0].x
        };
        geocodeCache.set(address, result);
        return result;
      }
    }

    // If still no results, return default coordinates
    console.warn(`No geocoding results found for address: ${address}`);
    return { lat: 0, lng: 0 };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: 0, lng: 0 };
  }
}