/* ================================================================
   AINAI — Demo Product Data
   Used by BrowsePage & ProductPage when API is unavailable
   ================================================================ */

const makeVariants = (colorList, sizeList, basePrice) => {
  const result = [];
  let vid = 1;
  for (const color of colorList) {
    for (const size of sizeList) {
      const priceAdj = size.label === "XL" || size.label === "XXL" ? 50 : size.label === "XS" ? -20 : 0;
      result.push({
        id: `v-${vid++}`,
        color,
        size,
        sku: `SKU-${color.name.slice(0,3).toUpperCase()}-${size.label}`,
        price: basePrice + priceAdj,
        availableQuantity: Math.floor(Math.random() * 15) + 1,
      });
    }
  }
  return result;
};

const COLORS = {
  black:   { id: "c1", name: "Black",       hexCode: "#1a1210" },
  white:   { id: "c2", name: "White",       hexCode: "#f8f6f3" },
  navy:    { id: "c3", name: "Navy Blue",   hexCode: "#1e3a5f" },
  burgundy:{ id: "c4", name: "Burgundy",    hexCode: "#8B4852" },
  gold:    { id: "c5", name: "Gold",        hexCode: "#D4AF7A" },
  rose:    { id: "c6", name: "Dusty Rose",  hexCode: "#c9848a" },
  emerald: { id: "c7", name: "Emerald",     hexCode: "#065f46" },
  cream:   { id: "c8", name: "Cream",       hexCode: "#f5f0e8" },
  camel:   { id: "c9", name: "Camel",       hexCode: "#c19a6b" },
};

const SIZES = {
  xs:  { id: "s1", label: "XS" },
  s:   { id: "s2", label: "S" },
  m:   { id: "s3", label: "M" },
  l:   { id: "s4", label: "L" },
  xl:  { id: "s5", label: "XL" },
  xxl: { id: "s6", label: "XXL" },
};

