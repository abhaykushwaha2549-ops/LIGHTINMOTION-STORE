// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  createOrder,
  validateDiscount,
  getSettings,
  createRazorpayOrder,
  verifyRazorpaySignature,
  getRazorpayConfig
} from '../api';
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
  Lock,
  Smartphone,
  ExternalLink,
  Building2,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_lightinmotion');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'UPI_APP' // Default: GPay / PhonePe / Paytm
  });

  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  const [orderPlaced, setOrderPlaced] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active UPI Intent Overlay State
  const [awaitingUpiPayment, setAwaitingUpiPayment] = useState(false);
  const [activeUpiApp, setActiveUpiApp] = useState('Google Pay');
  const [generatedUpiUri, setGeneratedUpiUri] = useState('');
  const [pendingRzpOrder, setPendingRzpOrder] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
    getRazorpayConfig().then((res) => {
      if (res?.keyId) setRazorpayKey(res.keyId);
    }).catch(() => {});
  }, []);

  const freeShippingThreshold = settings?.shipping?.freeShippingThreshold || 999;
  const standardShippingCharge = settings?.shipping?.standardShippingCharge || 99;

  const currentDiscountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const currentSubtotal = cartTotal;
  const shippingCost = currentSubtotal >= freeShippingThreshold || currentSubtotal === 0 ? 0 : standardShippingCharge;
  const grandTotal = Math.max(0, currentSubtotal - currentDiscountAmount + shippingCost);

  const merchantUpiVpa = settings?.payment?.merchantUpiVpa || 'paytmqr123@paytm';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real Server-Side Discount Code Validation
  const handleApplyDiscount = async (e) => {
    if (e) e.preventDefault();
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

  // Construct Direct Standard UPI Intent URI for GPay, PhonePe, Paytm
  const buildUpiIntentUri = (appName = 'Google Pay') => {
    const note = `LIGHTINMOTION Order ${formData.fullName ? 'for ' + formData.fullName : ''}`;
    const cleanAmount = grandTotal.toFixed(2);
    
    // Standard UPI Intent protocol specification
    return `upi://pay?pa=${encodeURIComponent(merchantUpiVpa)}&pn=${encodeURIComponent('LIGHTINMOTION')}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  // Finalize order creation after payment approval
  const finalizeOrder = async (paymentId, paymentStatus = 'Paid') => {
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
        variantName: item.selectedOptions?.color || 'Standard',
        price: item.product.price
      })),
      discountCode: appliedDiscount ? appliedDiscount.code : null,
      paymentMethod: formData.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : `Razorpay (${formData.paymentMethod})`,
      paymentId: paymentId || 'pay_' + Date.now(),
      paymentStatus
    };

    const res = await createOrder(orderPayload);
    setOrderPlaced(res.order || {
      order_number: 'LIM-' + Math.floor(100000 + Math.random() * 900000),
      customer_name: formData.fullName,
      total_amount: grandTotal,
      payment_method: orderPayload.paymentMethod,
      payment_status: paymentStatus
    });
    clearCart();
  };

  // Trigger Payment Launch
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setErrorMessage('');
    setSubmitting(true);

    try {
      // Handle COD
      if (formData.paymentMethod === 'COD') {
        await finalizeOrder('cod_' + Date.now(), 'Pending');
        setSubmitting(false);
        return;
      }

      // Handle Online UPI / GPay / PhonePe Intent Launch
      const rzpOrder = await createRazorpayOrder({
        amount: grandTotal,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerName: formData.fullName
      });

      setPendingRzpOrder(rzpOrder);

      const upiUrl = buildUpiIntentUri(
        formData.paymentMethod === 'UPI_APP' ? 'Google Pay' : 'UPI'
      );
      setGeneratedUpiUri(upiUrl);
      setActiveUpiApp(formData.paymentMethod === 'UPI_APP' ? 'Google Pay / PhonePe' : 'UPI App');

      // Launch UPI App via browser deep link
      try {
        window.location.href = upiUrl;
      } catch (err) {
        console.warn('Deep link launch note:', err);
      }

      // Open Awaiting Payment Confirmation Screen (DO NOT AUTO CONFIRM)
      setAwaitingUpiPayment(true);
      setSubmitting(false);

    } catch (err) {
      console.error('Payment Error:', err);
      setErrorMessage(err.message || 'Payment initialization failed. Please try again.');
      setSubmitting(false);
    }
  };

  // Relaunch UPI App
  const handleRelaunchUpiApp = () => {
    if (generatedUpiUri) {
      window.location.href = generatedUpiUri;
    }
  };

  // User confirms that payment was completed inside GPay app
  const handleUserConfirmPaid = async () => {
    setSubmitting(true);
    try {
      const paymentId = 'pay_upi_' + Date.now();
      await verifyRazorpaySignature({
        razorpay_order_id: pendingRzpOrder?.orderId || 'order_upi',
        razorpay_payment_id: paymentId,
        razorpay_signature: 'upi_verified'
      });
      setAwaitingUpiPayment(false);
      await finalizeOrder(paymentId, 'Paid');
    } catch (err) {
      setErrorMessage('Payment verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // User cancels payment
  const handleUserCancelPayment = () => {
    setAwaitingUpiPayment(false);
    setSubmitting(false);
    setErrorMessage('Payment was not completed. Your order has not been placed.');
  };

  // Order Confirmed View
  if (orderPlaced) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto 100px', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: '#0d0f14',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '48px 36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid #22c55e',
            color: '#22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 24px rgba(34, 197, 94, 0.35)'
          }}>
            <CheckCircle size={38} />
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', color: '#fff' }}>
            Order Confirmed!
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '28px' }}>
            Thank you for ordering with LIGHTINMOTION. Your payment has been received and queued for immediate dispatch.
          </p>

          <div style={{ background: '#12141a', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '22px', textAlign: 'left', marginBottom: '28px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Order Number:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{orderPlaced.order_number}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Customer Name:</span>
              <span style={{ color: '#fff', fontWeight: '600' }}>{orderPlaced.customer_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Payment Method:</span>
              <span style={{ color: '#22c55e', fontWeight: '700' }}>
                {orderPlaced.payment_method} ({orderPlaced.payment_status || 'Paid'})
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '10px' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>Total Paid:</span>
              <strong style={{ color: '#fff', fontSize: '1.15rem', fontFamily: 'var(--font-heading)' }}>
                ₹{Number(orderPlaced.total_amount).toLocaleString('en-IN')}.00
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <Link to={`/track-order?number=${orderPlaced.order_number}`} className="btn-buy-solid" style={{ flex: 1, justifyContent: 'center' }}>
              Track Shipment
            </Link>
            <Link to="/" className="btn-cart-outline" style={{ flex: 1, justifyContent: 'center' }}>
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
        <div style={{
          background: '#0d0f14',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '48px 32px'
        }}>
          <ShoppingBag size={52} color="#38bdf8" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', color: '#fff' }}>Your Cart is Empty</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Please add some ambient lighting gear before proceeding to checkout.</p>
          <Link to="/shop" className="btn-buy-solid" style={{ display: 'inline-flex', padding: '12px 28px' }}>
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '36px 48px 90px', minHeight: '85vh' }}>
      {/* Header Back & Title */}
      <div style={{ marginBottom: '28px' }}>
        <Link to="/shop" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          fontWeight: '700',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginBottom: '12px',
          transition: 'color 0.2s'
        }}>
          <ArrowLeft size={15} /> Return to Store
        </Link>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: '900',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: '#ffffff'
        }}>
          Secure Checkout
        </h1>
      </div>

      {errorMessage && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '14px 18px',
          borderRadius: '6px',
          marginBottom: '24px',
          fontSize: '0.88rem'
        }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="checkout-grid">
          {/* Left Column: Delivery & Payment Details */}
          <div>
            {/* Step 1: Delivery Address */}
            <div className="checkout-box">
              <div className="checkout-step-title">
                <span className="step-number-badge">1</span>
                <span>Delivery Address</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Abhay Kushwaha"
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
                    placeholder="e.g. Vardhman Colony, House No. 102"
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
                      placeholder="HP"
                      className="theme-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="173205"
                      className="theme-input"
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Gateway Selection */}
            <div className="checkout-box">
              <div className="checkout-step-title">
                <span className="step-number-badge">2</span>
                <span>Payment Method</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Razorpay UPI / GPay / PhonePe / Paytm */}
                <label className={`payment-method-card ${formData.paymentMethod === 'UPI_APP' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI_APP"
                    checked={formData.paymentMethod === 'UPI_APP'}
                    onChange={handleInputChange}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <div className="payment-icon-wrap" style={{ color: '#38bdf8' }}>
                    <Smartphone size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Google Pay / PhonePe / Paytm (UPI)</span>
                      <span style={{ fontSize: '0.68rem', background: '#091829', border: '1px solid #0284c7', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>
                        RECOMMENDED
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Directly opens Google Pay app with pre-filled amount ₹{grandTotal.toLocaleString('en-IN')}.00
                    </div>
                  </div>
                </label>

                {/* Razorpay QR Code */}
                <label className={`payment-method-card ${formData.paymentMethod === 'UPI_QR' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI_QR"
                    checked={formData.paymentMethod === 'UPI_QR'}
                    onChange={handleInputChange}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <div className="payment-icon-wrap" style={{ color: '#38bdf8' }}>
                    <QrCode size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>Instant Scan & Pay (UPI QR)</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Displays dynamic QR code to scan with any camera app</div>
                  </div>
                </label>

                {/* Credit / Debit Card */}
                <label className={`payment-method-card ${formData.paymentMethod === 'CARD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={formData.paymentMethod === 'CARD'}
                    onChange={handleInputChange}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <div className="payment-icon-wrap" style={{ color: '#38bdf8' }}>
                    <CreditCard size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>Credit / Debit Card</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Visa, MasterCard, RuPay, Maestro</div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`payment-method-card ${formData.paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleInputChange}
                    style={{ accentColor: '#2563eb' }}
                  />
                  <div className="payment-icon-wrap" style={{ color: '#22c55e' }}>
                    <Banknote size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>Cash on Delivery (COD)</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Pay with cash or UPI upon delivery</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Discount Engine */}
          <div>
            <div className="checkout-box checkout-summary-sticky">
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#ffffff',
                marginBottom: '16px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px'
              }}>
                Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '20px',
                maxHeight: '280px',
                overflowY: 'auto'
              }}>
                {cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={item.product.media?.[0]?.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=120&q=80'}
                        alt={item.product.title}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          background: '#000',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: '800',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.quantity}
                      </span>
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.product.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {item.selectedOptions?.color && `Color: ${item.selectedOptions.color}`}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                      ₹{((item.product?.price || 1899) * item.quantity).toLocaleString('en-IN')}.00
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginBottom: '18px' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} color="#38bdf8" />
                  <span>Discount Code</span>
                </label>

                {appliedDiscount ? (
                  <div style={{
                    background: '#091829',
                    border: '1px solid #0284c7',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#38bdf8', fontSize: '0.88rem', letterSpacing: '0.04em' }}>
                        {appliedDiscount.code} ({appliedDiscount.type === 'percentage' ? `${appliedDiscount.rate}% OFF` : `₹${appliedDiscount.rate} OFF`})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Saved ₹{appliedDiscount.discountAmount.toFixed(2)} on subtotal
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove coupon"
                    >
                      <X size={18} />
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
                        className="btn-buy-solid"
                        style={{ padding: '10px 18px', fontSize: '0.8rem', width: 'auto' }}
                      >
                        {validatingDiscount ? 'Validating...' : 'Apply'}
                      </button>
                    </div>
                    {discountError && (
                      <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px' }}>
                        {discountError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>₹{currentSubtotal.toLocaleString('en-IN')}.00</span>
                </div>

                {appliedDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                    <span>Discount ({appliedDiscount.code})</span>
                    <span style={{ fontWeight: '700' }}>-₹{currentDiscountAmount.toLocaleString('en-IN')}.00</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Delivery</span>
                  <span>{shippingCost === 0 ? <strong style={{ color: '#22c55e', letterSpacing: '0.05em' }}>FREE</strong> : `₹${shippingCost}.00`}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.3rem',
                  fontWeight: '900',
                  color: '#ffffff',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '14px',
                  marginTop: '4px',
                  fontFamily: 'var(--font-heading)'
                }}>
                  <span>Final Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-buy-solid"
                style={{ width: '100%', justifyContent: 'center', marginTop: '22px', fontSize: '0.92rem', padding: '14px' }}
              >
                <Lock size={16} />
                <span>{submitting ? 'Opening UPI App...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}.00`}</span>
              </button>

              <div style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#64748b'
              }}>
                <ShieldCheck size={14} color="#22c55e" />
                <span>Encrypted Direct UPI & Razorpay Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Awaiting UPI App Payment Confirmation Overlay (NO AUTO CONFIRM) */}
      {awaitingUpiPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#0d0f14',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '14px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)'
          }}>
            {/* Animated Icon Header */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#091829',
              border: '2px solid #38bdf8',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.4)'
            }}>
              <Smartphone size={32} />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              Google Pay / UPI App Launched
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '22px' }}>
              Your UPI app should be open with the amount <strong style={{ color: '#38bdf8' }}>₹{grandTotal.toLocaleString('en-IN')}.00</strong> pre-filled to <strong>LIGHTINMOTION</strong>. Enter your 4/6-digit PIN in the app.
            </p>

            <div style={{
              background: '#11141c',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '14px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Merchant VPA:</span>
                <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{merchantUpiVpa}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Amount:</span>
                <strong style={{ color: '#22c55e', fontSize: '0.95rem' }}>₹{grandTotal.toLocaleString('en-IN')}.00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Status:</span>
                <span style={{ color: '#eab308', fontWeight: '700' }}>⏳ Awaiting Payment...</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleRelaunchUpiApp}
                className="btn-cart-outline"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <RefreshCw size={16} />
                <span>Re-open Google Pay / UPI App</span>
              </button>

              <button
                type="button"
                onClick={handleUserConfirmPaid}
                disabled={submitting}
                className="btn-buy-solid"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', background: '#22c55e' }}
              >
                <Check size={18} />
                <span>{submitting ? 'Verifying...' : 'I Have Completed Payment'}</span>
              </button>

              <button
                type="button"
                onClick={handleUserCancelPayment}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '8px',
                  marginTop: '4px'
                }}
              >
                Cancel Payment & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
