import { readFileSync, writeFileSync } from 'node:fs';

const replaceOnce = (path, before, after) => {
  const content = readFileSync(path, 'utf8');
  const matches = content.split(before).length - 1;
  if (matches !== 1) {
    throw new Error(`${path}: expected exactly one match, found ${matches}`);
  }
  writeFileSync(path, content.replace(before, after));
};

replaceOnce(
  'src/data/situation-lp-content.ts',
  `    caseStudyRefs: [
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'mvp-poc-development', caseIndex: 0 },
      { serviceId: 'ai-development', caseIndex: 0 },
    ],`,
  `    caseStudyRefs: [
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'mvp-poc-development', caseIndex: 0 },
      { serviceId: 'web-mobile-development', caseIndex: 2 },
    ],`
);

replaceOnce(
  'src/data/situation-lp-content.ts',
  `    caseStudyRefs: [
      { serviceId: 'web-mobile-development', caseIndex: 0 },
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
      { serviceId: 'ai-development', caseIndex: 0 },
    ],`,
  `    caseStudyRefs: [
      { serviceId: 'web-mobile-development', caseIndex: 2 },
      { serviceId: 'web-mobile-development', caseIndex: 3 },
      { serviceId: 'requirements-definition-support', caseIndex: 0 },
    ],`
);

replaceOnce(
  'src/data/situation-lp-content.ts',
  `    caseStudyRefs: [
      { serviceId: 'cdp-development', caseIndex: 0 },
      { serviceId: 'web-mobile-development', caseIndex: 0 },
      { serviceId: 'ai-development', caseIndex: 0 },
    ],`,
  `    caseStudyRefs: [
      { serviceId: 'cdp-development', caseIndex: 0 },
      { serviceId: 'cdp-development', caseIndex: 1 },
      { serviceId: 'cdp-development', caseIndex: 2 },
    ],`
);

replaceOnce(
  'src/data/service.ts',
  `        answer:
          '基本的に既存システムの改修は不要です。MCPサーバーやAPI連携で外部からアクセスする設計のため、既存システムをそのまま使いながらAIエージェントを追加できます。ただしAPIが公開されていないシステムについては、連携方法の検討が必要です。',`,
  `        answer:
          'APIや認証方式を利用できる場合、既存画面の大規模な改修を避けながら外部連携できることがあります。ただし、連携先の仕様、ネットワーク、権限、監査要件によっては、既存システム側の改修が必要です。',`
);

replaceOnce(
  'src/components/services/ai-dx-service-page.astro',
  `import { Header } from '@/components/header';
import JsonLd from '@/components/seo/json-ld.astro';
import { Section, SectionHeader } from '@/components/ui';
import Layout from '../../layouts/layout.astro';`,
  `import { Header } from '@/components/header';
import JsonLd from '@/components/seo/json-ld.astro';
import { Section, SectionHeader } from '@/components/ui';
import Layout from '../../layouts/layout.astro';
import ManagementDxEvidence from './management-dx-evidence.astro';`
);

replaceOnce(
  'src/components/services/ai-dx-service-page.astro',
  `    <Section variant="white" padding="lg" id="plans">`,
  `    {mode === 'management-dx' && <ManagementDxEvidence />}

    <Section variant="white" padding="lg" id="plans">`
);

console.log('Applied LLMO LP consistency fixes.');
