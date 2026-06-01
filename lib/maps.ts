/**
 * Universal Google Maps deep link for a coordinate. Opens the user's maps app
 * on mobile (or Google Maps web on desktop). Matches CEC's own ShowOnMap, which
 * also uses Google Maps. Swap the provider here if ever needed.
 */
export function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
