import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DeleteAccountDialog } from '@/components/settings/DeleteAccountDialog';

const PrivacyPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-white mb-4">Privacy Policy</CardTitle>
                    <p className="text-center text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-6 text-gray-200">
                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">1. Introduction</h3>
                                <p>
                                    Welcome to The Everything AI ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us at privacy@theeverythingai.com.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">2. Information We Collect</h3>
                                <p className="mb-2">We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Personal Information: Name, email address, phone number, and password.</li>
                                    <li>Health Information: Voice data, emotion analysis data, and therapy session transcripts (only with your explicit consent).</li>
                                    <li>Technical Data: IP address, browser type, and device information.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">3. How We Use Your Information</h3>
                                <p className="mb-2">We use personal information collected via our website for a variety of business purposes described below:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>To provide and maintain our Service.</li>
                                    <li>To manage your account and registration.</li>
                                    <li>To facilitate voice therapy sessions and emotion analysis.</li>
                                    <li>To improve our AI models (only with anonymized, aggregated data).</li>
                                    <li>To send you administrative information and updates.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">4. Data Encryption and Security</h3>
                                <p>
                                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. All sensitive data, including therapy transcripts and health information, is encrypted at rest and in transit using industry-standard protocols (AES-256 and TLS 1.3).
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">5. Your Privacy Rights (GDPR & CCPA)</h3>
                                <p className="mb-2">Depending on your location, you may have the following rights:</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">7. Contact Us</h3>
                                <p>
                                    If you have questions or comments about this policy, you may email us at privacy@theeverythingai.com.
                                </p>
                            </section>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default PrivacyPolicy;
