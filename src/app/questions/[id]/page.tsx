import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import {
  getAllQuestions,
  getPublishedQuestionById,
} from '../../../services/questionBankServer';
import {
  absoluteUrl,
  getSkillName,
  SITE_NAME,
} from '../../../lib/siteConfig';
import { questionSchema, breadcrumbSchema } from '../../../lib/structuredData';

interface PageParams {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAllQuestions().map((q) => ({ id: q.id }));
}

function truncate(text: string, max = 155): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const question = getPublishedQuestionById(id);

  if (!question) {
    return { title: 'Question Not Found' };
  }

  const title = truncate(question.question, 60);
  const description = truncate(question.explanation);

  return {
    title,
    description,
    alternates: { canonical: `/questions/${id}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/questions/${id}`),
      type: 'article',
    },
  };
}

export default async function QuestionPage({ params }: PageParams) {
  const { id } = await params;
  const question = getPublishedQuestionById(id);

  if (!question) {
    notFound();
  }

  const skillName = getSkillName(question.skill);

  const jsonLd = [
    questionSchema(question),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: skillName, path: `/skills/${question.skill}` },
      { name: truncate(question.question, 60), path: `/questions/${id}` },
    ]),
  ];

  return (
    <article className="max-w-2xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs font-mono text-text-sec mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent-base">Home</Link>
        <span className="mx-2 text-text-mute">/</span>
        <Link href={`/skills/${question.skill}`} className="hover:text-accent-base">{skillName}</Link>
        <span className="mx-2 text-text-mute">/</span>
        <span className="text-text-main">Question</span>
      </nav>

      {/* Question */}
      <Card className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Badge variant="accent">{skillName}</Badge>
          <Badge
            variant={question.difficulty === 'hard' ? 'error' : question.difficulty === 'medium' ? 'warning' : 'success'}
          >
            {question.difficulty.toUpperCase()}
          </Badge>
        </div>
        <h1 className="text-lg md:text-xl font-bold text-text-main leading-relaxed">
          {question.question}
        </h1>
      </Card>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => {
          const isCorrect = idx === question.correctAnswer;
          return (
            <div
              key={idx}
              className={`w-full text-left p-4 rounded-md border text-sm flex items-center justify-between gap-4 ${
                isCorrect
                  ? 'bg-success-bg border-success-base text-success-base font-bold'
                  : 'bg-surface-base border-border-base text-text-main'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-text-mute px-1.5 py-0.5 rounded border border-border-base bg-surface-base">
                  {idx + 1}
                </span>
                <span>{option}</span>
              </div>
              {isCorrect && <span className="font-mono text-xs">Correct answer</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation + reference */}
      <Card className="border-t-4 border-t-success-base mb-8">
        <div className="space-y-4 text-sm leading-relaxed">
          <div>
            <h2 className="text-xs font-mono font-bold text-text-sec mb-1">EXPLANATION</h2>
            <p className="text-text-main">{question.explanation}</p>
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-text-sec mb-1">REAL-WORLD APPLICATION</h2>
            <p className="text-text-sec italic">&ldquo;{question.realWorldExample}&rdquo;</p>
          </div>
          <div className="pt-2 border-t border-border-base/50 flex items-center justify-between gap-4 flex-wrap text-xs">
            <span className="font-mono text-text-mute">SOURCE REFERENCE:</span>
            <a
              href={question.reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-accent-base hover:underline"
            >
              {question.reference.title}
            </a>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/practice?skill=${question.skill}`} className="flex-1">
          <Button variant="primary" fullWidth>Practice {skillName}</Button>
        </Link>
        <Link href={`/skills/${question.skill}`} className="flex-1">
          <Button variant="secondary" fullWidth>Browse all {skillName} questions</Button>
        </Link>
      </div>
    </article>
  );
}
