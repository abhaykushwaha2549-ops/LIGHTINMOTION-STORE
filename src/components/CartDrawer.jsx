// src/components/CartDrawer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Cart Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#38bdf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Your Cart</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>({cart.length} items)</span>
          </div>
          <button className="icon-btn" onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{
          padding: '12px 24px',
          background: '#14141c',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            {remainingForFreeShipping === 0 ? (
              <span style={{ color: '#34d399', fontWeight: '600' }}>🎉 You have qualified for FREE SHIPPING!</span>
            ) : (
              <span style={{ color: '#cbd5e1' }}>
                Add <strong style={{ color: '#ffffff' }}>₹{remainingForFreeShipping.toFixed(0)}</strong> more to get <strong>FREE SHIPPING</strong>
              </span>
            )}
          </div>
          <div style={{
            width: '100%',
            height: '5px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <ShoppingBag size={48} strokeWidth={1.5} />
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>Your cart is empty</h4>
                <p style={{ fontSize: '0.85rem' }}>Looks like you haven't added any ambient lighting gear yet.</p>
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: '10px' }}
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const primaryMedia = item.product.media?.[0]?.url || 'https://via.placeholder.com/150';
              return (
                <div key={item.cartItemId} className="cart-item">
                  <img src={primaryMedia} alt={item.product.title} className="cart-item-thumb" />
                  
                  <div className="cart-item-info">
                    <div>
                      <h4 className="cart-item-title">{item.product.title}</h4>
                      {item.selectedOptions?.color && (
                        <div className="cart-item-meta">Color: {item.selectedOptions.color}</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="quantity-control" style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-input">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="cart-item-price">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="icon-btn"
                          style={{ color: '#ef4444', padding: '4px' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}.00</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Taxes and shipping calculated at checkout
            </p>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleProceedToCheckout}>
              <span>Checkout Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
