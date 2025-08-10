import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { config } from "@/lib/config"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen text-white" style={{ backgroundColor: "#111111" }}>
      <Header />
      <main className="container mx-auto px-4 py-8 sm:py-16 flex-grow">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
        <div className="max-w-3xl mx-auto text-gray-300 space-y-4 text-sm sm:text-base">
          <p>
            {config.platform.name} operates in accordance with the laws and regulations of its country of origin.
            By accessing and using our website or services, you agree to comply with these laws and
            any applicable regulations set forth by {config.platform.name}.
          </p>
          <p>
            We may collect basic information necessary to provide our services, such as account details
            or usage data. All information is handled in compliance with the legal requirements of our
            jurisdiction.
          </p>
          <p>
            {config.platform.name} only stores uploaded data on its servers. Any actions, activities, or content uploaded
            by users are solely the responsibility of the respective users. {config.platform.name} is not liable for any
            consequences, legal or otherwise, arising from user actions or content. Our role is limited
            to providing a simple and practical platform for uploading videos—such as educational videos
            and similar lawful content.
          </p>
          <p>
            Visitors are solely responsible for ensuring that their use of {config.platform.name} does not violate the
            laws of their own country. Any actions or content that breach our rules or local laws may
            result in removal or account termination.
          </p>
          <p>
            By continuing to use {config.platform.name}, you acknowledge that you have read, understood, and agree to
            this Privacy Policy and to abide by the applicable laws and regulations.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
