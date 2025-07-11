// app/privacy/page.tsx
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {SiDiscord, SiGithub} from "@icons-pack/react-simple-icons";
import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Privacy Policy</CardTitle>
                    <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="prose prose-slate max-w-none">
                    <h2>1. Information We Collect</h2>
                    <h3>Information you provide:</h3>
                    <ul>
                        <li>Account information (email, username, profile picture from OAuth providers)</li>
                        <li>User-generated content (feedback, bug reports, suggestions)</li>
                        <li>Usage preferences and settings</li>
                    </ul>

                    <h3>Information collected automatically:</h3>
                    <ul>
                        <li>Browser type and version</li>
                        <li>Pages visited and time spent</li>
                        <li>Referring website</li>
                        <li>General location (country/region)</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use collected information to:</p>
                    <ul>
                        <li>Provide and maintain the Service</li>
                        <li>Authenticate users and manage accounts</li>
                        <li>Process and respond to feedback</li>
                        <li>Improve and optimize the Service</li>
                        <li>Send important service updates</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <h2>3. OAuth Authentication</h2>
                    <p>
                        When you sign in using Google, Discord, or Facebook, we only access basic profile
                        information (name, email, profile picture). We do not access your contacts, posts,
                        or other private data from these services.
                    </p>

                    <h2>4. Data Storage</h2>
                    <p>
                        Your data is stored securely using industry-standard encryption. We use MongoDB Atlas
                        for database hosting and Vercel for application hosting, both of which comply with
                        modern security standards.
                    </p>

                    <h2>5. Data Sharing</h2>
                    <p>
                        We do not sell, trade, or rent your personal information. We may share data only:
                    </p>
                    <ul>
                        <li>With your consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and safety</li>
                        <li>With service providers who assist in operating the Service</li>
                    </ul>

                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Opt-out of non-essential communications</li>
                        <li>Export your data</li>
                    </ul>

                    <h2>7. Cookies</h2>
                    <p>
                        We use essential cookies for authentication and session management. These are necessary
                        for the Service to function properly. We do not use tracking or advertising cookies.
                    </p>

                    <h2>8. Children's Privacy</h2>
                    <p>
                        The Service is not intended for children under 13. We do not knowingly collect
                        information from children under 13.
                    </p>

                    <h2>9. Changes to Privacy Policy</h2>
                    <p>
                        We may update this policy periodically. We will notify users of significant changes
                        through the Service or via email.
                    </p>

                    <h2>10. Contact Us</h2>
                    <p>
                        For privacy concerns or questions, please contact us through:
                    </p>
                    <ul>
                        <li>Discord: <a href={"https://discord.gg/2FCDZK6C25"}
                                        className="p-2 rounded-sm hover:bg-military-800 transition-colors border border-transparent hover:border-olive-700"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Discord">
                            https://discord.gg/2FCDZK6C25
                        </a></li>
                        <li>GitHub: <a
                            href="https://github.com/zelengeo/exfil-zone-assistant"
                            target="_blank"
                            rel="noopener noreferrer"
                        >https://github.com/zelengeo/exfil-zone-assistant
                        </a></li>
                        <li>Email: exfilzone.assistant@gmail.com</li>
                    </ul>

                    <h2>11. Data Protection Officer</h2>
                    <p>
                        For GDPR-related inquiries, our Data Protection Officer can be reached at the
                        contact information above.
                    </p>

                    <h2>12.Data Deletion</h2>
                    <p>
                        You have the right to delete your account and personal data at any time.
                        To delete your data:
                    </p>
                    <ol>
                        <li>Sign in to your account</li>
                        <li>Go to Settings → Account</li>
                        <li>Click &#34;Delete My Account&#34;</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}