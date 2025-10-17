'use client'
import React from 'react'

export default function Contact() {
  return (
    <div className="footer-page">
      <div
        className="container py-5"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.7',
        }}
      >
        <h1 className="mb-4">Contact Us</h1>
        <p>
          If you have any questions, feedback, or concerns regarding our services,
          policies, or this website, please reach out to us using the details below.
          Our team will be happy to assist you.
        </p>

        <h4 className="mt-4">Office Address</h4>
        <address style={{ marginBottom: '1rem' }}>
          Office No. 106, Excellaa Plazzo,<br />
          Near Mumbai Hwy, Ambegaon BK,<br />
          Pune, Maharashtra 411046, India
        </address>

        <h4>Phone</h4>
        <p>+91 915 828 7488</p>

        <h4>Email</h4>
        <p>
          <a href="mailto:contact@coinage.in">contact@coinage.in</a>
        </p>

        <p
          className="text-muted"
          style={{
            marginTop: '20px',
            fontSize: '0.9rem',
            fontStyle: 'italic',
          }}
        >
          For business or partnership inquiries, please include your organization details
          in the email subject for faster processing.
        </p>
      </div>
    </div>
  )
}
