// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, validateDiscount, getSettings } from '../api';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  Tag,
  X,
  Lock
} from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'UPI'
  });

  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const [orderPlaced, setOrderPlaced] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  const freeShippingThreshold = settings?.shipping?.freeShippingThreshold || 999;
  const standardShippingCharge = settings?.shipping?.standardShippingCharge || 99;

  const currentDiscountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const currentSubtotal = cartTotal;
  const shippingCost = currentSubtotal >= freeShippingThreshold || currentSubtotal === 0 ? 0 : standardShippingCharge;
  const grandTotal = Math.max(0, currentSubtotal - currentDiscountAmount + shippingCost);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real Server-Side Discount Code Validation
  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!discountCodeInput.trim()) return;

    setDiscountError('');
    setValidatingDiscount(true);
    try {
      const result = await validateDiscount(discountCodeInput.trim(), currentSubtotal, formData.email || null);
      if (result.valid) {
        setAppliedDiscount(result);
        setDiscountError('');
      }
    } catch (err) {
      setAppliedDiscount(null);
      setDiscountError(err.message || 'Invalid discount code.');
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput('');
    setDiscountError('');
  };

  // Real Server-Side Order Submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setErrorMessage('');
    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          variantName: item.selectedOptions?.color || 'Standard'
        })),
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        paymentMethod: formData.paymentMethod
      };

      const res = await createOrder(orderPayload);
      setOrderPlaced(res.order);
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Order failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Confirmed View
  if (orderPlaced) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto 100px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: '#0d0f14',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '40px 32px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid #22c55e',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle size={32} />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
            Order Confirmed
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
            Thank you for ordering with LIGHTINMOTION. Your order has been placed into our fulfillment queue.
          </p>

          <div style={{ background: '#12141a', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '18px', textAlign: 'left', marginBottom: '24px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Order Number:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{orderPlaced.order_number}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Customer:</span>
              <span style={{ color: '#fff' }}>{orderPlaced.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Payment Mode:</span>
              <span style={{ color: '#22c55e', fontWeight: '700' }}>{orderPlaced.payment_method} ({orderPlaced.payment_status})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px' }}>
              <span style={{ color: '#94a3b8' }}>Total Paid:</span>
              <strong style={{ color: '#fff', fontSize: '1rem' }}>₹{Number(orderPlaced.total_amount).toLocaleString('en-IN')}.00</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to={`/track-order?number=${orderPlaced.order_number}`} className="btn-primary-blue" style={{ flex: 1, justifyContent: 'center' }}>
              Track Shipment
            </Link>
            <Link to="/" className="btn-secondary-dark" style={{ flex: 1, justifyContent: 'center' }}>
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <ShoppingBag size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Your Cart is Empty</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Please add some lighting gear before accessing checkout.</p>
        <Link to="/shop" className="btn-primary-blue">Browse Hardware</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 32px 80px', minHeight: '80vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
          <ArrowLeft size={14} /> Return to Store
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', textTransform: 'uppercase' }}>
          Secure Checkout
        </h1>
      </div>

      {errorMessage && (
        <div style={{ background: '#450a0a', border: '1px solid #dc2626', color: '#fca5a5', padding: '12px 16px', borderRadius: '4px', marginBottom: '20px', fontSize: '0.85rem' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="checkout-grid">
          {/* Left Column: Customer & Shipping & Payment */}
          <div>
            {/* Step 1: Shipping Address */}
            <div className="checkout-box">
              <div className="checkout-step-title">
                <span className="step-number-badge">1</span>
                <span>Delivery Address</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Abhay Sharma"
                    className="theme-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="input-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="abhay@example.com"
                    className="theme-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="input-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="theme-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Street Address / House / Flat *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Vardhman Colony, Flat 402"
                    className="theme-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="input-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Baddi"
                    className="theme-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="input-label">State & PIN *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="theme-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="PIN"
                      className="theme-input"
                      style={{ width: '90px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="checkout-box">
              <div className="checkout-step-title">
                <span className="step-number-badge">2</span>
                <span>Payment Method</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: formData.paymentMethod === 'UPI' ? '#141c2c' : '#0d0f14',
                  border: '1px solid ' + (formData.paymentMethod === 'UPI' ? '#2563eb' : 'var(--border-color)'),
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={formData.paymentMethod === 'UPI'}
                    onChange={handleInputChange}
                  />
                  <QrCode size={18} color="#38bdf8" />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>UPI / Instant QR</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: formData.paymentMethod === 'CARD' ? '#141c2c' : '#0d0f14',
                  border: '1px solid ' + (formData.paymentMethod === 'CARD' ? '#2563eb' : 'var(--border-color)'),
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={formData.paymentMethod === 'CARD'}
                    onChange={handleInputChange}
                  />
                  <CreditCard size={18} color="#38bdf8" />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Visa, MasterCard, RuPay</div>
                  </div>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: formData.paymentMethod === 'COD' ? '#141c2c' : '#0d0f14',
                  border: '1px solid ' + (formData.paymentMethod === 'COD' ? '#2563eb' : 'var(--border-color)'),
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleInputChange}
                  />
                  <Banknote size={18} color="#22c55e" />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#fff' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pay with cash upon delivery</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Real Discount Engine Input */}
          <div>
            <div className="checkout-box" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '240px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img
                      src={item.product.media?.[0]?.url || 'https://via.placeholder.com/60'}
                      alt={item.product.title}
                      style={{ width: '44px', height: '44px', borderRadius: '4px', objectFit: 'cover', background: '#000' }}
                    />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Qty: {item.quantity} {item.selectedOptions?.color && `• Color: ${item.selectedOptions.color}`}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={13} color="#38bdf8" />
                  <span>Discount Code</span>
                </label>

                {appliedDiscount ? (
                  <div style={{
                    background: '#091829',
                    border: '1px solid #0284c7',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#38bdf8', fontSize: '0.85rem' }}>
                        {appliedDiscount.code} ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.rate}% OFF` : `₹${appliedDiscount.rate} OFF`})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Saved ₹{appliedDiscount.discountAmount.toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="discount-input-row">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                        className="theme-input"
                        style={{ flexGrow: 1, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={validatingDiscount || !discountCodeInput.trim()}
                        className="btn-primary-blue"
                        style={{ padding: '8px 16px', fontSize: '0.78rem' }}
                      >
                        {validatingDiscount ? 'Validating...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && (
                      <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>
                        {discountError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#fff' }}>₹{currentSubtotal.toLocaleString('en-IN')}.00</span>
                </div>

                {appliedDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-₹{currentDiscountAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Delivery</span>
                  <span>{shippingCost === 0 ? <strong style={{ color: '#22c55e' }}>FREE</strong> : `₹${shippingCost}.00`}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px',
                  marginTop: '4px'
                }}>
                  <span>Final Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-buy-solid"
                style={{ width: '100%', justifyContent: 'center', marginTop: '20px', fontSize: '0.9rem' }}
              >
                <Lock size={16} />
                <span>{submitting ? 'Processing Order...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}.00`}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
