'use client'
import React from 'react'

export default function ShippingDelivery() {
  return (
    <div className="footer-page">
      <div
        className="container py-5"
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <h1 className="mb-4">Shipping & Delivery Policy</h1>
        <p><strong>Last updated on May 21st 2025</strong></p>

        <p className="mt-3">
          Shipping is not applicable for our business as we do not deal in any
          physical goods. All our services are delivered digitally through our
          application platform.
        </p>

        <p className="mt-4 text-muted" style={{ fontSize: '0.9rem' }}>
          <strong>Disclaimer:</strong> The above content is created at Coinage
          Software Private Limited's sole discretion. Razorpay shall not be
          liable for any content provided here and shall not be responsible for
          any claims and liability that may arise due to the merchant’s
          non-adherence to it.
        </p>
      </div>
    </div>
  )
}
