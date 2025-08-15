import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { config } from "@/lib/config" 

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#111111" }}>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:py-16 flex-grow">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Terms of Service</h1>
        <div className="max-w-3xl mx-auto text-gray-300 space-y-4 text-sm sm:text-base">
          <p>
            Welcome to {config.platform.name}! These Terms of Service ("Terms") govern your use of the {config.platform.name} website and services.
            By accessing or using our platform, you agree to comply with and be bound by these Terms, as well as the laws
            and regulations of {config.platform.name}'s country of origin.
          </p>
          <p>
            {config.platform.name} is a private platform operating under the laws and jurisdiction of its country of origin. No external
            party—whether individual, organization, or governmental body from outside our jurisdiction—may interfere in any
            decision, operation, or policy of {config.platform.name}. All matters related to the platform are handled solely by {config.platform.name} and
            are not subject to external influence.
          </p>
          <p>
            You must be at least 13 years old to use {config.platform.name}. By using the service, you represent and warrant that you
            meet this age requirement.
          </p>
          <p>
            {config.platform.name} acts solely as a platform provider, allowing users to upload and share videos easily and practically,
            such as educational content and other lawful materials. All activities, content, and communications made
            through {config.platform.name} are entirely the responsibility of the respective users.
          </p>
          <p>
            Any form of legal violation—including but not limited to criminal acts, copyright infringement, defamation,
            fraud, or other unlawful activities—is the sole responsibility of the user. Additionally, any moral or religious
            violations (including acts considered sinful under certain religious beliefs) are also entirely the responsibility
            of the user. {config.platform.name} is not liable for, does not endorse, and will not be held accountable for any such actions.
          </p>
          <p>
            {config.platform.name} retains full rights to manage, modify, or remove any content, feature, or account within the platform at
            its sole discretion, without prior notice. Users must comply with all rules, policies, and decisions set by {config.platform.name},
            and continued use of the platform constitutes agreement to follow these rules at all times.
          </p>
          <p>
            Users agree not to upload, share, or engage in any activity that breaches laws, infringes on intellectual
            property rights, violates moral or religious standards, or harms others. Content violating these Terms may be
            removed, and accounts involved may be suspended or terminated without notice.
          </p>
          <p>
            {config.platform.name} is provided "as is" without any warranties, express or implied. We do not guarantee that the service will
            be uninterrupted, error-free, or secure. We are not responsible for any damages, losses, or disputes arising from
            user activities or content.
          </p>
          <p>
            Users are responsible for ensuring that their use of {config.platform.name} complies with both the laws of their own country and
            the regulations of {config.platform.name}'s country of origin.
          </p>
          <p>
            All decisions made by {config.platform.name} are final and binding, and are not subject to negotiation or external arbitration.
          </p>
          <p>
            We may update these Terms from time to time. Updates will be posted on this page, and continued use of the
            service after changes constitutes acceptance of the new Terms.
          </p>
          <p>
            If you have any questions about these Terms, please contact us.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
