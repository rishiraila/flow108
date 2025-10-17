'use client'
import React from 'react'

export default function Terms() {
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
        <h1 className="mb-4">Terms & Conditions</h1>
        <p><strong>Last updated on May 21st, 2025</strong></p>

        <p>
          Welcome to <strong>Flow108</strong>! These Terms and Conditions ("Terms") govern your access to and use of our
          mobile application, website, and related health and wellness services operated by
          <strong> Flow108 Health Technologies Pvt. Ltd.</strong> ("we," "us," or "our").
          By accessing or using Flow108, you agree to be bound by these Terms. Please read them carefully before using our services.
        </p>

        <h4 className="mt-4">1. Acceptance of Terms</h4>
        <p>
          By downloading, installing, or using the Flow108 application or website, you acknowledge that you have read,
          understood, and agree to comply with these Terms and our Privacy Policy. If you do not agree, please discontinue use immediately.
        </p>

        <h4 className="mt-4">2. Services Overview</h4>
        <p>
          Flow108 provides digital tools for health tracking, fitness guidance, diet management, and wellness insights.
          The app may include features for monitoring activities such as diet, exercise, and menstrual cycle tracking.
          These services are intended for general wellness purposes and are <strong>not a substitute for professional medical advice, diagnosis, or treatment.</strong>
        </p>

        <h4 className="mt-4">3. Eligibility</h4>
        <p>
          You must be at least 13 years of age to use the Flow108 application. If you are under 18, you may use the app only under the supervision of a parent or legal guardian.
        </p>

        <h4 className="mt-4">4. User Responsibilities</h4>
        <ul>
          <li>You agree to provide accurate and current information during registration.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
          <li>You agree not to misuse the app, attempt unauthorized access, or disrupt its functionality.</li>
          <li>You are responsible for any data or content you submit within the app, including health inputs and diary entries.</li>
        </ul>

        <h4 className="mt-4">5. Intellectual Property</h4>
        <p>
          All content, design, layout, graphics, logos, and software used in the Flow108 application are the property of
          Flow108 Health Technologies Pvt. Ltd. or its licensors. Reproduction, distribution, or modification without prior written consent is prohibited.
        </p>

        <h4 className="mt-4">6. Limitation of Liability</h4>
        <p>
          We strive to provide accurate and reliable health information; however, Flow108 does not guarantee the accuracy,
          completeness, or reliability of any data, insights, or recommendations generated within the app. You acknowledge
          that any actions taken based on app content are done at your own risk. Flow108 shall not be held liable for any
          direct, indirect, or consequential damages resulting from your use of the app.
        </p>

        <h4 className="mt-4">7. Health Disclaimer</h4>
        <p>
          The information provided in Flow108 is for general wellness and educational purposes only and should not be
          considered medical advice. Always consult a qualified healthcare professional before making any health-related decisions.
        </p>

        <h4 className="mt-4">8. Third-Party Links and Integrations</h4>
        <p>
          The Flow108 app or website may contain links to third-party websites or integrate third-party tools or APIs
          (e.g., Razorpay for payments). These links are provided for convenience only, and we are not responsible for
          the content, accuracy, or policies of external sites or services.
        </p>

        <h4 className="mt-4">9. Payments and Subscriptions</h4>
        <p>
          Certain features or services within Flow108 may require payment. All payments processed through third-party gateways such as Razorpay
          are subject to their respective terms and policies. We are not liable for any transaction failure, declined authorization, or refund processing delay.
        </p>

        <h4 className="mt-4">10. Termination</h4>
        <p>
          We reserve the right to suspend or terminate your account at any time, without prior notice, for violation of these Terms or any illegal or harmful activity.
        </p>

        <h4 className="mt-4">11. Governing Law</h4>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India.
          Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.
        </p>

        <h4 className="mt-4">12. Changes to These Terms</h4>
        <p>
          We may update or modify these Terms from time to time. Any changes will be posted within the app or on our website,
          and continued use after updates constitutes your acceptance of the revised Terms.
        </p>

        <p
          className="text-muted"
          style={{
            marginTop: '20px',
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}
        >
          Disclaimer: The above content is created at Flow108 Health Technologies Pvt. Ltd.’s sole discretion.
          Razorpay or any third-party service provider shall not be responsible for any claims or liabilities
          arising from the merchant’s non-adherence to these terms.
        </p>
      </div>
    </div>
  )
}
