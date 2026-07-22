import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import { SkillCategory } from '../../../types';
import {
  READY_SKILLS,
  getSkillMeta,
  absoluteUrl,
  SITE_NAME,
} from '../../../lib/siteConfig';
import { getAllPublishedQuestions } from '../../../services/questionBankServer';
import { courseSchema, breadcrumbSchema } from '../../../lib/structuredData';

interface PageParams {
  params: Promise<{ skill: string }>;
}

export function generateStaticParams() {
  return READY_SKILLS.map((skill) => ({ skill }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { skill } = await params;
  const meta = getSkillMeta(skill as SkillCategory);

  if (!meta || !meta.ready) {
    return { title: 'Skill Not Found' };
  }

  const count = getAllPublishedQuestions(skill as SkillCategory).length;
  const title = `${meta.name} Practice Questions`;
  const description = `${meta.desc} Practice ${count} technical writing questions on ${meta.name.toLowerCase()} with explanations and references.`;

  return {
    title,
    description,
    alternates: { canonical: `/skills/${skill}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/skills/${skill}`),
      type: 'website',
    },
  };
}

export default async function SkillPage({ params }: PageParams) {
  const { skill } = await params;
  const meta = getSkillMeta(skill as SkillCategory);

  if (!meta || !meta.ready) {
    notFound();
  }

  const questions = getAllPublishedQuestions(skill as SkillCategory);

  const jsonLd = [
    courseSchema(skill as SkillCategory, meta.desc, questions.length),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: meta.name, path: `/skills/${skill}` },
    ]),
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs font-mono text-text-sec mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent-base">Home</Link>
        <span className="mx-2 text-text-mute">/</span>
        <span className="text-text-main">{meta.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="font-mono text-3xl font-bold text-text-main">{meta.name}</h1>
          <Badge variant="success">{questions.length} Questions</Badge>
        </div>
        <p className="text-base text-text-sec leading-relaxed mb-6">{meta.desc}</p>
        <Link href={`/practice?skill=${skill}`}>
          <Button variant="primary" size="lg">Practice {meta.name} →</Button>
        </Link>
      </div>

      {/* Question index — real HTML links for crawlers */}
      <section>
        <h2 className="font-mono text-xl font-bold text-text-main mb-4 pb-2 border-b border-border-base">
          All Questions
        </h2>
        <ul className="space-y-3">
          {questions.map((q) => (
            <li key={q.id}>
              <Link href={`/questions/${q.id}`}>
                <Card hoverable className="flex items-center justify-between gap-4">
                  <span className="text-sm text-text-main leading-relaxed">{q.question}</span>
                  <Badge
                    variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'}
                  >
                    {q.difficulty.toUpperCase()}
                  </Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
