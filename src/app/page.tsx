import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import NavigationSection from "@/app/components/NavigationSection";
import CommunitySection from "@/app/components/CommunitySection";
import HeroSection from "@/app/components/HeroSection";

export default function Home() {
  return (
      <Layout>
        {/* Hero Section */}
        <HeroSection />

        {/* Community Section */}
        <CommunitySection />

        {/* Game Overview */}
        {/*<section className="py-12 bg-military-900 border-y border-olive-900">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center military-stencil text-olive-400">MISSION BRIEFING</h2>
            <div className="max-w-3xl mx-auto military-box p-6">
              <p className="text-lg text-tan-200 mb-6">
                Welcome to the world of ExfilZone, an immersive VR extraction shooter that combines tactical gameplay with resource management and survival elements.
              </p>
              <p className="text-lg text-tan-200 mb-6">
                As a mercenary, your mission is to enter restricted zones, gather valuable resources, complete objectives, and successfully extract before time runs out or hostile forces eliminate you.
              </p>
              <p className="text-lg text-tan-200">
                Use this assistant to master game mechanics, and outperform other players with strategic knowledge.
              </p>
            </div>
          </div>
        </section>*/}

        {/* Navigation Hub */}
        <NavigationSection />

        {/* News and Quick Reference */}

        {/* Call to Action */}
        <section className="py-16 bg-olive-600 text-military-900 relative">
          <div className="absolute inset-0 texture-overlay opacity-20"></div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-block bg-military-900/20 border border-olive-700 p-1 mb-4">
              <h2 className="text-3xl font-bold px-6 py-2 military-stencil">GEAR UP, OPERATOR</h2>
            </div>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-military-100">
              Browse our comprehensive guides and resources to level up your skills and maximize your extraction potential.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                  href="/guides/combat-sim-usage"
                  className="bg-military-900 hover:bg-military-800 text-tan-100 px-6 py-3 rounded-sm font-medium text-lg transition-colors border border-olive-700"
              >
                Start with Basics
              </Link>
              {/*<Link
                  href="/hideout/calculator"
                  className="bg-tan-100 hover:bg-tan-200 text-military-900 px-6 py-3 rounded-sm font-medium text-lg transition-colors border border-olive-700"
              >
                Hideout Calculator
              </Link>*/}
            </div>

            <div className="mt-12 inline-block">
              <div className="flex items-center gap-2 text-sm font-bold text-military-900 military-stencil">
                <div className="h-px bg-military-900 w-8"></div>
                STAY ALERT • STAY ALIVE • EXFIL SUCCESSFULLY
                <div className="h-px bg-military-900 w-8"></div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-8 bg-military-900 clip-diagonal"></div>
        </section>
      </Layout>
  );
}