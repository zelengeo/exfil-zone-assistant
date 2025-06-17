import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
                                           children,
                                       }) => {
    return (

            <div className="flex flex-col min-h-screen bg-military-900 text-tan-100 relative">
                {/* Texture overlay */}
                <div className="absolute inset-0 texture-overlay pointer-events-none"></div>

                <Header />

                <main className="flex-grow relative z-10">
                    {children}
                </main>

                <Footer />
            </div>

    );
};

export default Layout;