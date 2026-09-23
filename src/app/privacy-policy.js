import LegalScreen from "../screens/LegalScreen";

export default function PrivacyPolicy() {
  return (
    <LegalScreen
      title="Privacy Policy"
      content={`Last updated: ${new Date().toLocaleDateString()}

Wallify ("we", "our", "the app") respects your privacy. This policy explains what information we collect and how it's used.

Account Information
When you create an account, we collect your email address and a securely hashed password via Firebase Authentication. We never see or store your password in plain text.

Profile Photo
If you choose to upload a profile photo, it's stored via Firebase Storage and associated with your account. You can change or remove it at any time from your profile.

Wallpaper Data
Photos and wallpaper images displayed in the app are provided by Unsplash. Wallify does not host or own these images. Your searches and category browsing are sent to Unsplash's API to retrieve results but are not linked to your personal account by us.

Likes, Saves, and Preferences
If you like, save, or mark a wallpaper as "not interested," this preference is stored against your account so it can sync across your devices.

What We Don't Do
We do not sell your personal data. We do not share your email address with third parties for marketing purposes.

Data Storage
Your account and preference data is stored using Firebase (a Google service). Firebase's own privacy and security practices apply to how that data is protected in transit and at rest.

Your Choices
You can delete your account and associated data at any time by contacting us, or through account settings once that feature is available.

Contact
If you have questions about this policy, reach out to lensocharlton63@gmail.com - taiyaanhulevy@gmail.com.`}
    />
  );
}
