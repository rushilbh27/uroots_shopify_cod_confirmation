"use client";
export default function SuccessPage() {
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
          <img
            src="/yrsfxhgcjhv.svg"
            alt="u.Roots logo"
            className="brand-logo"
            style={{ width: 'auto' }}
          />
        </div>

        {/* Success Content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
          <div className="shopify-card" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="shopify-card-section" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              {/* Success Icon with Animation */}
              <div 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto var(--space-6)', 
                  backgroundColor: 'rgba(125, 132, 113, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round">
                    <animate attributeName="stroke-dasharray" values="0 100;100 0" dur="0.6s" fill="freeze"/>
                    <animate attributeName="stroke-dashoffset" values="0;-100" dur="0.6s" fill="freeze"/>
                  </polyline>
                </svg>
              </div>

              {/* Success Message */}
              <div className="stack" style={{ marginBottom: 'var(--space-8)' }}>
                <h1 className="text-heading-lg" style={{ fontSize: '24px', color: 'var(--color-primary)' }}>
                  Order Confirmed!
                </h1>
                
                <p className="text-body-lg text-subdued">
                  Thank you for choosing Uroots. We've successfully received your confirmation and will process your Cash on Delivery order shortly.
                </p>
              </div>

              
    
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
