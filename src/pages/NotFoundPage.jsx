import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import styles from "../styles/NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.visual}>
          <div className={styles.glow} />
          <Ghost size={120} className={styles.icon} />
          <h1 className={styles.title}>404</h1>
        </div>
        
        <div className={styles.content}>
          <h2 className={styles.heading}>Lost in Style?</h2>
          <p className={styles.text}>
            The page you are looking for doesn't exist or has been moved to a new collection.
          </p>
          
          <div className={styles.actions}>
            <Link to="/" className={styles.primaryBtn}>
              <Home size={18} />
              Back to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className={styles.secondaryBtn}
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.decor1} />
      <div className={styles.decor2} />
    </div>
  );
}
