import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, CheckCircle, XCircle, Tag, Search, RefreshCw, Loader2, Zap, ArrowLeft, Edit2 } from "lucide-react";
import styles from "../../styles/AdminCoupons.module.css";
import apiClient from "../../utils/apiClient";
import { formatPrice } from "../../utils/productHelpers";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (id) => {
    try {
      await apiClient.patch(`/coupons/${id}/toggle`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to toggle coupon status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert("Failed to delete coupon");
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.type === "fixed" ? (coupon.value / 100).toString() : coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount ? (coupon.minOrderAmount / 100).toString() : "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ code: "", type: "percentage", value: "", minOrderAmount: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      alert("Please fill in code and value");
      return;
    }

    try {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: parseInt(formData.value, 10),
        minOrderAmount: formData.minOrderAmount ? parseInt(formData.minOrderAmount, 10) : 0,
      };

      if (payload.type === "fixed") {
        payload.value *= 100; // convert to piasters
      }
      if (payload.minOrderAmount) {
        payload.minOrderAmount *= 100;
      }

      if (editingId) {
        await apiClient.patch(`/coupons/${editingId}`, payload);
      } else {
        await apiClient.post("/coupons", payload);
      }

      handleCloseModal();
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${editingId ? "update" : "create"} coupon`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <Link to="/admin" className={styles.backBtn} title="Back to Dashboard">
          <ArrowLeft size={20} />
        </Link>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Coupons Management</h2>
            <p className={styles.subtitle}>Create and manage discount codes for your store</p>
          </div>
          <button className={styles.addBtn} onClick={() => { setEditingId(null); setShowModal(true); }}>
            <Plus size={18} />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <Loader2 className={styles.spinner} size={32} />
          </div>
        ) : coupons.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <Tag size={48} />
            </div>
            <h3>No coupons found</h3>
            <p>Create your first discount coupon to boost sales!</p>
            <button className={styles.emptyBtn} onClick={() => setShowModal(true)}>
              <Plus size={18} /> Add Coupon
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {coupons.map((coupon) => (
              <div key={coupon.id} className={`${styles.card} ${!coupon.isActive ? styles.inactive : ""}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.badgeWrap}>
                    <Tag size={16} />
                    <span className={styles.code}>{coupon.code}</span>
                  </div>
                  <button
                    onClick={() => handleToggle(coupon.id)}
                    className={coupon.isActive ? styles.toggleActive : styles.toggleInactive}
                    title={coupon.isActive ? "Deactivate" : "Activate"}
                  >
                    {coupon.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </button>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Discount:</span>
                    <span className={styles.value}>
                      {coupon.type === "fixed" ? formatPrice(coupon.value) : `${coupon.value}%`} OFF
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Min. Order:</span>
                    <span className={styles.value}>
                      {coupon.minOrderAmount > 0 ? formatPrice(coupon.minOrderAmount) : "None"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Used:</span>
                    <span className={styles.value}>
                      {coupon.usedCount || 0} times
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.date}>
                    Created {new Date(coupon.createdAt).toLocaleDateString()}
                  </span>
                  <div className={styles.cardActions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(coupon)}>
                      <Edit2 size={16} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(coupon.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Edit Coupon" : "Create New Coupon"}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (EGP)</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Value</label>
                  <input
                    type="number"
                    min="1"
                    placeholder={formData.type === "percentage" ? "e.g. 15" : "e.g. 100"}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Minimum Order Amount (EGP) - Optional</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
