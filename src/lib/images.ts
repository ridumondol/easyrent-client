const EQUIPMENT_IMAGE_FALLBACK = "/equipment-placeholder.svg";

export function getEquipmentImageSrc(value: string): string {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return EQUIPMENT_IMAGE_FALLBACK;
    if (url.hostname === "example.com" || url.hostname === "www.example.com") {
      return EQUIPMENT_IMAGE_FALLBACK;
    }
    return value;
  } catch {
    return value.startsWith("/") ? value : EQUIPMENT_IMAGE_FALLBACK;
  }
}