export const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    name: "Silk Evening Gown",
    basePrice: 2450,
    currency: "EGP",
    gender: "Women",
    rating: 4.8,
    reviewCount: 124,
    description: "An exquisite floor-length silk gown featuring a draped neckline and flowing silhouette. Crafted from premium pure silk, this piece delivers unmatched elegance for special occasions, galas, and evening events. The fabric catches light beautifully, creating a luminous finish.",
    vendor: { id: "v1", brandName: "Lumière by Yasmin", slug: "lumiere" },
    category: { id: "cat1", name: "Dresses" },
    images: [
      { id: "i1", s3Url: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i2", s3Url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
      { id: "i3", s3Url: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 2 },
    ],
    variants: makeVariants([COLORS.black, COLORS.navy, COLORS.burgundy], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 2450),
    isLowStock: false,
  },
  {
    id: "demo-2",
    name: "Embroidered Velvet Abaya",
    basePrice: 1890,
    currency: "EGP",
    gender: "Women",
    rating: 4.9,
    reviewCount: 211,
    description: "Opulent velvet abaya adorned with intricate gold thread embroidery at the cuffs and hemline. Designed with a modest, flowing fit that pairs beautifully with both traditional and contemporary styling. A statement piece rooted in heritage craftsmanship.",
    vendor: { id: "v2", brandName: "Al-Nour Couture", slug: "al-nour" },
    category: { id: "cat2", name: "Abayas" },
    images: [
      { id: "i4", s3Url: "https://images.unsplash.com/photo-1606503153255-59d5e417c1ef?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i5", s3Url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
    ],
    variants: makeVariants([COLORS.black, COLORS.navy, COLORS.emerald], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl, SIZES.xxl], 1890),
    isLowStock: false,
  },
  {
    id: "demo-3",
    name: "Linen Wide-Leg Trousers",
    basePrice: 620,
    currency: "EGP",
    gender: "Unisex",
    rating: 4.5,
    reviewCount: 87,
    description: "Effortlessly chic wide-leg trousers in premium stonewashed linen. Features a high-rise waist, side pockets, and relaxed drape for all-day comfort. Versatile enough for casual outings or smart-casual office environments.",
    vendor: { id: "v3", brandName: "Desert Modern", slug: "desert-modern" },
    category: { id: "cat3", name: "Bottoms" },
    images: [
      { id: "i6", s3Url: "https://images.unsplash.com/photo-1594938298603-c8148c4b3d31?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i7", s3Url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
    ],
    variants: makeVariants([COLORS.cream, COLORS.camel, COLORS.black], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 620),
    isLowStock: false,
  },
  {
    id: "demo-4",
    name: "Structured Blazer",
    basePrice: 1250,
    currency: "EGP",
    gender: "Women",
    rating: 4.6,
    reviewCount: 63,
    description: "A tailored power blazer with a nipped waist and peak lapels. Made from a wool-blend fabric with a subtle texture. Fully lined with a slit cuff detail. Perfect for boardroom meetings, presentations, or elevated street style.",
    vendor: { id: "v3", brandName: "Desert Modern", slug: "desert-modern" },
    category: { id: "cat4", name: "Tops" },
    images: [
      { id: "i8", s3Url: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i9", s3Url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
    ],
    variants: makeVariants([COLORS.black, COLORS.navy, COLORS.camel], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l], 1250),
    isLowStock: false,
  },
  {
    id: "demo-5",
    name: "Floral Midi Dress",
    basePrice: 780,
    currency: "EGP",
    gender: "Women",
    rating: 4.7,
    reviewCount: 156,
    description: "A dreamy midi dress in lightweight chiffon with an all-over floral print. Features a V-neckline, adjustable tie waist, and flowy skirt. Pairs beautifully with sandals for brunch or heels for evening dining.",
    vendor: { id: "v1", brandName: "Lumière by Yasmin", slug: "lumiere" },
    category: { id: "cat1", name: "Dresses" },
    images: [
      { id: "i10", s3Url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i11", s3Url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
    ],
    variants: makeVariants([COLORS.rose, COLORS.cream], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 780),
    isLowStock: true,
  },
  {
    id: "demo-6",
    name: "Men's Kandura Premium",
    basePrice: 1100,
    currency: "EGP",
    gender: "Men",
    rating: 4.8,
    reviewCount: 94,
    description: "A premium quality kandura crafted from 100% Egyptian cotton with a crisp, clean finish. Features a traditional cut with a subtle mandarin collar, French cuffs, and refined button detailing. Available in classic white and contemporary pearl cream.",
    vendor: { id: "v4", brandName: "Heritage House", slug: "heritage-house" },
    category: { id: "cat5", name: "Men" },
    images: [
      { id: "i12", s3Url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
    ],
    variants: makeVariants([COLORS.white, COLORS.cream], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl, SIZES.xxl], 1100),
    isLowStock: false,
  },
  {
    id: "demo-7",
    name: "Kaftan with Gold Trim",
    basePrice: 1680,
    currency: "EGP",
    gender: "Women",
    rating: 4.9,
    reviewCount: 178,
    description: "A luxurious kaftan featuring handwoven gold trim along the neckline and sleeves. Made from flowing satin fabric with intricate patterns inspired by Arabesque art. Perfect for Eid celebrations, weddings, and formal gatherings.",
    vendor: { id: "v2", brandName: "Al-Nour Couture", slug: "al-nour" },
    category: { id: "cat2", name: "Abayas" },
    images: [
      { id: "i13", s3Url: "https://images.unsplash.com/photo-1611042553484-d61f84d22784?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i14", s3Url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
    ],
    variants: makeVariants([COLORS.gold, COLORS.burgundy, COLORS.emerald], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 1680),
    isLowStock: false,
  },
  {
    id: "demo-8",
    name: "Relaxed Linen Shirt",
    basePrice: 420,
    currency: "EGP",
    gender: "Unisex",
    rating: 4.4,
    reviewCount: 52,
    description: "An oversized linen shirt with dropped shoulders and a relaxed boxy fit. Features a chest pocket, roll-tab sleeves, and a curved hem. Ideal for hot weather — breathable, soft, and effortlessly stylish.",
    vendor: { id: "v3", brandName: "Desert Modern", slug: "desert-modern" },
    category: { id: "cat4", name: "Tops" },
    images: [
      { id: "i15", s3Url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
    ],
    variants: makeVariants([COLORS.white, COLORS.camel, COLORS.navy], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl, SIZES.xxl], 420),
    isLowStock: false,
  },
  {
    id: "demo-9",
    name: "Pleated Skirt",
    basePrice: 560,
    currency: "EGP",
    gender: "Women",
    rating: 4.3,
    reviewCount: 41,
    description: "A knee-length pleated skirt in lightweight crepe fabric with a high-rise elastic waist. The pleated front adds elegant volume and movement. Easy to style with tucked blouses, fitted tops, or knitwear.",
    vendor: { id: "v1", brandName: "Lumière by Yasmin", slug: "lumiere" },
    category: { id: "cat3", name: "Bottoms" },
    images: [
      { id: "i16", s3Url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
    ],
    variants: makeVariants([COLORS.black, COLORS.rose, COLORS.cream], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l], 560),
    isLowStock: false,
  },
  {
    id: "demo-10",
    name: "Cashmere Cardigan",
    basePrice: 1320,
    currency: "EGP",
    gender: "Women",
    rating: 4.7,
    reviewCount: 89,
    description: "A buttery-soft cashmere cardigan with a long, open front and deep side pockets. Knit in a fine gauge with subtle ribbed detailing at cuffs and hem. An investment piece that layers effortlessly year-round.",
    vendor: { id: "v4", brandName: "Heritage House", slug: "heritage-house" },
    category: { id: "cat4", name: "Tops" },
    images: [
      { id: "i17", s3Url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
      { id: "i18", s3Url: "https://images.unsplash.com/photo-1548624313-0396a55f33e1?w=800&h=1000&fit=crop", isPrimary: false, sortOrder: 1 },
    ],
    variants: makeVariants([COLORS.camel, COLORS.cream, COLORS.black], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 1320),
    isLowStock: false,
  },
  {
    id: "demo-11",
    name: "Men's Linen Suit",
    basePrice: 2800,
    currency: "EGP",
    gender: "Men",
    rating: 4.6,
    reviewCount: 37,
    description: "A summer-weight linen two-piece suit with notch lapels and a half-lined jacket. Trousers feature a flat front with a clean break. The breathable fabric keeps you cool while maintaining a sharp, polished appearance.",
    vendor: { id: "v4", brandName: "Heritage House", slug: "heritage-house" },
    category: { id: "cat5", name: "Men" },
    images: [
      { id: "i19", s3Url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
    ],
    variants: makeVariants([COLORS.navy, COLORS.camel, COLORS.white], [SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 2800),
    isLowStock: true,
  },
  {
    id: "demo-12",
    name: "Printed Wrap Blouse",
    basePrice: 390,
    currency: "EGP",
    gender: "Women",
    rating: 4.2,
    reviewCount: 29,
    description: "A lightweight wrap blouse in viscose with a signature geometric print. Features a V-neckline, long sleeves with a subtle bell flare at cuffs, and a self-tie waist. Pairs beautifully with wide-leg trousers or tailored skirts.",
    vendor: { id: "v1", brandName: "Lumière by Yasmin", slug: "lumiere" },
    category: { id: "cat4", name: "Tops" },
    images: [
      { id: "i20", s3Url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop", isPrimary: true, sortOrder: 0 },
    ],
    variants: makeVariants([COLORS.burgundy, COLORS.navy], [SIZES.xs, SIZES.s, SIZES.m, SIZES.l, SIZES.xl], 390),
    isLowStock: false,
  },
];

export function getDemoProduct(id) {
  return DEMO_PRODUCTS.find(p => p.id === id) || null;
}
