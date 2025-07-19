
// Forest Biomass Data based on IPCC Guidelines
// Sources: IPCC 2006 Guidelines and 2019 Refinement

export interface ForestBiomassData {
  forestType: string;
  biomassPerHectare: number; // tons per hectare (above-ground)
  source: string;
  year: number;
}

// IPCC-based forest biomass lookup table
const FOREST_BIOMASS_DATA: ForestBiomassData[] = [
  {
    forestType: 'Tropical Rainforest',
    biomassPerHectare: 280,
    source: 'IPCC 2006 Guidelines',
    year: 2006
  },
  {
    forestType: 'Tropical Moist Forest',
    biomassPerHectare: 200,
    source: 'IPCC 2006 Guidelines',
    year: 2006
  },
  {
    forestType: 'Tropical Dry Forest',
    biomassPerHectare: 95,
    source: 'IPCC 2006 Guidelines',
    year: 2006
  },
  {
    forestType: 'Temperate Oceanic Forest',
    biomassPerHectare: 130,
    source: 'IPCC 2006 Guidelines',
    year: 2006
  },
  {
    forestType: 'Temperate Continental Forest',
    biomassPerHectare: 120,
    source: 'IPCC 2006 Guidelines',
    year: 2006
  },
  {
    forestType: 'Boreal Forest',
    biomassPerHectare: 60,
    source: 'IPCC 2006 Guidelines',
    year: 2006
  },
  {
    forestType: 'Young Secondary Tropical Moist Forest',
    biomassPerHectare: 47.1,
    source: 'IPCC 2019 Refinement',
    year: 2019
  },
  {
    forestType: 'Old Secondary Tropical Moist Forest',
    biomassPerHectare: 68.8,
    source: 'IPCC 2019 Refinement',
    year: 2019
  }
];

// Legacy forest types mapping for backward compatibility
const LEGACY_FOREST_TYPE_MAPPING: Record<string, string> = {
  'Tropical Evergreen': 'Tropical Rainforest',
  'Tropical Deciduous': 'Tropical Dry Forest',
  'Dry Deciduous': 'Tropical Dry Forest',
  'Temperate Broadleaf': 'Temperate Oceanic Forest',
  'Temperate Coniferous': 'Temperate Continental Forest',
  'Mangrove': 'Tropical Moist Forest',
  'Mixed Forest': 'Temperate Oceanic Forest'
};

/**
 * Get biomass per hectare for a given forest type
 * @param forestType - The forest type string
 * @returns Biomass value in tons per hectare
 */
export const getBiomassPerHectare = (forestType: string): number => {
  if (!forestType) return 150; // Default mixed forest average
  
  // Normalize the input
  const normalizedInput = forestType.trim();
  
  // Try exact match first
  const exactMatch = FOREST_BIOMASS_DATA.find(
    data => data.forestType.toLowerCase() === normalizedInput.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch.biomassPerHectare;
  }
  
  // Try legacy mapping
  const legacyMatch = LEGACY_FOREST_TYPE_MAPPING[normalizedInput];
  if (legacyMatch) {
    return getBiomassPerHectare(legacyMatch);
  }
  
  // Try partial matching for flexibility
  const partialMatch = FOREST_BIOMASS_DATA.find(
    data => data.forestType.toLowerCase().includes(normalizedInput.toLowerCase()) ||
           normalizedInput.toLowerCase().includes(data.forestType.toLowerCase())
  );
  
  if (partialMatch) {
    return partialMatch.biomassPerHectare;
  }
  
  // Default to mixed forest average if no match found
  return 150;
};

/**
 * Get forest biomass data for a given forest type
 * @param forestType - The forest type string
 * @returns Complete forest biomass data or null if not found
 */
export const getForestBiomassData = (forestType: string): ForestBiomassData | null => {
  if (!forestType) return null;
  
  const normalizedInput = forestType.trim();
  
  // Try exact match
  const exactMatch = FOREST_BIOMASS_DATA.find(
    data => data.forestType.toLowerCase() === normalizedInput.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch;
  }
  
  // Try legacy mapping
  const legacyMatch = LEGACY_FOREST_TYPE_MAPPING[normalizedInput];
  if (legacyMatch) {
    return getForestBiomassData(legacyMatch);
  }
  
  // Try partial matching
  const partialMatch = FOREST_BIOMASS_DATA.find(
    data => data.forestType.toLowerCase().includes(normalizedInput.toLowerCase()) ||
           normalizedInput.toLowerCase().includes(data.forestType.toLowerCase())
  );
  
  return partialMatch || null;
};

/**
 * Get all available forest types for dropdown selections
 * @returns Array of forest type strings
 */
export const getForestTypes = (): string[] => {
  return FOREST_BIOMASS_DATA.map(data => data.forestType);
};

/**
 * Calculate carbon credits using forest-specific biomass
 * @param area - Project area in hectares
 * @param forestType - Forest type
 * @param forestCoverage - Forest coverage percentage (0-100)
 * @param bufferPercentage - Uncertainty buffer percentage (0-100)
 * @returns Carbon credits in tCO₂e
 */
export const calculateCarbonCredits = (
  area: number,
  forestType: string,
  forestCoverage: number = 85,
  bufferPercentage: number = 20
): number => {
  const biomassPerHa = getBiomassPerHectare(forestType);
  const carbonFraction = 0.47; // Carbon fraction of biomass
  const co2ConversionFactor = 3.67; // CO2 to C conversion factor
  
  const carbonCredits = area * 
                       (forestCoverage / 100) * 
                       biomassPerHa * 
                       carbonFraction * 
                       co2ConversionFactor * 
                       (1 - bufferPercentage / 100);
  
  return Math.round(carbonCredits * 100) / 100; // Round to 2 decimal places
};

/**
 * Get calculation breakdown for transparency
 * @param area - Project area in hectares
 * @param forestType - Forest type
 * @param forestCoverage - Forest coverage percentage
 * @param bufferPercentage - Uncertainty buffer percentage
 * @returns Detailed calculation breakdown
 */
export const getCalculationBreakdown = (
  area: number,
  forestType: string,
  forestCoverage: number = 85,
  bufferPercentage: number = 20
) => {
  const biomassPerHa = getBiomassPerHectare(forestType);
  const biomassData = getForestBiomassData(forestType);
  const carbonCredits = calculateCarbonCredits(area, forestType, forestCoverage, bufferPercentage);
  
  return {
    area,
    forestType,
    biomassPerHa,
    forestCoverage,
    bufferPercentage,
    carbonCredits,
    formula: 'Area × Forest% × Biomass/ha × 0.47 × 3.67 × (1 - Buffer%)',
    source: biomassData?.source || 'Default mixed forest average',
    year: biomassData?.year || null
  };
};
