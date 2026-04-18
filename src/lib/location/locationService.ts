import * as Location from "expo-location";

// Map coordinates
export type Coordinates= {
    latitude: number;
    longitude: number;
}

// Generic address type
// So users can type in a address which will be converted to map coordinates.
export type AddressInput = {
    country: string;
    region?: string;
    city: string;
    postalCode: string;
    street: string;
}

// Result type for GeoLocation
export type GeocodeResult = {
    success: boolean; 
    coordinates: Coordinates | null;
    error: string | null;
}

// Helper function which converts AdrressInput into a string instead of object
// Expo Location.geocodeAsync needs a string to convert from address to coordinates. 
function buildAddressString(address : AddressInput): string {
    // Array string
    return[
    address.country,
    address.region,
    address.city,
    address.postalCode,
    address.street,
    ]
    .filter(Boolean) // Remove empty values - trims the string 
    .join(",") // Joins all values
}


export async function geocodeAddress(address: AddressInput): Promise<GeocodeResult> {
    try{
    const addressString = buildAddressString(address);
    
    // If empty string
    if (!addressString.trim()){
        return{
            success: false,
            coordinates: null,
            error: "Empty address field",
        }
    }

    // Expo Location tries to convert the address string into coordinate numbers
    const results = await Location.geocodeAsync(addressString);

    if (results.length > 1){
        console.warn("Multiple geocode locations found:", results);
    }

    if (!results.length) {
        return{
            success: false,
            coordinates: null,
            error: "No matching coordinates for that address",
        }
    }

    // Array of possible matches
    const firstMatch = results[0];

    return{
        success: true,
        coordinates: {
            latitude: Number(firstMatch.latitude.toFixed(6)),
            longitude: Number(firstMatch.longitude.toFixed(6)),
        },
        error: null,
    };
}
    catch (error){
        return{
            success: false,
            coordinates: null,
            error: error instanceof Error? error.message : "Geocode failing"
        };
    }
}
