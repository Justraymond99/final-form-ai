import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Agreement to Terms</h2>
            <p className="text-foreground/90 leading-relaxed">
              By accessing or using Final Form (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Description of Service</h2>
            <p className="text-foreground/90 leading-relaxed">
              Final Form is a fitness tracking and planning application that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>AI-powered workout generation and planning</li>
              <li>Nutrition tracking and meal planning</li>
              <li>Progress tracking and analytics</li>
              <li>Exercise library and instructions</li>
              <li>Goal setting and achievement tracking</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">User Accounts</h2>
            <div className="space-y-3">
              <p className="text-foreground/90 leading-relaxed">
                When you create an account with us, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be at least 13 years of age (or have parental consent)</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Health and Medical Disclaimer</h2>
            <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg space-y-2">
              <p className="text-foreground font-semibold">IMPORTANT HEALTH NOTICE:</p>
              <p className="text-foreground/90 leading-relaxed">
                Final Form is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before beginning any new exercise or nutrition program.
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>We are not medical professionals</li>
                <li>Our AI recommendations are for informational purposes only</li>
                <li>You assume all risks associated with exercise and nutrition changes</li>
                <li>Consult your doctor if you have any health concerns</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Acceptable Use</h2>
            <p className="text-foreground/90 leading-relaxed">
              You agree NOT to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for commercial purposes without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Subscription and Payments</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-medium">Premium Features</h3>
              <p className="text-foreground/90 leading-relaxed">
                Some features require a paid subscription. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>Pay all fees associated with your subscription</li>
                <li>Automatic renewal unless cancelled at least 24 hours before the end of the current period</li>
                <li>No refunds for partial subscription periods</li>
                <li>Price changes with 30 days notice</li>
              </ul>

              <h3 className="text-xl font-medium">Apple App Store Subscriptions</h3>
              <p className="text-foreground/90 leading-relaxed">
                For subscriptions purchased through the Apple App Store:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>Payment will be charged to your Apple ID account at confirmation of purchase</li>
                <li>Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period</li>
                <li>Your account will be charged for renewal within 24 hours prior to the end of the current period</li>
                <li>You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase</li>
                <li>Any unused portion of a free trial period will be forfeited when you purchase a subscription</li>
              </ul>

              <h3 className="text-xl font-medium">Cancellation</h3>
              <p className="text-foreground/90 leading-relaxed">
                You may cancel your subscription at any time through your Apple ID account settings. Cancellation takes effect at the end of the current billing period. To cancel, go to Settings → [Your Name] → Subscriptions on your iOS device.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Intellectual Property</h2>
            <p className="text-foreground/90 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Final Form and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              You retain ownership of content you create (workouts, photos, notes), but grant us a license to use, store, and display this content to provide the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-foreground/90 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FINAL FORM SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>Injuries or health issues arising from exercise or nutrition changes</li>
                <li>Data loss or service interruptions</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, revenue, or business opportunities</li>
              </ul>
              <p className="text-foreground/90 leading-relaxed mt-3">
                Our total liability shall not exceed the amount you paid for the Service in the last 12 months.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Indemnification</h2>
            <p className="text-foreground/90 leading-relaxed">
              You agree to indemnify and hold Final Form harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Service Availability</h2>
            <p className="text-foreground/90 leading-relaxed">
              We strive to provide reliable service but do not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Uninterrupted or error-free operation</li>
              <li>Compatibility with all devices</li>
              <li>Specific uptime percentages</li>
              <li>Continued availability of any feature</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Termination</h2>
            <p className="text-foreground/90 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>At our sole discretion for any reason</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p className="text-foreground/90 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Governing Law</h2>
            <p className="text-foreground/90 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p className="text-foreground/90 leading-relaxed">
              For questions about these Terms, please contact:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-foreground/90">Email: legal@finalform.app</p>
              <p className="text-foreground/90">Support: support@finalform.app</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Severability</h2>
            <p className="text-foreground/90 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
