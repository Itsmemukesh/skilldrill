'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getHistory } from '../services/localStorageService';
import { SkillCategory, HistoryRecord } from '../types';

interface SkillItem {
  id: SkillCategory;
  name: string;
  desc: string;
  ready: boolean;
}

const SKILLS: SkillItem[] = [
  {
    id: 'documentation-fundamentals',
    name: 'Documentation Fundamentals',
    desc: 'Active voice, sentence structure, clear steps, and readability principles.',
    ready: true
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    desc: 'REST APIs, OpenAPI specification, authentication, schemas, and endpoint references.',
    ready: true
  },
  {
    id: 'style-guides',
    name: 'Style Guides',
    desc: 'Google Developer Style Guide, Microsoft Writing Guide, and corporate tone.',
    ready: false
  },
  {
    id: 'docs-as-code',
    name: 'Docs-as-Code',
    desc: 'Markdown, static site generators, Git workflows, CI/CD pipelines, and frontmatter.',
    ready: false
  },
  {
    id: 'ai-for-technical-writers',
    name: 'AI for Technical Writers',
    desc: 'Prompt engineering, AI review guidelines, large language models, and content curation.',
    ready: false
  },
  {
    id: 'content-strategy',
    name: 'Content Strategy',
    desc: 'Information mapping, taxonomy, document architecture, navigation flows, and sitemaps.',
    ready: false
  },
  {
    id: 'professional-skills',
    name: 'Professional Skills',
    desc: 'Editing methods, stakeholder interviews, feedback collection, and review processes.',
    ready: false
  },
  {
    id: 'interview-preparation',
    name: 'Interview Preparation',
    desc: 'Common technical writing interview questions, portfolio reviews, and writing tests.',
    ready: false
  }
];

interface DashboardPageProps {
  questionCounts: Partial<Record<SkillCategory, number>>;
}

export default function DashboardPage({ questionCounts }: DashboardPageProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const getSkillName = (id: SkillCategory) => {
    return SKILLS.find(s => s.id === id)?.name || id;
  };

  const getFormatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <>
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
        <h1 className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-text-main mb-6 leading-tight">
          Sharpen your documentation skills. <br className="hidden sm:inline" />
          <span className="text-accent-base">Every day.</span>
        </h1>
        <p className="text-base sm:text-lg text-text-sec mb-8 max-w-2xl mx-auto leading-relaxed">
          Practice interview-ready questions, master modern documentation standards, and stay current with APIs, style guides, and Docs-as-Code workflows.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/practice">
            <Button variant="primary" size="lg">Start Practicing</Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" size="lg">Learn More →</Button>
          </Link>
        </div>
      </section>

      {/* 2. Quick Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <Card hoverable className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="accent">Curated Daily</Badge>
            <svg className="h-6 w-6 text-accent-base" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3 className="text-lg font-mono font-bold text-text-main mb-2">Daily Challenge</h3>
          <p className="text-sm text-text-sec mb-6 flex-1">
            Test yourself with today's 10-question mixed fundamentals and API documentation challenge.
          </p>
          <Link href="/practice?mode=daily" className="mt-auto">
            <Button variant="primary" fullWidth>Launch Challenge</Button>
          </Link>
        </Card>

        <Card hoverable className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="neutral">Quick Start</Badge>
            <svg className="h-6 w-6 text-text-sec" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </div>
          <h3 className="text-lg font-mono font-bold text-text-main mb-2">Random Quiz</h3>
          <p className="text-sm text-text-sec mb-6 flex-1">
            Hop into a fast, 5-question quiz across any ready category with standard difficulty.
          </p>
          <Link href="/practice?mode=random" className="mt-auto">
            <Button variant="secondary" fullWidth>Start Random Quiz</Button>
          </Link>
        </Card>
      </section>

      {/* 3. Practice by Skill Grid */}
      <section className="mb-16">
        <h2 className="font-mono text-2xl font-bold text-text-main mb-6 pb-2 border-b border-border-base">
          Practice by Skill
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILLS.map((skill) => (
            <Card key={skill.id} hoverable={skill.ready} className={`flex flex-col ${!skill.ready ? 'opacity-65' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <Badge variant={skill.ready ? 'success' : 'neutral'}>
                  {skill.ready
                    ? `${questionCounts[skill.id] ?? 0} Questions`
                    : 'Coming Soon'}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-text-main mb-2 line-clamp-1">{skill.name}</h3>
              <p className="text-xs text-text-sec mb-5 flex-1 line-clamp-3 leading-relaxed">
                {skill.desc}
              </p>
              <Link href={skill.ready ? `/practice?skill=${skill.id}` : '#'} className="mt-auto">
                <Button variant={skill.ready ? 'secondary' : 'ghost'} fullWidth disabled={!skill.ready}>
                  {skill.ready ? 'Select Skill' : 'Locked'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Recent Performance */}
      <section>
        <h2 className="font-mono text-2xl font-bold text-text-main mb-6 pb-2 border-b border-border-base">
          Recent Performance
        </h2>

        {history.length === 0 ? (
          <Card className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-text-mute mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h4 className="text-lg font-mono font-bold text-text-main mb-2">No Practice History Yet</h4>
            <p className="text-sm text-text-sec mb-6 max-w-sm mx-auto">
              Your results, response times, and scores will be stored locally once you complete your first quiz.
            </p>
            <Link href="/practice">
              <Button variant="primary">Take Your First Quiz</Button>
            </Link>
          </Card>
        ) : (
          <div className="border border-border-base rounded-lg overflow-hidden bg-surface-base">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-base text-xs font-mono text-text-sec uppercase bg-surface-hover">
                    <th className="p-4">Date</th>
                    <th className="p-4">Skill Category</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-center">Accuracy</th>
                    <th className="p-4 text-right">Avg Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-y-reverse divide-border-base font-mono text-sm">
                  {history.slice(0, 5).map((record, index) => (
                    <tr key={index} className="hover:bg-surface-hover/50">
                      <td className="p-4 text-text-sec">
                        {new Date(record.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 font-sans font-semibold text-text-main">
                        {getSkillName(record.skill)}
                      </td>
                      <td className="p-4 text-center text-text-main font-bold">
                        {record.score} / {record.total}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={record.accuracy >= 80 ? 'success' : record.accuracy >= 50 ? 'warning' : 'error'}>
                          {record.accuracy}%
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-text-sec">
                        {getFormatTime(record.avgTimeMs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
