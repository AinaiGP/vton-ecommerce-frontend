import {
  ShoppingBag,
  Store,
  Shield,
  Headphones,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import AinaiLogo from "../common/AinaiLogo";
import styles from "../../styles/RoleSelectorModal.module.css";

const roles = [
  {
    id: "customer",
    title: "Customer",
    description:
      "Browse and shop the latest fashion from top designers and vendors.",
    icon: ShoppingBag,
    accent: "burgundy",
    link: "/browse",
  },
  {
    id: "vendor",
    title: "Vendor",
    description:
      "Manage your store, products, orders, and analytics all in one place.",
    icon: Store,
    accent: "gold",
    link: "/vendor",
  },
  {
    id: "admin",
    title: "Admin",
    description:
      "Full platform oversight, user management, and system configuration.",
    icon: Shield,
    accent: "sage",
    link: "/admin",
  },
  {
    id: "support",
    title: "Technical Support",
    description:
      "Resolve tickets, assist vendors and customers with technical issues.",
    icon: Headphones,
    accent: "purple",
    link: "/support",
  },
];

export default function RoleSelectorModal({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <AinaiLogo
            size="md"
            variant="light"
            showArabic={false}
            showTagline={false}
            animated={false}
          />
          <div className={styles.headerText}>
            <h1 className={styles.title}>
              <Sparkles size={20} className={styles.sparkle} />
              Choose Your Role
            </h1>
            <p className={styles.subtitle}>
              Select how you'd like to use AINAI today
            </p>
          </div>
        </div>

        {/* Role cards grid */}
        <div className={styles.grid}>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.id}
                to={role.link}
                className={`${styles.card} ${styles[role.accent]}`}
              >
                {/* Decorative gradient bg */}
                <div className={styles.cardGlow} />

                <div className={styles.cardIcon}>
                  <Icon size={28} />
                </div>
                <h2 className={styles.cardTitle}>{role.title}</h2>
                <p className={styles.cardDesc}>{role.description}</p>
                <span className={styles.cardAction}>
                  Continue <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          You can switch roles anytime from your profile settings.
        </p>
      </div>
    </div>
  );
}
