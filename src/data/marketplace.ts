import {
  Camera,
  CarFront,
  Construction,
  Cpu,
  PartyPopper,
  Tractor,
  type LucideIcon,
} from "lucide-react";

export type Equipment = {
  id: string;
  name: string;
  category: string;
  location: string;
  dailyRate: number;
  rating: number;
  reviewCount: number;
  image: string;
  imageAlt: string;
  availability: "Available today" | "Available this week";
  owner: string;
  description: string;
};

export type EquipmentCategory = {
  name: string;
  count: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
};

export const categories: EquipmentCategory[] = [
  {
    name: "Construction",
    count: "1,240+ items",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Construction crew working on a building site",
    icon: Construction,
  },
  {
    name: "Vehicles",
    count: "860+ items",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Utility vehicle ready for a day on the road",
    icon: CarFront,
  },
  {
    name: "Agriculture",
    count: "540+ items",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Golden farmland stretching to the horizon",
    icon: Tractor,
  },
  {
    name: "Photography",
    count: "730+ items",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Professional camera and photography equipment",
    icon: Camera,
  },
  {
    name: "Electronics",
    count: "920+ items",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Modern electronics arranged on a desk",
    icon: Cpu,
  },
  {
    name: "Event Equipment",
    count: "410+ items",
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=800&q=85",
    imageAlt: "Outdoor event setup with tables and lighting",
    icon: PartyPopper,
  },
];

export const equipment: Equipment[] = [
  {
    id: "mini-excavator",
    name: "Kubota KX040 Mini Excavator",
    category: "Construction",
    location: "Austin, TX",
    dailyRate: 285,
    rating: 4.9,
    reviewCount: 28,
    image:
      "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Compact excavator parked at a construction site",
    availability: "Available today",
    owner: "Hill Country Equipment",
    description:
      "A dependable 4-ton compact excavator with an enclosed cab, hydraulic thumb, and trailer-ready tracks. Great for trenching, landscaping, and tight-access jobs.",
  },
  {
    id: "ford-transit",
    name: "Ford Transit Cargo Van",
    category: "Vehicles",
    location: "Brooklyn, NY",
    dailyRate: 119,
    rating: 4.8,
    reviewCount: 41,
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "White cargo van parked beside a city street",
    availability: "Available today",
    owner: "Northside Fleet Co.",
    description:
      "A clean, long-wheelbase cargo van with generous load space, tie-down points, and a backup camera. A practical choice for deliveries and weekend moves.",
  },
  {
    id: "kubota-tractor",
    name: "Kubota L3902 Compact Tractor",
    category: "Agriculture",
    location: "Boulder, CO",
    dailyRate: 210,
    rating: 5.0,
    reviewCount: 17,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Green agricultural field ready for farm equipment",
    availability: "Available this week",
    owner: "Front Range Farm Supply",
    description:
      "A versatile 37 HP compact tractor suited to property work, small farms, and acreage maintenance. Implements can be arranged with the local owner.",
  },
  {
    id: "canon-camera-kit",
    name: "Canon EOS R6 Mark II Kit",
    category: "Photography",
    location: "Los Angeles, CA",
    dailyRate: 95,
    rating: 4.9,
    reviewCount: 36,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Mirrorless camera ready for a professional shoot",
    availability: "Available today",
    owner: "Silverlake Camera House",
    description:
      "A creator-ready full-frame camera kit with a versatile 24–105mm lens, two batteries, and a dual charger. Pickup includes a quick setup walkthrough.",
  },
  {
    id: "portable-generator",
    name: "Honda EU7000is Generator",
    category: "Construction",
    location: "Nashville, TN",
    dailyRate: 88,
    rating: 4.7,
    reviewCount: 22,
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Portable power equipment at an outdoor work site",
    availability: "Available today",
    owner: "Volunteer Tool Share",
    description:
      "Quiet, fuel-efficient portable power for job sites, outdoor events, and backup needs. Owner supplies a full tank and a heavy-duty extension lead.",
  },
  {
    id: "scissor-lift",
    name: "JLG 1930ES Scissor Lift",
    category: "Construction",
    location: "Phoenix, AZ",
    dailyRate: 165,
    rating: 4.8,
    reviewCount: 19,
    image:
      "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Scissor lift and access equipment at a work site",
    availability: "Available this week",
    owner: "Desert Site Rentals",
    description:
      "An electric indoor/outdoor lift with a 19-foot platform height and zero-emission operation. Delivery and a short safety orientation are available.",
  },
];

export const reviews = [
  {
    name: "Maya Chen",
    role: "Independent filmmaker",
    location: "Los Angeles, CA",
    rating: 5,
    text: "Found a camera kit two blocks from my shoot. The owner was thoughtful, the gear was spotless, and the whole pickup took five minutes.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=85",
  },
  {
    name: "Daniel Brooks",
    role: "Landscape contractor",
    location: "Austin, TX",
    rating: 5,
    text: "We rented a mini excavator for a backyard job and saved a full day. It was exactly as listed, and the owner even shared a few helpful tips.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=85",
  },
  {
    name: "Olivia Martinez",
    role: "Community event producer",
    location: "Denver, CO",
    rating: 5,
    text: "The flexibility made our neighborhood festival possible. It felt good to rent locally instead of buying equipment we’d only use once.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=85",
  },
  {
    name: "Marcus Reed",
    role: "Small farm owner",
    location: "Boulder, CO",
    rating: 5,
    text: "Straightforward pricing and reliable equipment. I found a tractor nearby for a weekend project without calling around all afternoon.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=85",
  },
];
