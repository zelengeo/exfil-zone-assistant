import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import {ArrowRight, MapPin, Package, FileText, Briefcase, Target, House} from 'lucide-react';

// Mock data for news items
// const newsItems = [
//   {
//     id: 1,
//     title: "New Ammo Types Added",
//     date: "May 15, 2025",
//     excerpt: "The latest game update introduces 5 new ammunition types with unique penetration and damage profiles.",
//     imageUrl: "/images/news/ammo-update.jpg"
//   }
// ];

// Mock data for quick reference tips
// const quickReferenceTips = [
//   {
//     id: 1,
//     title: "Safe Room Codes",
//     content: "Current safe codes: Dorms 204: 3548, Office: 7294, Warehouse: 9183"
//   }
// ];

export default function Home() {
  return (
      <Layout>
        {/* Hero Section */}
        <section className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-military-900 via-military-900/90 to-transparent z-10" />
          <div className="relative h-full w-full bg-military-800">
            {/* Hero background with CSS pattern instead of image */}
            <div className="absolute inset-0" style={{
              backgroundColor: '#373c32',
              backgroundImage: 'linear-gradient(45deg, #4d5244 25%, transparent 25%, transparent 75%, #4d5244 75%, #4d5244), linear-gradient(45deg, #4d5244 25%, transparent 25%, transparent 75%, #4d5244 75%, #4d5244)',
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 30px',
              opacity: 0.3
            }} />
          </div>

          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-xl">
                <div className="inline-block mb-4 px-3 py-1 border border-olive-500 bg-military-800/80">
                  <h2 className="text-olive-400 military-stencil">TACTICAL VR ASSISTANT</h2>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tan-100 mb-4 military-stencil">
                  EXFIL ZONE
                </h1>
                <div className="bg-military-900/80 border border-olive-700 p-4 mb-8">
                  <p className="text-xl md:text-2xl text-tan-200">
                    Your ultimate tactical companion for the VR extraction shooter experience
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                      href="/guides/combat-sim-usage"
                      className="bg-olive-600 hover:bg-olive-500 text-tan-100 px-6 py-3 rounded-sm font-medium text-lg transition-colors flex items-center gap-2 border border-olive-500"
                  >
                    Beginner&apos;s Guide <ArrowRight size={20} />
                  </Link>
                  <Link
                      href="/combat-sim"
                      className="bg-military-700 hover:bg-military-600 text-tan-100 px-6 py-3 rounded-sm font-medium text-lg transition-colors border border-olive-700"
                  >
                    Combat Simulator
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Game Overview */}
        <section className="py-12 bg-military-900 border-y border-olive-900">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center military-stencil text-olive-400">MISSION BRIEFING</h2>
            <div className="max-w-3xl mx-auto military-box p-6">
              <p className="text-lg text-tan-200 mb-6">
                Welcome to the world of Exfil Zone, an immersive VR extraction shooter that combines tactical gameplay with resource management and survival elements.
              </p>
              <p className="text-lg text-tan-200 mb-6">
                As a mercenary, your mission is to enter restricted zones, gather valuable resources, complete objectives, and successfully extract before time runs out or hostile forces eliminate you.
              </p>
              <p className="text-lg text-tan-200">
                Use this assistant to master game mechanics, and outperform other players with strategic knowledge.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Hub */}
        <section className="py-16 bg-military-800 relative">
          <div className="absolute inset-0 texture-overlay"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex items-center justify-center mb-10">
              <div className="h-px bg-olive-700 w-20"></div>
              <h2 className="text-3xl font-bold mx-4 text-center military-stencil text-olive-400">OPERATIONS</h2>
              <div className="h-px bg-olive-700 w-20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <Link href="/combat-sim" className="military-card hover:bg-military-700 rounded-sm p-8 transition-all hover:shadow-lg group">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-600 p-3 rounded-sm text-military-900 border border-olive-500">
                    <Target size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-olive-400 transition-colors">Combat Simulator</h3>
                    <p className="text-tan-300">Test weapon damage against armor configurations</p>
                  </div>
                </div>
              </Link>

              <Link href="/items"
                    className="military-card hover:bg-military-700 rounded-sm p-8 transition-all hover:shadow-lg group">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-600 p-3 rounded-sm text-military-900 border border-olive-500">
                    <Package size={32}/>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-olive-400 transition-colors">Items
                      Database</h3>
                    <p className="text-tan-300">Browse all in-game items, stats, and locations</p>
                  </div>
                </div>
              </Link>

              <Link href="/guides"
                    className="military-card hover:bg-military-700 rounded-sm p-8 transition-all hover:shadow-lg group">
                <div className="flex items-start gap-4">
                  <div className="bg-olive-600 p-3 rounded-sm text-military-900 border border-olive-500">
                    <FileText size={32}/>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-olive-400 transition-colors">Game
                      Mechanics</h3>
                    <p className="text-tan-300">Detailed explanations of core systems</p>
                  </div>
                </div>
              </Link>

              <div
                  className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                <div className="flex items-start gap-4">
                  <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                    <Briefcase size={32}/>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-tan-300">Quests</h3>
                    <p className="text-tan-300/70">Mission guides and reward tracking</p>
                  </div>
                  <div
                      className="absolute top-4 right-4 bg-military-700 text-olive-400 px-3 py-1 rounded-sm text-sm font-medium border border-olive-600">
                    Coming Soon
                  </div>
                </div>
              </div>

              <div
                  className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                <div className="flex items-start gap-4">
                  <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                    <House size={32}/>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-tan-300">Hideout</h3>
                    <p className="text-tan-300/70">Upgrade your base and track progression</p>
                  </div>
                  <div
                      className="absolute top-4 right-4 bg-military-700 text-olive-400 px-3 py-1 rounded-sm text-sm font-medium border border-olive-600">
                    Coming Soon
                  </div>
                </div>
              </div>

              <div
                  className="relative military-card rounded-sm p-8 bg-military-800 border border-military-700 opacity-75">
                <div className="flex items-start gap-4">
                  <div className="bg-military-700 p-3 rounded-sm text-tan-300 border border-military-600">
                    <MapPin size={32}/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-tan-300">Maps</h3>
                      <span className="bg-military-700 text-olive-400 px-2 py-0.5 rounded-sm text-xs font-medium border border-olive-600 whitespace-nowrap">
                            Coming Soon
                        </span>
                    </div>
                    <p className="text-tan-300/70">Interactive maps with loot spots and extracts</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* News and Quick Reference */}
        {/*<section className="py-16 bg-military-900 border-t border-olive-900">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               News Section
              <div className="lg:col-span-2">
                <div className="flex items-center mb-8">
                  <div className="h-px bg-olive-700 flex-grow"></div>
                  <h2 className="text-3xl font-bold mx-4 military-stencil text-olive-400">INTEL REPORTS</h2>
                  <div className="h-px bg-olive-700 flex-grow"></div>
                </div>

                <div className="space-y-8">
                  {newsItems.map((item, index) => (
                      <div key={item.id} className="military-card rounded-sm overflow-hidden flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 relative h-48 sm:h-auto bg-military-700">
                           Generate pattern for news image
                          <div className="absolute inset-0" style={{
                            backgroundColor: index === 0 ? '#5c6534' : index === 1 ? '#4d4932' : '#6a6144',
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '10px 10px',
                          }}/>
                          <div className="absolute top-0 left-0 bg-olive-600 px-3 py-1 text-sm font-medium border-r border-b border-olive-700">
                            {item.date}
                          </div>
                        </div>
                        <div className="p-6 sm:w-2/3 border-t border-olive-700 sm:border-t-0 sm:border-l">
                          <h3 className="text-xl font-bold mt-1 mb-3 military-stencil">{item.title}</h3>
                          <p className="text-tan-300 mb-4">{item.excerpt}</p>
                          <a href="#" className="text-olive-400 hover:text-olive-300 flex items-center gap-1 font-medium">
                            Read Full Report <ArrowRight size={16} />
                          </a>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

               Quick Reference
              <div>
                <div className="flex items-center mb-8">
                  <div className="h-px bg-olive-700 w-12"></div>
                  <h2 className="text-3xl font-bold mx-4 military-stencil text-olive-400">FIELD NOTES</h2>
                  <div className="h-px bg-olive-700 w-12"></div>
                </div>

                <div className="military-box rounded-sm p-6">
                  {quickReferenceTips.map((tip, index) => (
                      <React.Fragment key={tip.id}>
                        <div className="py-4">
                          <h3 className="text-lg font-bold mb-2 text-olive-400 uppercase">{tip.title}</h3>
                          <p className="text-tan-200">{tip.content}</p>
                        </div>
                        {index < quickReferenceTips.length - 1 && (
                            <hr className="border-military-700" />
                        )}
                      </React.Fragment>
                  ))}

                  <div className="mt-6">
                    <Link
                        href="/guides"
                        className="w-full bg-military-700 hover:bg-military-600 text-tan-100 py-3 rounded-sm font-medium text-center block transition-colors border border-olive-800"
                    >
                      View All Field Notes
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>*/}

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