"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { StoredOrder as OrderData } from '@/lib/orderStore';

interface FormData {
  name: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  pincode: string;
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ConfirmOrderContent />
    </Suspense>
  );
}

function ConfirmOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    const token = searchParams.get('id');
    if (!token) {
      setError('Invalid or expired link');
      setLoading(false);
      return;
    }

    fetchOrderData(token);
  }, [searchParams]);

  const fetchOrderData = async (token: string) => {
    try {
      const response = await fetch(`/api/get-order?id=${token}`, {
        cache: 'no-store'
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch order data');
      }

      setOrderData(result.data);
      // Prefill form with customer data
      setFormData({
        name: result.data.customer_name,
        phone: result.data.phone,
        altPhone: '',
        address: result.data.address,
        city: result.data.city,
        pincode: result.data.pincode
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Determine if prefilled fields were changed (excluding altPhone)
      const prefilledFields = ['name', 'phone', 'address', 'city', 'pincode'];
      let changed = false;
      if (orderData) {
        for (const field of prefilledFields) {
          // Map form field to flat orderData field
          let orderField: keyof OrderData = field === 'name' ? 'customer_name'
            : field === 'phone' ? 'phone'
            : field === 'address' ? 'address'
            : field === 'city' ? 'city'
            : field === 'pincode' ? 'pincode'
            : field as keyof OrderData;
          if (formData[field as keyof FormData] !== orderData[orderField]) {
            changed = true;
            break;
          }
        }
      }
      const prefilled = changed ? 'changed' : 'unchanged';

const webhookData = {
  orderId: orderData?.order_id,              // ✅ Supabase order_id
  shopifyOrderId: orderData?.shopify_id,     // ✅ Add THIS
  customer: formData,
  items: orderData?.items,
  finalAmount: orderData?.final_amount,
  status: 'confirm',
  prefilled
};


      const response = await fetch('https://rushil-bhor.app.n8n.cloud/webhook/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      await fetch('/api/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ checkout_token: orderData!.checkout_token })
});

if (response.ok) {
  router.push('/success');
} else {
  throw new Error('Failed to confirm order');
}

} catch (err) {
  alert('Failed to confirm order. Please try again.');
} finally {
  setSubmitting(false);
}
};

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !orderData) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-subdued)' }}>
      <div style={{ maxWidth: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* u.Roots Header */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface-primary)',
            color: 'var(--color-text-on-primary)',
            padding: 'var(--space-6) var(--space-5)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: 'var(--shadow-base)'
          }}
        >
            <div className="brand-header-inner">
              {/* u.Roots Logo */}
              <img 
                src="/yrsfxhgcjhv.svg" 
                alt="u.Roots logo"
                className="brand-logo"
              />
              <div className="brand-title-wrap">
                <h1 className="brand-title">Confirm your order</h1>
                <p className="brand-subtitle">Order #{orderData!.order_id}</p>
              </div>
            </div>
        </div>

  {/* Main Content - simplified to only Order Summary (payment mode + total) */}
  <div style={{ flex: 1, padding: 'var(--space-0)' }}>
          <form onSubmit={handleSubmit} className="stack-loose" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="shopify-card">
              <div className="shopify-card-section">
                <h2 className="text-heading-xl" style={{ marginBottom: 'var(--space-2)', lineHeight: 1.05 }}>Order summary</h2>
                <div className="stack">
                  <div>
                    <p className="text-heading-md text-subdued" style={{ marginBottom: 'var(--space-1)' }}>Payment Mode</p>
                    <p className="text-heading-lg" style={{ fontWeight: 700, marginBottom: 'var(--space-2)', fontSize: '1.05rem', lineHeight: 1.08 }}>Cash on Delivery</p>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <div 
                    className="inline-stack" 
                    style={{ 
                      justifyContent: 'space-between', 
                      
                    }}
                  >
                    <span className="text-heading-md text-subdued">Total</span>
                    <span className="text-heading-xl" style={{ fontWeight: 800, fontSize: '1.35rem' }}>₹{orderData?.final_amount ? orderData.final_amount.toLocaleString() : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information Card */}
            <div className="shopify-card">
              <div className="shopify-card-section">
                <h2 className="text-heading-md" style={{ marginBottom: 'var(--space-5)' }}>Delivery information</h2>
                
                <div className="stack">
                  <div>
                    <label htmlFor="name" className="shopify-label">
                      Full name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="shopify-input"
                      placeholder="Full name"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="shopify-label">
                      Phone number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="shopify-input"
                      placeholder="10-digit mobile number"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="altPhone" className="shopify-label">
                      Alternative phone number *
                    </label>
                    <input
                      type="tel"
                      id="altPhone"
                      value={formData.altPhone}
                      onChange={(e) => handleInputChange('altPhone', e.target.value)}
                      className="shopify-input"
                      placeholder="Alternate mobile number"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="shopify-label">
                      Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="shopify-input"
                      placeholder="House no, street, locality"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div className="inline-stack mobile-keep-inline" style={{ gap: 'var(--space-3)' }}>
                    <div style={{ flex: 2 }}>
                      <label htmlFor="city" className="shopify-label">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="shopify-input"
                        placeholder="City"
                        required
                        aria-required="true"
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label htmlFor="pincode" className="shopify-label">
                        PIN code *
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="shopify-input"
                        placeholder="PIN code"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Sticky at bottom for mobile */}
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'transparent',
                zIndex: 20,
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--space-2) 0 calc(env(safe-area-inset-bottom))'
              }}
            >
              <div style={{
                width: '100%',
                maxWidth: '720px',
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--space-3) var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom))',
                borderTop: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '10px 10px 6px 6px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="shopify-button"
                  style={{
                    minHeight: '64px',
                    width: '100%',
                    fontSize: '18px',
                    fontWeight: '700',
                    backgroundColor: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{
                    opacity: submitting ? 0 : 1,
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    position: 'relative',
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s'
                  }}>
                    Confirm Order
                  </span>
                  {submitting && (
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      background: 'transparent'
                    }}>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      <span style={{ marginLeft: 10 }}>Confirming order...</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-subdued)' }}>
      <div style={{ maxWidth: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* u.Roots Header Skeleton */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface-primary)',
            color: 'var(--color-text-on-primary)',
            padding: 'var(--space-6) var(--space-5)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: 'var(--shadow-base)'
          }}
        >
          
            <div className="brand-header-inner">
              {/* u.Roots Logo placeholder */}
              <div className="skeleton" style={{ height: 'clamp(24px, 5vw, 40px)', width: 'clamp(24px, 5vw, 40px)', borderRadius: 'var(--border-radius-base)' }}></div>
              <div className="brand-title-wrap" style={{ width: '100%' }}>
                <div style={{ height: 'clamp(16px, 4vw, 24px)', width: '60%', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 'var(--border-radius-base)' }}></div>
                <div style={{ height: 'clamp(12px, 3vw, 18px)', width: '40%', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 'var(--border-radius-base)' }}></div>
              </div>
            </div>
        </div>

        <div style={{ flex: 1, padding: 'var(--space-4)' }}>
          <div className="stack-loose">
            {/* Order Summary Skeleton */}
            <div className="shopify-card">
              <div className="shopify-card-section">
                <div className="skeleton" style={{ height: '24px', width: '140px', marginBottom: 'var(--space-5)' }}></div>
                
                <div className="stack">
                  <div className="skeleton" style={{ height: '24px', width: '140px', marginBottom: 'var(--space-4)' }}></div>
                  <div className="skeleton" style={{ height: '16px', width: '120px', marginBottom: 'var(--space-2)' }}></div>
                </div>

                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <div className="stack-tight">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="inline-stack" style={{ justifyContent: 'space-between' }}>
                        <div className="skeleton" style={{ height: '16px', width: '80px' }}></div>
                        <div className="skeleton" style={{ height: '16px', width: '60px' }}></div>
                      </div>
                    ))}
                  </div>
                  <div 
                    className="inline-stack" 
                    style={{ 
                      justifyContent: 'space-between', 
                      marginTop: 'var(--space-4)', 
                      paddingTop: 'var(--space-3)', 
                      borderTop: '1px solid var(--color-border)' 
                    }}
                  >
                    <div className="skeleton" style={{ height: '20px', width: '60px' }}></div>
                    <div className="skeleton" style={{ height: '20px', width: '80px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Skeleton */}
            <div className="shopify-card">
              <div className="shopify-card-section">
                <div className="skeleton" style={{ height: '24px', width: '160px', marginBottom: 'var(--space-5)' }}></div>
                
                <div className="stack">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="skeleton" style={{ height: '20px', width: '100px', marginBottom: 'var(--space-1)' }}></div>
                      <div className="skeleton" style={{ height: '44px', width: '100%' }}></div>
                    </div>
                  ))}

                  {/* Alternative phone skeleton */}
                  <div>
                    <div className="skeleton" style={{ height: '20px', width: '140px', marginBottom: 'var(--space-1)' }}></div>
                    <div className="skeleton" style={{ height: '44px', width: '100%' }}></div>
                  </div>
                  
                  <div className="inline-stack" style={{ gap: 'var(--space-3)' }}>
                    <div style={{ flex: 2 }}>
                      <div className="skeleton" style={{ height: '20px', width: '60px', marginBottom: 'var(--space-1)' }}></div>
                      <div className="skeleton" style={{ height: '44px', width: '100%' }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: '20px', width: '80px', marginBottom: 'var(--space-1)' }}></div>
                      <div className="skeleton" style={{ height: '44px', width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Button Skeleton */}
            <div style={{ paddingTop: 'var(--space-2)' }}>
              <div className="skeleton" style={{ height: '64px', width: '100%', borderRadius: 'var(--border-radius-base)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-subdued)' }}>
      <div style={{ maxWidth: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* u.Roots Header */}
        <div 
          style={{ 
            backgroundColor: 'var(--color-surface-primary)',
            color: 'var(--color-text-on-primary)',
            padding: 'var(--space-6) var(--space-5)',
            textAlign: 'center'
          }}
        >
          <img src="/yrsfxhgcjhv.svg" alt="u.Roots logo" height={100} style={{ height: 100 }} />
        </div>

        {/* Error Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-5)' }}>
          <div className="shopify-card" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="shopify-card-section" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  margin: '0 auto var(--space-6)', 
                  backgroundColor: '#fef2f2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              
              <div className="stack-tight" style={{ marginBottom: 'var(--space-6)' }}>
                <h1 className="text-heading-lg">
                  {error || 'Invalid or expired link'}
                </h1>
                <p className="text-body-md text-subdued">
                  The order confirmation link you followed is no longer valid or has expired. Please check your link and try again.
                </p>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="shopify-button"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  maxWidth: '160px'
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}