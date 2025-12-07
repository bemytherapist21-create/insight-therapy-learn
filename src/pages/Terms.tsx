import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Terms = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center text-white mb-4">Terms and Conditions</CardTitle>
                    <p className="text-center text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh] pr-4">
                        <div className="space-y-6 text-gray-200">
                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">1. Agreement to Terms</h3>
                                <p>
                                    These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and The Everything AI ("we," "us," or "our"), concerning your access to and use of our website and services.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">2. Medical Disclaimer</h3>
                                <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-lg">
                                    <p className="text-white font-medium">
                                        IMPORTANT: The AI Therapy service is NOT a replacement for professional medical advice, diagnosis, or treatment. It is an educational and supportive tool powered by artificial intelligence.
                                    </p>
                                    <p className="mt-2 text-white">
                                        If you are experiencing a medical emergency or having suicidal thoughts, please call your local emergency services or a crisis hotline immediately.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">3. User Registration</h3>
                                <p>
                                    You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">4. Prohibited Activities</h3>
                                <p className="mb-2">You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activities include:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li>Systematically retrieving data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                                    <li>Using the Site to mislead, defraud, or solicit information from other users.</li>
                                    <li>Interfering with, disrupting, or creating an undue burden on the Site or the networks or services connected to the Site.</li>
                                    <li>Attempting to bypass any measures of the Site designed to prevent or restrict access to the Site, or any portion of the Site.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">5. Intellectual Property Rights</h3>
                                <p>
                                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">6. Limitation of Liability</h3>
                                <p>
                                    In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-semibold text-white mb-2">7. Contact Us</h3>
                                <p>
                                    In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at support@theeverythingai.com.
                                </p>
                            </section>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default Terms;
