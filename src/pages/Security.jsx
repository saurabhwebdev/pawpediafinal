import { Helmet } from 'react-helmet-async'
import { ShieldCheckIcon, LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline'

export default function Security() {
  return (
    <>
      <Helmet>
        <title>Security - PawPedia</title>
        <meta name="description" content="Learn about PawPedia's security measures and how we protect your data and privacy." />
      </Helmet>

      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Security at PawPedia</h1>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Your security and privacy are our top priorities. Learn about the measures we take to protect your data.
            </p>
          </div>

          <div className="mx-auto max-w-7xl mt-16">
            <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-3 lg:gap-x-8">
              <div className="relative flex flex-col gap-6 sm:flex-row lg:flex-col lg:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <ShieldCheckIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">Data Protection</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                    We employ industry-standard encryption protocols to protect your personal information during transmission and storage.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row lg:flex-col lg:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <LockClosedIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">Secure Infrastructure</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                    Our infrastructure is monitored 24/7 and regularly updated to protect against the latest security threats.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-col gap-6 sm:flex-row lg:flex-col lg:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
                  <KeyIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="sm:min-w-0 sm:flex-1">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">Access Control</h3>
                  <p className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                    We implement strict access controls and authentication measures to prevent unauthorized access to your data.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-3xl mt-16 prose dark:prose-invert">
              <h2>Our Security Practices</h2>
              <p>
                At PawPedia, we implement comprehensive security measures to protect your information:
              </p>
              <ul>
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure data backup and disaster recovery procedures</li>
                <li>Employee security training and awareness programs</li>
                <li>Compliance with industry security standards</li>
              </ul>

              <h2>Reporting Security Issues</h2>
              <p>
                If you discover a security vulnerability or have concerns about our security practices, please contact our security team immediately at security@pawpedia.com.
              </p>

              <h2>Continuous Improvement</h2>
              <p>
                We continuously monitor and improve our security measures to ensure the highest level of protection for our users. Our security practices are regularly reviewed and updated to address new threats and vulnerabilities.
              </p>

              <h2>Security Recommendations</h2>
              <p>To help protect your account, we recommend:</p>
              <ul>
                <li>Using strong, unique passwords</li>
                <li>Enabling two-factor authentication when available</li>
                <li>Keeping your devices and browsers updated</li>
                <li>Being cautious of phishing attempts</li>
                <li>Regularly reviewing your account activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 