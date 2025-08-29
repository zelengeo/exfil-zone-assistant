import React from "react";
import Layout from "@/components/layout/Layout";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function TermsOfServicePage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8 ">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Terms of Service</CardTitle>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="prose prose-slate max-w-none">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using ExfilZone Assistant (&#34;the Service&#34;), you agree to be bound by
                            these Terms
                            of Service.
                            If you do not agree to these terms, please do not use the Service.
                        </p>

                        <h2>2. Description of Service</h2>
                        <p>
                            ExfilZone Assistant is a community-driven wiki and tool platform for VR tactical shooter
                            games.
                            The Service provides game information, calculators, and user-contributed content.
                        </p>

                        <h2>3. User Accounts</h2>
                        <p>
                            To access certain features, you may need to create an account. You are responsible for:
                        </p>
                        <ul>
                            <li>Maintaining the confidentiality of your account</li>
                            <li>All activities that occur under your account</li>
                            <li>Providing accurate and complete information</li>
                        </ul>

                        <h2>4. User Content</h2>
                        <p>
                            By submitting content (feedback, corrections, suggestions), you grant us a non-exclusive,
                            worldwide, royalty-free license to use, modify, and display that content.
                        </p>

                        <h2>5. Prohibited Uses</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Submit false or misleading information</li>
                            <li>Violate any laws or regulations</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Attempt to gain unauthorized access to the Service</li>
                            <li>Use the Service for any illegal or unauthorized purpose</li>
                        </ul>

                        <h2>6. Intellectual Property</h2>
                        <p>
                            Game content, names, and materials are property of their respective owners.
                            This Service is not affiliated with or endorsed by the game developers.
                        </p>

                        <h2>7. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided &#34;as is&#34; without warranties of any kind. We do not guarantee
                            the accuracy, completeness, or usefulness of any information on the Service.
                        </p>

                        <h2>8. Limitation of Liability</h2>
                        <p>
                            We shall not be liable for any indirect, incidental, special, consequential, or
                            punitive damages resulting from your use of the Service.
                        </p>

                        <h2>9. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of the Service
                            after changes constitutes acceptance of the new terms.
                        </p>

                        <h2>10. Contact Information</h2>
                        <p>
                            For questions about these Terms of Service, please contact us through our <a
                            href={"https://discord.gg/2FCDZK6C25"}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Discord"
                            className="inline-flex underline">
                            Discord server
                        </a>, <a
                            href="https://github.com/zelengeo/exfil-zone-assistant"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="inline-flex items-center underline"
                        >
                            GitHub repository
                        </a> or the email: exfilzone.assistant@gmail.com.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}