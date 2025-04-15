import { Heading } from '@/components/heading'
import { Text } from '@/components/text'

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:px-6">
      <Heading>Privacy Policy for skedd</Heading>
      <Text className="mt-4">Last Updated: April 15, 2025</Text>

      <Text className="mt-4">
        Thank you for using skedd! This privacy policy explains how we collect, use, and protect your information.
      </Text>

      <Heading level={2} className="mt-8 text-xl">1. Information We Collect</Heading>
      <Text className="mt-2">
        We collect the following information when you sign up and use skedd:
      </Text>
      <ul className="mt-2 list-disc pl-6">
        <li><Text>Email Address: We collect your email address to create and manage your account, and for communication purposes.</Text></li>
        <li><Text>Name: We collect your name to personalize your experience within the app.</Text></li>
        <li><Text>Username: We collect your username to identify you within the app.</Text></li>
        <li><Text>Connected Account Data: We read data from your connected accounts to provide core functionality.</Text></li>
      </ul>

      <Heading level={2} className="mt-8 text-xl">2. How We Use Your Information</Heading>
      <ul className="mt-2 list-disc pl-6">
        <li><Text>To Provide and Improve the App</Text></li>
        <li><Text>To Personalize Your Experience</Text></li>
        <li><Text>To Communicate with You</Text></li>
        <li><Text>To Provide Core Functionality</Text></li>
      </ul>

      <Heading level={2} className="mt-8 text-xl">3. Data Security</Heading>
      <Text className="mt-2">
        We take the security of your data very seriously. We implement encryption, access controls,
        and regular security audits to protect your information.
      </Text>

      <Heading level={2} className="mt-8 text-xl">4. No Sharing of Information</Heading>
      <Text className="mt-2">
        We do not share your personal information with any third parties. Your data is only used
        to provide and improve skedd.
      </Text>

      <Heading level={2} className="mt-8 text-xl">5. Data Retention</Heading>
      <Text className="mt-2">
        We retain your personal information for as long as your account is active or as needed to
        provide you with the services.
      </Text>

      <Heading level={2} className="mt-8 text-xl">6. Your Rights</Heading>
      <ul className="mt-2 list-disc pl-6">
        <li><Text>Access to your personal information</Text></li>
        <li><Text>Correction of inaccurate information</Text></li>
        <li><Text>Deletion of your information</Text></li>
        <li><Text>Objection to processing</Text></li>
      </ul>

      <Heading level={2} className="mt-8 text-xl">7. Changes to This Privacy Policy</Heading>
      <Text>
        We may update this privacy policy from time to time. We will notify you of any material changes by posting the new privacy policy on our website. Your continued use of skedd after the effective date of the revised privacy policy constitutes your acceptance of the changes.
      </Text>
    </div>
  )
}
