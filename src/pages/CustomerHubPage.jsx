import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User,
  ShoppingBag,
  Heart,
  RotateCcw,
  MessageSquare,
  Package,
  Shirt,
  Zap,
  Home,
  ChevronRight,
  Star,
  ArrowRight,
  Eye,
  Ticket,
} from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { formatPrice, getProductImage } from "../utils/productHelpers";

/* ─── Page sections ─── */
const CUSTOMER_PAGES = [
  {
    group: "My Account",
    color: "#8B4852",
    bg: "#fdf2f3",
    items: [
      {
        to: "/profile",
        icon: User,
        label: "My Profile",
        desc: "Personal info, addresses & security",
      },
      {
        to: "/orders",
        icon: Package,
        label: "My Orders",
        desc: "Track and manage your orders",
      },
      {
        to: "/wishlist",
        icon: Heart,
        label: "Wishlist",
        desc: "Your saved favourite items",
      },
      {
        to: "/wardrobe",
        icon: Shirt,
        label: "My Wardrobe",
        desc: "AI-powered digital wardrobe",
      },
    ],
  },
  {
    group: "Support & Returns",
    color: "#1d4ed8",
    bg: "#eff6ff",
    items: [
      {
        to: "/tickets",
        icon: MessageSquare,
        label: "Support Tickets",
        desc: "Get help from our support team",
      },
      {
        to: "/returns",
        icon: RotateCcw,
        label: "Returns & Refunds",
        desc: "Request returns and track refunds",
      },
    ],
  },
  {
    group: "Shopping",
    color: "#065f46",
    bg: "#f0fdf9",
    items: [
      {
        to: "/browse",
        icon: ShoppingBag,
        label: "Shop All Products",
        desc: "Browse our full collection",
      },
      {
        to: "/cart",
        icon: ShoppingBag,
        label: "My Cart",
        desc: "Items ready for checkout",
      },
      {
        to: "/checkout",
        icon: ArrowRight,
        label: "Checkout",
        desc: "Complete your purchase",
      },
    ],
  },
];

function StarRow({ value }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          fill={value >= n ? "#D4AF7A" : "none"}
          stroke="#D4AF7A"
        />
      ))}
    </span>
  );
}

export default function CustomerHubPage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // TODO: wire to real API endpoint — Phase X
    setFeatured([]);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ivory, #f8f6f3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <main
        style={{
          flex: 1,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 20px",
          width: "100%",
        }}
      >
        {/* ── Hero banner ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--burgundy, #8B4852) 0%, #5a2d33 100%)",
            borderRadius: 20,
            padding: "36px 40px",
            marginBottom: 36,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
            boxShadow: "0 8px 32px rgba(139,72,82,0.25)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Home size={18} opacity={0.8} />
              <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>
                Customer Portal
              </span>
            </div>
            <h1
              style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              My Account
            </h1>
            <p
              style={{
                margin: 0,
                opacity: 0.85,
                fontSize: 15,
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Access all your customer pages — orders, profile, wishlist,
              returns, support, and more — from one place.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/browse"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "11px 22px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
                border: "1px solid rgba(255,255,255,0.3)",
                transition: "background 0.15s",
              }}
            >
              <ShoppingBag size={16} /> Shop Now
            </Link>
          </div>
        </div>

        {/* ── Quick-access page sections ── */}
        {CUSTOMER_PAGES.map((section) => (
          <div key={section.group} style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--charcoal, #1a1210)",
                margin: "0 0 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 20,
                  background: section.color,
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              {section.group}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 18px",
                      borderRadius: 14,
                      background: "white",
                      border: `1.5px solid ${section.color}20`,
                      textDecoration: "none",
                      transition: "all 0.15s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 6px 20px ${section.color}25`;
                      e.currentTarget.style.borderColor = section.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = `${section.color}20`;
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 11,
                        background: section.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: section.color,
                      }}
                    >
                      <Icon size={19} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 2px",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "var(--charcoal, #1a1210)",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "var(--charcoal-muted, #7a6a60)",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight
                      size={15}
                      style={{ color: "#ccc", flexShrink: 0 }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Featured products preview ── */}
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--charcoal, #1a1210)",
                margin: 0,
              }}
            >
              Featured Products
            </h2>
            <Link
              to="/browse"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "var(--burgundy, #8B4852)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            {featured.length === 0 ? (
              <p>No data yet.</p>
            ) : (
              featured.map((product) => {
                const img = getProductImage(product);
                const genderColor = {
                  Women: "#8B4852",
                  Men: "#1d4ed8",
                  Unisex: "#6c5b7b",
                };
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      style={{
                        background: "white",
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid #ede8e1",
                        transition: "all 0.18s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.05)";
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "3/4",
                          overflow: "hidden",
                          background: "#f5f0e8",
                        }}
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 28,
                              color: "#ccc",
                            }}
                          >
                            {product.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {product.isLowStock && (
                          <span
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              background: "#f97316",
                              color: "white",
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 20,
                            }}
                          >
                            Low Stock
                          </span>
                        )}
                        <span
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background:
                              genderColor[product.gender] || "#6c5b7b",
                            color: "white",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 20,
                          }}
                        >
                          {product.gender}
                        </span>
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: 11,
                            color: "#9a8070",
                            fontWeight: 600,
                          }}
                        >
                          {product.vendor.brandName}
                        </p>
                        <p
                          style={{
                            margin: "0 0 6px",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#1a1210",
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.name}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 6,
                          }}
                        >
                          <StarRow value={Math.round(product.rating)} />
                          <span style={{ fontSize: 11, color: "#9a8070" }}>
                            ({product.reviewCount})
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            fontSize: 14,
                            color: "var(--burgundy, #8B4852)",
                          }}
                        >
                          {formatPrice(product.basePrice, product.currency)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
