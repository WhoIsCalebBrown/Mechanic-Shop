// NHTSA (National Highway Traffic Safety Administration) Vehicle API
const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

interface VehicleMake {
  Make_ID: number;
  Make_Name: string;
}

interface VehicleModel {
  Model_ID: number;
  Model_Name: string;
}

interface NHTSAResponse<T> {
  Count: number;
  Message: string;
  SearchCriteria: string | null;
  Results: T[];
}

let cachedMakes: string[] | null = null;
let cachedModels: Map<string, Map<number, string[]>> = new Map();

export const vehicleDataService = {
  // Get all vehicle makes
  getMakes: async (): Promise<string[]> => {
    if (cachedMakes) {
      return cachedMakes;
    }

    try {
      const response = await fetch(`${NHTSA_API_BASE}/GetAllMakes?format=json`);
      const data: NHTSAResponse<VehicleMake> = await response.json();

      cachedMakes = data.Results
        .map((m) => m.Make_Name)
        .filter((name) => name && name.length > 0)
        .sort();

      return cachedMakes;
    } catch (error) {
      console.error('Failed to fetch vehicle makes:', error);
      return [];
    }
  },

  // Get models for a specific make and year
  getModels: async (make: string, year: number): Promise<string[]> => {
    if (!cachedModels.has(make)) {
      cachedModels.set(make, new Map());
    }

    const makeCache = cachedModels.get(make)!;
    if (makeCache.has(year)) {
      return makeCache.get(year)!;
    }

    try {
      const response = await fetch(
        `${NHTSA_API_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
      );
      const data: NHTSAResponse<VehicleModel> = await response.json();

      const models = data.Results
        .map((m) => m.Model_Name)
        .filter((name) => name && name.length > 0)
        .sort();

      makeCache.set(year, models);
      return models;
    } catch (error) {
      console.error('Failed to fetch vehicle models:', error);
      return [];
    }
  },

  // Decode VIN to get vehicle information
  decodeVIN: async (vin: string): Promise<{
    make?: string;
    model?: string;
    year?: number;
  }> => {
    if (!vin || vin.length < 11) {
      return {};
    }

    try {
      const response = await fetch(
        `${NHTSA_API_BASE}/DecodeVin/${encodeURIComponent(vin)}?format=json`
      );
      const data: NHTSAResponse<any> = await response.json();

      const makeResult = data.Results.find((r: any) => r.Variable === 'Make');
      const modelResult = data.Results.find((r: any) => r.Variable === 'Model');
      const yearResult = data.Results.find((r: any) => r.Variable === 'Model Year');

      return {
        make: makeResult?.Value || undefined,
        model: modelResult?.Value || undefined,
        year: yearResult?.Value ? parseInt(yearResult.Value) : undefined,
      };
    } catch (error) {
      console.error('Failed to decode VIN:', error);
      return {};
    }
  },

  // Generate array of years (current year + 1 down to 1990)
  getYears: (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let year = currentYear + 1; year >= 1990; year--) {
      years.push(year);
    }
    return years;
  },
};
