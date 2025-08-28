import React from 'react';
import Layout from '../components/layout/Layout';
import NavigationSection from "@/app/components/NavigationSection";
import CommunitySection from "@/app/components/CommunitySection";
import HeroSection from "@/app/components/HeroSection";

export default function Home() {
  return (
      <Layout fullWidth noPadding>
        {/* Hero Section */}
        <HeroSection />

        {/* Community Section */}
        <CommunitySection />

        {/* Navigation Hub */}
        <NavigationSection />

        {/* News and Quick Reference */}

        {/* Call to Action */}
      </Layout>
  );
}