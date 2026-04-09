export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 px-8 py-16">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <a href="/" className="text-2xl font-bold text-white">MeetFlow</a>
      </nav>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="text-zinc-300 space-y-6">
          <p>Last updated: April 2026</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">Information We Collect</h2>
          <p>We collect information you provide when using our video meeting services, including your name, email, and meeting activity.</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">How We Use Your Information</h2>
          <p>We use your information to provide, improve, and secure our video meeting services.</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">Data Security</h2>
          <p>We implement end-to-end encryption to protect your video calls and personal data from unauthorized access.</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8">Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us.</p>
        </div>
      </div>
    </div>
  );
}