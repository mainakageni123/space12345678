import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../components/ui/Header';
import Footer from '../components/Footer.jsx';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Privacy Policy - SpaceBorne Premium Mobility</title>
        <meta 
          name="description" 
          content="Privacy Policy and compliance details for SpaceBorne LTD. Learn about your rights under the Kenya Data Protection Act 2019." 
        />
      </Helmet>

      <div className="min-h-screen bg-cosmic-depth text-cosmic-silver flex flex-col justify-between">
        <Header />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex-grow">
          <div className="max-w-4xl mx-auto">
            {/* Header section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-5xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-stellar-gold via-white to-stellar-gold">
                Privacy Policy
              </h1>
              <p className="text-sm text-cosmic-silver/60">
                Last Updated: June 2026 | Compliant with the Kenya Data Protection Act 2019
              </p>
            </div>

            {/* Glassmorphism content container */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-10 shadow-cosmic space-y-8 leading-relaxed">
              
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  1. Overview
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  Welcome to SpaceBorne LTD. We are committed to protecting your personal data and respecting your privacy. 
                  This Privacy Policy explains how we collect, use, store, and protect your information when you utilize our premium car rental, 
                  adventure packages, and private PSV booking services in Kenya.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  2. Personal Data We Collect
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  We collect information necessary to deliver exceptional mobility services, including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-cosmic-silver/70 text-sm">
                  <li><strong>Personal Identity Info:</strong> Full names, Date of Birth, National ID / Passport numbers, and Driving License details.</li>
                  <li><strong>Contact Information:</strong> Phone numbers (used for communication and M-Pesa billing) and Email addresses.</li>
                  <li><strong>Booking Details:</strong> Selected vehicles, adventure choices, trip itineraries, rental durations, and pickup/drop-off locations.</li>
                  <li><strong>Financial Data:</strong> M-Pesa transaction records, payment statuses, and reference IDs (processed securely through KCB Buni).</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  3. Purpose of Collection & Legal Basis
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  We process your data strictly under the guidelines of the <strong>Kenya Data Protection Act 2019</strong>. The collection is based on:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-cosmic-silver/70 text-sm">
                  <li><strong>Performance of Contract:</strong> To reserve, approve, and finalize your vehicle or adventure booking.</li>
                  <li><strong>Consent:</strong> To verify your driver eligibility and initiate Safaricom M-Pesa payment prompts via the KCB gateway.</li>
                  <li><strong>Legal Compliance:</strong> To maintain tax, financial, and vehicle-use logs as required by Kenyan authorities.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  4. Data Sharing & Third-Party Processors
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  SpaceBorne LTD does not sell, rent, or lease your private data. Your data is shared exclusively with:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-cosmic-silver/70 text-sm">
                  <li><strong>KCB Buni API:</strong> To securely initiate M-Pesa STK push transactions on your registered mobile device.</li>
                  <li><strong>Regulatory & Law Enforcement:</strong> Only when legally compelled by court orders or statutory government mandates in Kenya.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  5. Data Retention & Preservation
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  We adhere to strict data minimization principles. Booking contracts, transaction histories, and legal records are retained for a 
                  maximum period of <strong>7 years</strong> (in compliance with Kenya tax laws and financial regulations). After this timeframe, 
                  all completed customer records are systematically purged from our databases.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  6. Your Rights (Kenya DPA 2019)
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  Under the Kenya Data Protection Act, you possess the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-cosmic-silver/70 text-sm">
                  <li>The right to be informed about how we process your personal data.</li>
                  <li>The right of access to copy or view your stored profile details.</li>
                  <li>The right to object to processing, or request correction and rectification.</li>
                  <li>The right to request the deletion or erasure of your data (subject to tax audit retention constraints).</li>
                </ul>
              </section>

              <section className="space-y-3 border-t border-white/10 pt-6">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stellar-gold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-stellar-gold rounded-full inline-block"></span>
                  7. Contact Information
                </h2>
                <p className="text-cosmic-silver/80 text-sm sm:text-base">
                  To exercise any of your data rights or report a privacy concern, please contact our Data Protection Officer:
                </p>
                <p className="text-stellar-gold text-sm sm:text-base font-medium mt-1">
                  Email: <a href="mailto:spaceborneltd@gmail.com" className="underline">spaceborneltd@gmail.com</a>
                </p>
                <p className="text-cosmic-silver/60 text-xs sm:text-sm mt-2">
                  SpaceBorne LTD, Machakos, Kenya
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
