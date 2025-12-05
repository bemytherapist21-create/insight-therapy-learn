import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-orange-900 p-4 py-20">
            <div className="container mx-auto max-w-4xl">
                <Link to="/register">
                    <Button variant="ghost" className="mb-6 text-white hover:text-white/80">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Registration
                    </Button>
                </Link>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-3xl text-white">Terms & Conditions</CardTitle>
                        <p className="text-white/70">Last updated: December 5, 2024</p>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none text-white/90">
                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using The Everything AI services, you agree to be bound by these Terms and Conditions.
                            If you do not agree to these terms, please do not use our services.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">2. Service Description</h2>
                        <p className="mb-4">
                            The Everything AI provides AI-powered therapy, business insights, and educational services.
                            These services are supplementary and should not replace professional medical care or legal advice.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">3. User Eligibility</h2>
                        <p className="mb-4">
                            You must be at least 18 years old to use our services. By registering, you confirm that you meet this age requirement.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">4. Privacy & Data Usage</h2>
                        <p className="mb-2">We collect and use the following information:</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Email address and password for authentication</li>
                            <li>First name for personalization</li>
                            <li>Phone number for emergency contact purposes</li>
                            <li>Country for regional crisis resources</li>
                            <li>Conversation data for therapy sessions</li>
                        </ul>
                        <p className="mb-4">
                            Your data is stored securely and will only be accessed by authorized personnel.
                            We will never sell your personal information to third parties.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">5. Emergency Contact Protocol</h2>
                        <p className="mb-4">
                            In case of a mental health crisis or if our AI detects concerning patterns, we reserve the right to
                            contact you using the phone number provided. This is for your safety and wellbeing.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">6. Service Limitations</h2>
                        <p className="mb-2 font-semibold text-orange-400">Important Disclaimers:</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Our AI therapy services are NOT a substitute for professional medical care</li>
                            <li>We do not provide medical diagnoses or treatment plans</li>
                            <li>In case of emergency, always call your local emergency number (911, 112, etc.)</li>
                            <li>We are not liable for outcomes resulting from reliance on our AI services</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">7. User Responsibilities</h2>
                        <p className="mb-2">You agree to:</p>
                        <ul className="list-disc pl-6 mb-4">
                            <li>Provide accurate and truthful information</li>
                            <li>Keep your phone number up-to-date for emergency contact</li>
                            <li>Report any technical issues or concerning AI behavior</li>
                            <li>Not misuse or abuse our services</li>
                            <li>Not share your account credentials with others</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">8. Crisis Resources</h2>
                        <p className="mb-4">
                            We provide crisis hotline numbers based on your selected country. These resources are maintained
                            to the best of our ability, but we recommend independently verifying emergency contact information
                            for your region.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">9. Data Retention</h2>
                        <p className="mb-4">
                            We retain your data as long as your account is active. You may request data deletion by contacting
                            us at founder@theeverythingai.com. Some data may be retained for legal compliance purposes.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">10. Service Availability</h2>
                        <p className="mb-4">
                            We strive to maintain 24/7 service availability, but we do not guarantee uninterrupted access.
                            Scheduled maintenance and unforeseen issues may temporarily affect service availability.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">11. Limitation of Liability</h2>
                        <p className="mb-4">
                            The Everything AI and its operators shall not be liable for any indirect, incidental, special,
                            or consequential damages arising from the use of our services. Our total liability shall not
                            exceed the amount paid for services in the preceding 12 months.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">12. Changes to Terms</h2>
                        <p className="mb-4">
                            We reserve the right to modify these terms at any time. Users will be notified of significant
                            changes via email. Continued use of services after changes constitutes acceptance of new terms.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">13. Termination</h2>
                        <p className="mb-4">
                            We reserve the right to terminate or suspend accounts that violate these terms or engage in
                            harmful behavior. You may terminate your account at any time by contacting us.
                        </p>

                        <h2 className="text-2xl font-bold text-white mt-6 mb-4">14. Contact Information</h2>
                        <p className="mb-4">
                            For questions about these terms, please contact us at:
                            <br />
                            <a href="mailto:founder@theeverythingai.com" className="text-purple-400 hover:underline">
                                founder@theeverythingai.com
                            </a>
                        </p>

                        <div className="mt-8 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                            <p className="font-semibold text-white mb-2">By clicking "I accept the Terms & Conditions" during registration, you acknowledge that:</p>
                            <ul className="list-disc pl-6 text-sm">
                                <li>You have read and understood these terms</li>
                                <li>You are 18 years or older</li>
                                <li>You agree to provide accurate information</li>
                                <li>You understand this is not a substitute for professional care</li>
                                <li>You consent to emergency contact protocols</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Terms;
