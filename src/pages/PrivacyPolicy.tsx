import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: February 10, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Introduction</h2>
            <p className="text-foreground/90 leading-relaxed">
              Final Form ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fitness tracking application ("App") available on iOS, Android, and the web.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-medium">Personal Information</h3>
              <p className="text-foreground/90 leading-relaxed">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>Account information (email, password, name)</li>
                <li>Profile information (age, height, weight, fitness goals)</li>
                <li>Workout data (exercises, sets, reps, weights)</li>
                <li>Nutrition data (meals, calories, macros)</li>
                <li>Progress photos and body measurements</li>
                <li>Health and activity data (including Apple Health data, if you grant access)</li>
                <li>Voice recordings (when using voice food logging, processed for transcription only)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-medium">Automatically Collected Information</h3>
              <p className="text-foreground/90 leading-relaxed">
                When you use our App, we may automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                <li>Device information (device type, operating system, unique device identifiers)</li>
                <li>Usage data (features used, time spent in app, crash reports)</li>
                <li>Performance and analytics data</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            <p className="text-foreground/90 leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Provide and maintain our services</li>
              <li>Generate personalized workout and nutrition plans using AI</li>
              <li>Track your fitness progress and achievements</li>
              <li>Process your voice input for food logging (audio is not stored after processing)</li>
              <li>Improve and optimize our App</li>
              <li>Send you updates and notifications (with your consent)</li>
              <li>Provide customer support</li>
              <li>Process payments and manage subscriptions</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
            <p className="text-foreground/90 leading-relaxed">
              We use the following third-party services to operate our App. Each has its own privacy policy governing the use of your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li><strong>Supabase:</strong> Cloud database and authentication services for storing your account and fitness data securely.</li>
              <li><strong>RevenueCat:</strong> Subscription and in-app purchase management for processing and managing your Premium subscriptions.</li>
              <li><strong>Google AI (Gemini):</strong> AI model used to generate personalized workout plans, nutrition recommendations, and chat responses. Your fitness profile data may be sent to this service for AI processing.</li>
              <li><strong>USDA FoodData Central:</strong> Nutritional database used for food search and calorie information.</li>
              <li><strong>Apple Health (HealthKit):</strong> With your explicit permission, we read and write health and workout data to Apple Health.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Sharing and Disclosure</h2>
            <p className="text-foreground/90 leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li><strong>With your consent:</strong> When you explicitly agree to share data</li>
              <li><strong>Service providers:</strong> Third-party services listed above that help us operate the App</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p className="text-foreground/90 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and updates</li>
              <li>Limited employee access to personal data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p className="text-foreground/90 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Retention</h2>
            <p className="text-foreground/90 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services. You can request deletion of your data at any time through your account settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Children's Privacy</h2>
            <p className="text-foreground/90 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
            <p className="text-foreground/90 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Health Data</h2>
            <p className="text-foreground/90 leading-relaxed">
              We treat all health and fitness data with the highest level of care. Health-related data collected through the App (including workout data, nutrition data, body measurements, and any data synced with Apple Health) is:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
              <li>Never sold to third parties, including advertising platforms or data brokers</li>
              <li>Never used for advertising or marketing purposes</li>
              <li>Only shared with third-party services strictly necessary to provide the App's functionality</li>
              <li>Encrypted in transit and at rest</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-foreground/90">Email: support@finalform.app</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
