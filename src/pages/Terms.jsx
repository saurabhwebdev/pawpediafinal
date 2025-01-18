import { Helmet } from 'react-helmet-async'

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - PawPedia</title>
        <meta name="description" content="Read PawPedia's terms of service and learn about the rules and guidelines for using our website." />
      </Helmet>

      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="mx-auto max-w-3xl mt-10 prose dark:prose-invert">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using PawPedia, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h2>2. Intellectual Property Rights</h2>
            <p>
              The content on PawPedia, including text, images, logos, and other material, is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
            </p>

            <h2>3. User Content</h2>
            <p>
              When you submit content to our website, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute that content.
            </p>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users' access to the website</li>
              <li>Upload malicious code or harmful content</li>
              <li>Impersonate others or provide false information</li>
            </ul>

            <h2>5. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the content or practices of these websites.
            </p>

            <h2>6. Disclaimer of Warranties</h2>
            <p>
              PawPedia is provided "as is" without any warranties, express or implied. We do not guarantee the accuracy, completeness, or reliability of any content.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the website after such changes constitutes acceptance of the new terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@pawpedia.com</li>
              <li>Address: [Your Address]</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
} 