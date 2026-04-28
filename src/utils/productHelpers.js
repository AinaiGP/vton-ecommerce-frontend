export function getProductImage(product) {
  const primary = product?.images?.find((img) => img?.isPrimary);
  if (primary?.s3Url) return primary.s3Url;
  if (product?.images?.[0]?.s3Url) return product.images[0].s3Url;
  return null;
}

export function getPrimaryVariantForColor(product, colorId) {
  if (!product?.variants?.length || !colorId) return null;
  return (
    product.variants.find((variant) => variant?.color?.id === colorId) ?? null
  );
}

export function getUniqueColors(product) {
  if (!product?.variants?.length) return [];

  const unique = new Map();
  for (const variant of product.variants) {
    const color = variant?.color;
    if (!color?.id || unique.has(color.id)) continue;
    unique.set(color.id, {
      id: color.id,
      name: color.name,
      hexCode: color.hexCode,
    });
  }

  return Array.from(unique.values());
}

export function getUniqueSizes(product) {
  if (!product?.variants?.length) return [];

  const unique = new Map();
  for (const variant of product.variants) {
    const size = variant?.size;
    if (!size?.id || unique.has(size.id)) continue;
    unique.set(size.id, {
      id: size.id,
      label: size.label,
    });
  }

  return Array.from(unique.values());
}

export function formatPrice(amount, currency) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "";

  if (currency === "EGP") {
    return `EGP ${amount.toFixed(2)}`;
  }

  const normalizedCurrency = currency || "EGP";
  return `${normalizedCurrency} ${amount.toFixed(2)}`;
}

export function getSizeRange(product) {
  const sizes = getUniqueSizes(product);
  if (sizes.length === 0) return "";
  if (sizes.length === 1) return sizes[0].label;

  // Attempt to identify start and end based on common size orders
  const labels = sizes.map((s) => s.label);
  return `${labels[0]}–${labels[labels.length - 1]}`;
}
