interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RestrictedZone {
  id: string;
  name: string;
  type: 'school' | 'temple' | 'government' | 'hospital' | 'dry_zone';
  coordinates: Coordinates;
  radius: number; // in meters
  description: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  coordinates: Coordinates[];
  isActive: boolean;
  restrictions: string[];
}

// Mock data for restricted zones in Sikkim (would be fetched from API in production)
const RESTRICTED_ZONES: RestrictedZone[] = [
  {
    id: 'school_01',
    name: 'Tashi Namgyal Academy',
    type: 'school',
    coordinates: { latitude: 27.3314, longitude: 88.6138 },
    radius: 500,
    description: 'Educational institution - 500m exclusion zone'
  },
  {
    id: 'temple_01',
    name: 'Enchey Monastery',
    type: 'temple',
    coordinates: { latitude: 27.3389, longitude: 88.6065 },
    radius: 500,
    description: 'Religious site - 500m exclusion zone'
  },
  {
    id: 'govt_01',
    name: 'Sikkim Secretariat',
    type: 'government',
    coordinates: { latitude: 27.3314, longitude: 88.6138 },
    radius: 300,
    description: 'Government building - 300m exclusion zone'
  }
];

// Mock delivery zones (would be fetched from API in production)
const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'gangtok_central',
    name: 'Gangtok Central',
    coordinates: [
      { latitude: 27.3314, longitude: 88.6138 },
      { latitude: 27.3389, longitude: 88.6065 },
      { latitude: 27.3256, longitude: 88.6211 },
      { latitude: 27.3181, longitude: 88.6284 }
    ],
    isActive: true,
    restrictions: ['no_delivery_after_22:00', 'kyc_required']
  },
  {
    id: 'gangtok_east',
    name: 'Gangtok East',
    coordinates: [
      { latitude: 27.3389, longitude: 88.6065 },
      { latitude: 27.3456, longitude: 88.6132 },
      { latitude: 27.3398, longitude: 88.6199 },
      { latitude: 27.3331, longitude: 88.6266 }
    ],
    isActive: true,
    restrictions: ['no_delivery_after_21:00', 'kyc_required', 'police_verification_required']
  }
];

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Check if coordinates are within a restricted zone
 */
export function checkRestrictedZones(coordinates: Coordinates): {
  isRestricted: boolean;
  violations: RestrictedZone[];
  nearestViolation?: { zone: RestrictedZone; distance: number };
} {
  const violations: RestrictedZone[] = [];
  let nearestViolation: { zone: RestrictedZone; distance: number } | undefined;

  for (const zone of RESTRICTED_ZONES) {
    const distance = calculateDistance(coordinates, zone.coordinates);
    
    if (distance <= zone.radius) {
      violations.push(zone);
    }

    // Track nearest violation for informational purposes
    if (!nearestViolation || distance < nearestViolation.distance) {
      nearestViolation = { zone, distance };
    }
  }

  return {
    isRestricted: violations.length > 0,
    violations,
    nearestViolation: violations.length === 0 ? nearestViolation : undefined
  };
}

/**
 * Check if coordinates are within a valid delivery zone
 */
export function checkDeliveryZone(coordinates: Coordinates): {
  isValidZone: boolean;
  zone?: DeliveryZone;
  restrictions: string[];
} {
  for (const zone of DELIVERY_ZONES) {
    if (!zone.isActive) continue;

    if (isPointInPolygon(coordinates, zone.coordinates)) {
      return {
        isValidZone: true,
        zone,
        restrictions: zone.restrictions
      };
    }
  }

  return {
    isValidZone: false,
    restrictions: []
  };
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
  const x = point.latitude;
  const y = point.longitude;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Comprehensive geofencing validation
 */
export async function validateLocation(coordinates: Coordinates): Promise<{
  isValid: boolean;
  canDeliver: boolean;
  restrictions: string[];
  violations: RestrictedZone[];
  zone?: DeliveryZone;
  message: string;
}> {
  try {
    // Check restricted zones
    const restrictedCheck = checkRestrictedZones(coordinates);
    
    // Check delivery zones
    const deliveryCheck = checkDeliveryZone(coordinates);

    const canDeliver = !restrictedCheck.isRestricted && deliveryCheck.isValidZone;

    let message = '';
    if (restrictedCheck.isRestricted) {
      const violationTypes = [...new Set(restrictedCheck.violations.map(v => v.type))];
      message = `Delivery not allowed within 500m of ${violationTypes.join(', ')}`;
    } else if (!deliveryCheck.isValidZone) {
      message = 'Location is outside our delivery service area';
    } else {
      message = 'Location verified for delivery';
    }

    return {
      isValid: !restrictedCheck.isRestricted,
      canDeliver,
      restrictions: deliveryCheck.restrictions,
      violations: restrictedCheck.violations,
      zone: deliveryCheck.zone,
      message
    };
  } catch (error) {
    console.error('Geofencing validation error:', error);
    return {
      isValid: false,
      canDeliver: false,
      restrictions: [],
      violations: [],
      message: 'Unable to validate location. Please try again.'
    };
  }
}

/**
 * Get user's current location with error handling
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Reverse geocoding to get address from coordinates
 * In production, this would use a real geocoding service
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<string> {
  // Mock implementation - in production, use Google Maps or similar service
  const { latitude, longitude } = coordinates;
  
  // Simple zone-based address assignment for Sikkim
  if (latitude >= 27.32 && latitude <= 27.35 && longitude >= 88.60 && longitude <= 88.62) {
    return "MG Marg, Gangtok, East Sikkim - 737101";
  } else if (latitude >= 27.35 && latitude <= 27.38 && longitude >= 88.61 && longitude <= 88.64) {
    return "Tadong, Gangtok, East Sikkim - 737102";
  } else {
    return `Sikkim (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  }
}

/**
 * Check delivery time restrictions
 */
export function checkDeliveryTimeRestrictions(zone?: DeliveryZone): {
  canDeliverNow: boolean;
  nextDeliveryWindow?: string;
  restrictions: string[];
} {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Default delivery hours: 10 AM - 10 PM
  let deliveryStartHour = 10;
  let deliveryEndHour = 22;
  
  // Check zone-specific restrictions
  const restrictions = zone?.restrictions || [];
  
  for (const restriction of restrictions) {
    if (restriction.includes('no_delivery_after_21:00')) {
      deliveryEndHour = 21;
    } else if (restriction.includes('no_delivery_after_22:00')) {
      deliveryEndHour = 22;
    }
  }
  
  const canDeliverNow = currentHour >= deliveryStartHour && currentHour < deliveryEndHour;
  
  let nextDeliveryWindow = '';
  if (!canDeliverNow) {
    if (currentHour < deliveryStartHour) {
      nextDeliveryWindow = `${deliveryStartHour}:00 AM today`;
    } else {
      nextDeliveryWindow = `${deliveryStartHour}:00 AM tomorrow`;
    }
  }
  
  return {
    canDeliverNow,
    nextDeliveryWindow,
    restrictions
  };
}
