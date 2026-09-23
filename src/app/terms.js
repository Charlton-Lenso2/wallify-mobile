import LegalScreen from "../screens/LegalScreen";

export default function Terms() {
  return (
    <LegalScreen
      title="Terms of Use"
      content={`Last updated: ${new Date().toLocaleDateString()}

By using Wallify, you agree to the following terms.

Use of the App
Wallify is provided for personal, non-commercial use to browse, search, and download wallpapers for your own device.

Image Sources
Wallpapers shown in the app are sourced from Unsplash and remain subject to the Unsplash License. You're free to use downloaded images in accordance with that license, which generally permits personal and commercial use without requiring permission, though attribution is appreciated by many photographers.

Account Responsibility
You're responsible for keeping your login credentials secure. Activity under your account is your responsibility.

Acceptable Use
You agree not to use the app to violate any law, attempt to disrupt its functioning, or misuse the Unsplash API access provided through the app.

No Warranty
Wallify is provided "as is." We don't guarantee uninterrupted access, and features may change or be removed over time as the app develops.

Changes to These Terms
We may update these terms as the app evolves. Continued use after changes means you accept the updated terms.

Contact
Questions about these terms can be sent to lensocharlton63@gmail.com - taiyaanhulevy@gmail.com.`}
    />
  );
}
