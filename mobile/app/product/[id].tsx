import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StickyBottomBar } from "@/components/StickyBottomBar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { products } from "@/data/mock";
import { theme } from "@/constants/theme";
import { ApiProduct, productApi, reviewApi, toMobileProduct } from "@/lib/api";

const fallbackProduct = {
  ...products[0],
  raw: null as ApiProduct | null
};

function getVariantAttrValue(variant: NonNullable<ApiProduct["variants"]>[number], key: string) {
  const source = variant.attributeValues;
  if (!source) return undefined;
  if (source instanceof Map) return source.get(key);
  return source[key];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addToCart, itemIds: cartItemIds } = useCart();
  const { itemIds: wishlistItemIds, toggle } = useWishlist();
  const [product, setProduct] = useState(fallbackProduct);
  const [relatedProducts, setRelatedProducts] = useState(products.slice(1, 5));
  const [reviews, setReviews] = useState<any[]>([]);
  const [visibleReviewCount, setVisibleReviewCount] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState<string | undefined>(fallbackProduct.imageUrl);

  const rawProduct = product.raw;

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        const response = await productApi.getById(id);
        const nextRaw = response.data.product;
        const nextProduct = toMobileProduct(nextRaw);
        setProduct({ ...nextProduct, raw: nextRaw });
        setActiveImage(nextProduct.imageUrl);

        const firstVariant = nextRaw.variants?.[0];
        if (firstVariant?.attributeValues) {
          if (firstVariant.attributeValues instanceof Map) {
            setSelectedOptions(Object.fromEntries(firstVariant.attributeValues.entries()));
          } else {
            setSelectedOptions(firstVariant.attributeValues);
          }
        } else {
          setSelectedOptions({});
        }

        const categorySlug = typeof nextRaw.category === "string" ? undefined : nextRaw.category?.slug;
        const relatedResponse = await productApi.getAll({ category: categorySlug, limit: 8 });
        const mappedRelated = relatedResponse.data.products
          .filter((item) => item._id !== nextRaw._id)
          .slice(0, 4)
          .map(toMobileProduct);
        if (mappedRelated.length > 0) {
          setRelatedProducts(mappedRelated);
        }

        const reviewResponse = await reviewApi.getProductReviews(nextRaw._id);
        setReviews(reviewResponse.data.reviews || []);
      } catch {
        // keep mock fallback
      }
    }

    loadProduct();
  }, [id]);

  const attributeNames = useMemo(() => {
    const names = new Set<string>();
    rawProduct?.variants?.forEach((variant) => {
      const values = variant.attributeValues;
      if (!values) return;
      const keys = values instanceof Map ? Array.from(values.keys()) : Object.keys(values);
      keys.forEach((key) => names.add(key));
    });
    return Array.from(names);
  }, [rawProduct]);

  const selectedVariant = useMemo(() => {
    if (!rawProduct?.variants?.length) return undefined;
    return rawProduct.variants.find((variant) =>
      Object.entries(selectedOptions).every(([key, value]) => getVariantAttrValue(variant, key) === value)
    ) || rawProduct.variants[0];
  }, [rawProduct, selectedOptions]);

  const galleryImages = useMemo(() => {
    if (!rawProduct) return product.imageUrl ? [product.imageUrl] : [];
    const unique = new Set<string>();
    const images: string[] = [];

    rawProduct.images?.forEach((image) => {
      if (image.url && !unique.has(image.url)) {
        unique.add(image.url);
        images.push(image.url);
      }
    });
    rawProduct.variants?.forEach((variant) => {
      if (variant.image && !unique.has(variant.image)) {
        unique.add(variant.image);
        images.push(variant.image);
      }
    });

    return images;
  }, [product.imageUrl, rawProduct]);

  const heroImage = activeImage || selectedVariant?.image || galleryImages[0] || product.imageUrl;
  const currentPrice = selectedVariant?.sellingPrice || product.price;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const currentSavings = currentCompareAtPrice ? Math.max(currentCompareAtPrice - currentPrice, 0) : 0;
  const currentStock = selectedVariant?.stock ?? 10;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock < 5;
  const isWishlisted = wishlistItemIds.has(product.id);
  const isInCart = cartItemIds.has(product.id);
  const compatibilityModels = rawProduct?.compatibility?.models || [];
  const compatibilityBrands = rawProduct?.compatibility?.brands || [];
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";
  const visibleReviews = reviews.slice(0, visibleReviewCount);
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((item) => Number(item.rating) === star).length;
    return {
      star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    };
  });

  useEffect(() => {
    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    }
  }, [selectedVariant?.image]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isInCart) {
      router.push("/cart");
      return;
    }

    try {
      await addToCart(
        {
          ...product,
          price: currentPrice,
          compareAtPrice: currentCompareAtPrice
        },
        quantity,
        {
          variantId: selectedVariant?._id || selectedVariant?.sku,
          selectedOptions
        }
      );
      Alert.alert("Added to cart", `${product.name} x${quantity} is now in your cart.`);
    } catch (error) {
      Alert.alert("Could not add to cart", error instanceof Error ? error.message : "Please try again.");
    }
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const added = await toggle(product);
      Alert.alert(added ? "Saved to wishlist" : "Removed from wishlist", product.name);
    } catch (error) {
      Alert.alert("Could not update wishlist", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Product" showBack />

        <View style={styles.galleryStage}>
          <View style={styles.galleryGlow} />
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: product.imageColor }]} />
          )}
          {galleryImages.length > 1 ? (
            <View style={styles.galleryCountPill}>
              <Ionicons name="images-outline" size={13} color={theme.colors.textPrimary} />
              <Text style={styles.galleryCountText}>{galleryImages.findIndex((image) => image === heroImage) + 1}/{galleryImages.length}</Text>
            </View>
          ) : null}
        </View>

        {galleryImages.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryRow} contentContainerStyle={styles.galleryRowContent}>
            {galleryImages.map((image, index) => (
              <Pressable
                key={image}
                style={[styles.galleryThumbWrap, image === heroImage && styles.galleryThumbWrapActive]}
                onPress={() => setActiveImage(image)}
              >
                <Image source={{ uri: image }} style={styles.galleryThumb} resizeMode="cover" />
                <View style={[styles.galleryThumbOverlay, image === heroImage && styles.galleryThumbOverlayActive]} />
                <Text style={[styles.galleryThumbIndex, image === heroImage && styles.galleryThumbIndexActive]}>{index + 1}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.topMetaRow}>
          <View style={styles.metaLeft}>
            <Text style={styles.category}>{product.category.toUpperCase()}</Text>
            <View style={[styles.stockBadge, isLowStock && styles.stockBadgeLow, isOutOfStock && styles.stockBadgeOut]}>
              <View style={[styles.stockDot, isLowStock && styles.stockDotLow, isOutOfStock && styles.stockDotOut]} />
              <Text style={[styles.stockText, isLowStock && styles.stockTextLow, isOutOfStock && styles.stockTextOut]}>
                {currentStock > 0 ? (isLowStock ? `LOW STOCK • ${currentStock} LEFT` : "IN STOCK") : "OUT OF STOCK"}
              </Text>
            </View>
          </View>
          <Pressable style={styles.wishlistButton} onPress={handleToggleWishlist}>
            <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={20} color={isWishlisted ? theme.colors.rose : theme.colors.textPrimary} />
            <Text style={styles.wishlistLabel}>{isWishlisted ? "Saved" : "Save"}</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₦{currentPrice.toLocaleString()}</Text>
          {currentCompareAtPrice ? <Text style={styles.compare}>₦{currentCompareAtPrice.toLocaleString()}</Text> : null}
        </View>
        {(currentSavings > 0 || product.walletPerk) ? (
          <View style={styles.valueSignalRow}>
            {currentSavings > 0 ? (
              <View style={styles.valueSignalPill}>
                <Ionicons name="pricetag-outline" size={14} color={theme.colors.amber} />
                <Text style={styles.valueSignalText}>SAVE ₦{currentSavings.toLocaleString()}</Text>
              </View>
            ) : null}
            {product.walletPerk ? (
              <View style={styles.walletPerkPill}>
                <Ionicons name="flash-outline" size={14} color={theme.colors.brand} />
                <Text style={styles.walletPerkText}>{product.walletPerk}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.topMetaSecondary}>
          <View style={styles.metaPill}>
            <Ionicons name="flash-outline" size={14} color={theme.colors.brand} />
            <Text style={styles.metaPillLabel}>Wallet perks available</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.brand} />
            <Text style={styles.metaPillLabel}>Trusted stock</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="cube-outline" size={14} color={theme.colors.brand} />
            <Text style={styles.metaPillLabel}>{selectedVariant?.sku || "Ready to ship"}</Text>
          </View>
        </View>

        {attributeNames.length > 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>CONFIGURE</Text>
            {attributeNames.map((name) => {
              const values = Array.from(new Set((rawProduct?.variants || []).map((variant) => getVariantAttrValue(variant, name)).filter(Boolean))) as string[];
              return (
                <View key={name} style={styles.selectorBlock}>
                  <Text style={styles.selectorLabel}>{name.toUpperCase()}</Text>
                  <View style={styles.selectorWrap}>
                    {values.map((value) => {
                      const selected = selectedOptions[name] === value;
                      return (
                        <Pressable
                          key={value}
                          style={[styles.selectorChip, selected && styles.selectorChipActive]}
                          onPress={() => setSelectedOptions((current) => ({ ...current, [name]: value }))}
                        >
                          <Text style={[styles.selectorChipText, selected && styles.selectorChipTextActive]}>{value}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.quantityCard}>
          <Text style={styles.cardLabel}>QUANTITY</Text>
          <View style={styles.quantityRow}>
            <Pressable style={styles.quantityButton} onPress={() => setQuantity((current) => Math.max(1, current - 1))}>
              <Text style={styles.quantityButtonLabel}>-</Text>
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable style={styles.quantityButton} onPress={() => setQuantity((current) => current + 1)}>
              <Text style={styles.quantityButtonLabel}>+</Text>
            </Pressable>
          </View>
        </View>

        {(compatibilityModels.length > 0 || compatibilityBrands.length > 0) ? (
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>COMPATIBILITY</Text>
            {compatibilityModels.length > 0 ? (
              <>
                <Text style={styles.cardTitle}>Works with these device families</Text>
                <View style={styles.compatibilityWrap}>
                  {compatibilityModels.map((model) => (
                    <View key={model} style={styles.compatibilityChip}>
                      <Text style={styles.compatibilityChipText}>{model}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            {compatibilityBrands.length > 0 ? (
              <Text style={styles.cardBody}>Brand support: {compatibilityBrands.join(", ")}.</Text>
            ) : null}
          </View>
        ) : null}

        {rawProduct?.specifications?.length ? (
          <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>SPECIFICATIONS</Text>
            {rawProduct.specifications.filter((spec) => spec.key && spec.value).map((spec) => (
              <View key={`${spec.key}-${spec.value}`} style={styles.specRow}>
                <Text style={styles.specKey}>{spec.key}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.brand} />
            <Text style={styles.trustLabel}>Original Gear</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="car-outline" size={18} color={theme.colors.brand} />
            <Text style={styles.trustLabel}>Fast Delivery</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh-outline" size={18} color={theme.colors.brand} />
            <Text style={styles.trustLabel}>Easy Returns</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardLabel}>DELIVERY</Text>
          <Text style={styles.cardTitle}>Fast delivery across Nigeria</Text>
          <Text style={styles.cardBody}>Estimated arrival in 2-4 business days depending on your delivery zone.</Text>
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionKicker}>FIELD REPORTS</Text>
          <Text style={styles.sectionHeading}>What Buyers Are Saying</Text>
          <View style={styles.reviewSummaryCard}>
            <View style={styles.reviewScoreWrap}>
              <Text style={styles.reviewScore}>{averageRating}</Text>
              <View>
                <View style={styles.starRow}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Ionicons
                      key={index}
                      name={index < Math.round(Number(averageRating)) ? "star" : "star-outline"}
                      size={14}
                      color={theme.colors.amber}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCountLabel}>Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}</Text>
              </View>
            </View>
            <View style={styles.ratingBreakdown}>
              {ratingCounts.map((item) => (
                <View key={item.star} style={styles.ratingRow}>
                  <Text style={styles.ratingStarLabel}>{item.star}</Text>
                  <View style={styles.ratingBarTrack}>
                    <View style={[styles.ratingBarFill, { width: `${item.percentage}%` }]} />
                  </View>
                  <Text style={styles.ratingCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {reviews.length === 0 ? (
            <View style={styles.emptyReviewCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color={theme.colors.textTertiary} />
              <Text style={styles.emptyReviewTitle}>No field reports yet</Text>
              <Text style={styles.emptyReviewBody}>The first verified buyers will start shaping the review story here.</Text>
            </View>
          ) : (
            <>
              {visibleReviews.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Ionicons name="person-outline" size={16} color={theme.colors.brand} />
                    </View>
                    <View style={styles.reviewHeaderBody}>
                      <Text style={styles.reviewAuthor}>
                        {review.user?.firstName} {review.user?.lastName ? `${String(review.user.lastName).charAt(0)}.` : ""}
                      </Text>
                      <View style={styles.starRow}>
                        {[0, 1, 2, 3, 4].map((index) => (
                          <Ionicons
                            key={index}
                            name={index < Number(review.rating || 0) ? "star" : "star-outline"}
                            size={12}
                            color={theme.colors.amber}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>"{review.comment}"</Text>
                  {review.images?.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewImageRow}>
                      {review.images.map((image: { url: string; alt?: string }, index: number) => (
                        <Image key={`${review._id}-${index}`} source={{ uri: image.url }} style={styles.reviewImage} resizeMode="cover" />
                      ))}
                    </ScrollView>
                  ) : null}
                </View>
              ))}
              {reviews.length > visibleReviewCount ? (
                <Pressable style={styles.loadMoreButton} onPress={() => setVisibleReviewCount((current) => current + 3)}>
                  <Text style={styles.loadMoreLabel}>LOAD MORE INTEL</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.relatedSection}>
          <Text style={styles.sectionKicker}>DISCOVER MORE</Text>
          <Text style={styles.sectionHeading}>Related Gear</Text>
          <Text style={styles.relatedBody}>More pieces from the same lane, tuned for the same setup and buying intent.</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedProducts.map((item) => <ProductCard key={item.id} product={item} compact />)}
        </ScrollView>
      </ScrollView>

      <StickyBottomBar
        primaryLabel={isInCart ? "View Cart" : "Add to Gear Bag"}
        secondaryLabel={isInCart ? "Checkout" : "Buy Now"}
        priceLabel={`₦${(currentPrice * quantity).toLocaleString()}`}
        onPrimaryPress={handleAddToCart}
        onSecondaryPress={() => isInCart ? router.push("/checkout") : handleAddToCart()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.xl, paddingTop: 64, paddingBottom: 120 },
  galleryStage: {
    position: "relative",
    marginBottom: theme.spacing.lg
  },
  galleryGlow: {
    position: "absolute",
    inset: 10,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.brandSoft,
    opacity: 0.45
  },
  heroImage: {
    height: 360,
    borderRadius: theme.radius.hero,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  galleryCountPill: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(9,9,9,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)"
  },
  galleryCountText: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  galleryRow: {
    marginBottom: theme.spacing.xl
  },
  galleryRowContent: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.sm
  },
  galleryThumbWrap: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
    backgroundColor: theme.colors.surfaceElevated
  },
  galleryThumbWrapActive: {
    borderColor: theme.colors.brand,
    transform: [{ scale: 0.96 }]
  },
  galleryThumb: {
    width: "100%",
    height: "100%"
  },
  galleryThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9,9,9,0.18)"
  },
  galleryThumbOverlayActive: {
    backgroundColor: "rgba(59,130,246,0.08)"
  },
  galleryThumbIndex: {
    position: "absolute",
    left: 8,
    bottom: 8,
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: "900",
    width: 22,
    height: 22,
    textAlign: "center",
    lineHeight: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "rgba(9,9,9,0.68)"
  },
  galleryThumbIndexActive: {
    backgroundColor: theme.colors.brand
  },
  topMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  metaLeft: {
    flex: 1,
    paddingRight: theme.spacing.md
  },
  topMetaSecondary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md
  },
  category: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: theme.spacing.sm,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.10)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.22)"
  },
  stockBadgeLow: {
    backgroundColor: "rgba(244,63,94,0.10)",
    borderColor: "rgba(244,63,94,0.22)"
  },
  stockBadgeOut: {
    backgroundColor: "rgba(244,63,94,0.14)",
    borderColor: "rgba(244,63,94,0.28)"
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.emerald
  },
  stockDotLow: {
    backgroundColor: theme.colors.rose
  },
  stockDotOut: {
    backgroundColor: theme.colors.rose
  },
  stockText: {
    color: theme.colors.emerald,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3
  },
  stockTextLow: {
    color: theme.colors.rose
  },
  stockTextOut: {
    color: theme.colors.rose
  },
  wishlistButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  wishlistLabel: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800"
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  metaPillLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700"
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 38,
    lineHeight: 40,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: theme.spacing.sm
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg
  },
  price: {
    color: theme.colors.brand,
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic"
  },
  compare: {
    color: theme.colors.textTertiary,
    fontSize: 14,
    textDecorationLine: "line-through",
    marginBottom: 4
  },
  valueSignalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  valueSignalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.24)"
  },
  valueSignalText: {
    color: theme.colors.amber,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1
  },
  walletPerkPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.22)"
  },
  walletPerkText: {
    color: theme.colors.brand,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: theme.spacing.lg
  },
  infoCard: {
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xl
  },
  cardLabel: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: theme.spacing.sm
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    marginBottom: theme.spacing.sm
  },
  cardBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
  },
  selectorBlock: {
    marginTop: theme.spacing.md
  },
  selectorLabel: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: theme.spacing.sm
  },
  selectorWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  selectorChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 42,
    justifyContent: "center"
  },
  selectorChipActive: {
    backgroundColor: "rgba(59,130,246,0.16)",
    borderColor: theme.colors.brand
  },
  selectorChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "800"
  },
  selectorChipTextActive: {
    color: theme.colors.brand
  },
  quantityCard: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    alignSelf: "flex-start"
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  quantityButtonLabel: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800"
  },
  quantityValue: {
    minWidth: 30,
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  compatibilityWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  compatibilityChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  compatibilityChipText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "800"
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)"
  },
  specKey: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1
  },
  specValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: theme.spacing.md
  },
  trustGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl
  },
  trustItem: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    gap: theme.spacing.sm
  },
  trustLabel: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },
  reviewsSection: {
    marginTop: theme.spacing.xxl
  },
  sectionKicker: {
    color: theme.colors.brand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: theme.spacing.sm
  },
  sectionHeading: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase"
  },
  reviewSummaryCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.hero,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  reviewScoreWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl
  },
  reviewScore: {
    color: theme.colors.textPrimary,
    fontSize: 42,
    fontWeight: "900",
    fontStyle: "italic"
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  reviewCountLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginTop: theme.spacing.sm,
    textTransform: "uppercase"
  },
  ratingBreakdown: {
    gap: theme.spacing.sm
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  ratingStarLabel: {
    width: 12,
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "900"
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.brand
  },
  ratingCount: {
    width: 20,
    textAlign: "right",
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontWeight: "800"
  },
  emptyReviewCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center"
  },
  emptyReviewTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    marginTop: theme.spacing.md
  },
  emptyReviewBody: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: theme.spacing.sm
  },
  reviewCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.22)"
  },
  reviewHeaderBody: {
    flex: 1,
    marginLeft: theme.spacing.md
  },
  reviewAuthor: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    marginBottom: 6
  },
  reviewDate: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginLeft: theme.spacing.md
  },
  reviewComment: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    fontStyle: "italic",
    marginTop: theme.spacing.lg
  },
  reviewImageRow: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingRight: theme.spacing.sm
  },
  reviewImage: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.lg
  },
  loadMoreButton: {
    alignSelf: "center",
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  loadMoreLabel: {
    color: theme.colors.textPrimary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  relatedSection: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.lg
  },
  relatedBody: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  }
});
