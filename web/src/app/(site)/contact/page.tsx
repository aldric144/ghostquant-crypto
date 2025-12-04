'use client';

import React, { useState } from 'react';
import AuroraStream from '@/components/AuroraStream';
import StarfieldBackground from '@/components/StarfieldBackground';
import styles from './page.module.scss';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: 'general',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const faqs = [
    {
      question: 'How do I get started with GhostQuant?',
      answer: 'Start with a free 14-day trial of our Professional plan. No credit card required. Our team will help you get set up and integrated.',
    },
    {
      question: 'What is the typical implementation timeline?',
      answer: 'Most organizations are fully operational within 2-4 weeks. Enterprise and government deployments may take 4-8 weeks depending on compliance requirements.',
    },
    {
      question: 'Do you offer on-premise deployment?',
      answer: 'Yes, we offer on-premise and hybrid deployment options for Enterprise and Government customers with specific security or compliance requirements.',
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'All plans include email support. Professional plans include priority support. Enterprise and Government plans include 24/7 support with dedicated account managers.',
    },
    {
      question: 'Can I integrate GhostQuant with my existing systems?',
      answer: 'Yes, GhostQuant provides comprehensive REST APIs and webhooks for integration with your existing security, compliance, and intelligence systems.',
    },
    {
      question: 'What compliance certifications do you have?',
      answer: 'We maintain CJIS, NIST 800-53, SOC 2 Type II, ISO 27001 certifications and are pursuing FedRAMP authorization. See our Compliance page for details.',
    },
  ];

  return (
    <div className={styles.contactPage}>
      <StarfieldBackground />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Contact & Enterprise Access</h1>
            <p className={styles.heroSubtitle}>
              Get in touch with our team for demos, trials, and enterprise inquiries
            </p>
          </div>
        </div>
      </section>

      <AuroraStream />

      {/* Contact Form */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.formGrid}>
            <div className={styles.formColumn}>
              <h2 className={styles.formTitle}>Send Us a Message</h2>
              <p className={styles.formDescription}>
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Organization</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Inquiry Type *</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="demo">Request Demo</option>
                    <option value="enterprise">Enterprise Sales</option>
                    <option value="government">Government Access</option>
                    <option value="support">Technical Support</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    rows={6}
                    required
                  ></textarea>
                </div>

                <button type="submit" className={styles.formButton}>
                  Send Message
                </button>
              </form>
            </div>

            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Enterprise Access</h3>
                <p className={styles.infoDescription}>
                  For organizations requiring custom deployments, dedicated support, and enterprise-grade SLAs.
                </p>
                <a href="mailto:enterprise@ghostquant.io" className={styles.infoLink}>
                  enterprise@ghostquant.io
                </a>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Government Clearance</h3>
                <p className={styles.infoDescription}>
                  Federal, state, and local agencies requiring CJIS/FedRAMP compliance and classified data handling.
                </p>
                <a href="mailto:government@ghostquant.io" className={styles.infoLink}>
                  government@ghostquant.io
                </a>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Support Hours</h3>
                <p className={styles.infoDescription}>
                  Email support: 24/7 for all plans
                  <br />
                  Phone support: Business hours (M-F 9am-6pm EST)
                  <br />
                  Emergency support: 24/7 for Enterprise/Government
                </p>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Office Location</h3>
                <p className={styles.infoDescription}>
                  GhostQuant Intelligence
                  <br />
                  100 Intelligence Way
                  <br />
                  Washington, DC 20001
                  <br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p className={styles.sectionSubtitle}>
              Common questions about GhostQuant platform and services
            </p>
          </div>

          <div className={styles.faqGrid}>
            {faqs.map((faq, idx) => (
              <div key={idx} className={styles.faqCard}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
