import { Helmet } from 'react-helmet-async'

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - PawPedia</title>
        <meta name="description" content="Learn about PawPedia's privacy policy, how we collect, use, and protect your personal information." />
      </Helmet>

      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="mx-auto max-w-3xl mt-10 prose dark:prose-invert">
            <h2>Introduction</h2>
            <p>
              At PawPedia, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            <h2>Information We Collect</h2>
            <h3>Information You Provide</h3>
            <p>
              We may collect information that you voluntarily provide when using our website, including:
            </p>
            <ul>
              <li>Contact information (email address)</li>
              <li>User preferences and settings</li>
              <li>Feedback and correspondence</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>
              When you visit our website, we automatically collect certain information, including:
            </p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (pages visited, time spent)</li>
              <li>IP address and location data</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the collected information for various purposes:</p>
            <ul>
              <li>Provide and maintain our website</li>
              <li>Improve user experience</li>
              <li>Analyze usage patterns</li>
              <li>Send administrative information</li>
              <li>Respond to user inquiries</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              We may use third-party services that collect, monitor, and analyze data. These services have their own privacy policies.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@pawpedia.com</li>
              <li>Address: [Your Address]</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
} 