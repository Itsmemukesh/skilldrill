import type { Metadata } from 'next';
import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SITE_NAME } from '../../lib/siteConfig';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_NAME} is a professional learning and practice platform for technical writers, content designers, and documentation engineers — covering style guides, API docs, and Docs-as-Code workflows.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
      <div className="max-w-3xl mx-auto">
        <h1 className="font-mono text-3xl font-bold text-text-main mb-6 pb-2 border-b border-border-base">
          About SkillDrill
        </h1>
        
        <section className="mb-10 prose prose-neutral dark:prose-invert">
          <p className="text-base text-text-sec leading-relaxed mb-6">
            SkillDrill is a professional learning and practice platform designed specifically for Technical Writers, Content Designers, and Documentation Engineers. Unlike generic quiz sites, SkillDrill focuses on real-world documentation challenges, style guides, API practices, and modern Docs-as-Code workflows.
          </p>
        </section>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card>
            <h3 className="text-lg font-mono font-bold text-text-main mb-3">The Vision</h3>
            <p className="text-sm text-text-sec leading-relaxed">
              Create a sleek, developer-centric learning experience inspired by GitHub, Linear, and Vercel. We avoid gamified, childish aesthetics in favor of a clean, high-density environment that fits naturally into an engineer's daily routine.
            </p>
          </Card>
          <Card>
            <h3 className="text-lg font-mono font-bold text-text-main mb-3">The Mission</h3>
            <p className="text-sm text-text-sec leading-relaxed">
              Enable technical writers to practice their skills systematically every day, prepare effectively for professional job interviews, and keep pace with the rapidly evolving documentation tools and AI-assisted workflows.
            </p>
          </Card>
        </section>

        {/* Tech Stack */}
        <section className="mb-10">
          <h2 className="font-mono text-xl font-bold text-text-main mb-4">Technology Stack</h2>
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-bold text-text-main mb-2">Frontend Stack</h4>
                <ul className="space-y-1 text-sm text-text-sec list-disc pl-5 font-mono">
                  <li>Next.js 16 (App Router)</li>
                  <li>React 19</li>
                  <li>Tailwind CSS v4</li>
                  <li>TypeScript</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-main mb-2">Storage & Hosting</h4>
                <ul className="space-y-1 text-sm text-text-sec list-disc pl-5 font-mono">
                  <li>Client-side Local Storage</li>
                  <li>Static JSON Question Bank</li>
                  <li>GitHub Pages (Compatible)</li>
                  <li>Google Analytics 4 / Clarity</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Roadmap */}
        <section className="mb-10">
          <h2 className="font-mono text-xl font-bold text-text-main mb-4">Future Roadmap</h2>
          <div className="space-y-4">
            <div className="relative pl-6 border-l-2 border-border-base">
              <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-accent-base"></div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-mono font-bold text-text-main">Phase 1: Minimum Viable Product</h4>
                <Badge variant="success">Current</Badge>
              </div>
              <p className="text-sm text-text-sec leading-relaxed">
                Static dashboard, 8 core skill tags, timer preferences, local scoring history, lightweight Next.js app, and responsive monochrome design system.
              </p>
            </div>
            
            <div className="relative pl-6 border-l-2 border-border-base">
              <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-border-base"></div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-mono font-bold text-text-main">Phase 2: Persistent Storage & Streaks</h4>
                <Badge variant="neutral">Upcoming</Badge>
              </div>
              <p className="text-sm text-text-sec leading-relaxed">
                Supabase integration, user profiles, daily streak tracker, and weekly community leaderboards to build consistency habits.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-border-base">
              <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-border-base"></div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-mono font-bold text-text-main">Phase 3: Interactive Challenge Types</h4>
                <Badge variant="neutral">Planned</Badge>
              </div>
              <p className="text-sm text-text-sec leading-relaxed">
                Scenario-based choices, markdown syntax repair, API responses schema mapping, and interactive editing challenges.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-border-base">
              <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-border-base"></div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-mono font-bold text-text-main">Phase 4: AI peer reviews</h4>
                <Badge variant="neutral">Planned</Badge>
              </div>
              <p className="text-sm text-text-sec leading-relaxed">
                Integration with LLMs to let writers submit passages of text and receive immediate reviews graded against Microsoft and Google documentation style guides.
              </p>
            </div>
          </div>
        </section>
      </div>
  );
}
