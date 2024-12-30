// src/types/service.ts

interface PainPoint {
    title: string;
    description: string;
  }
  
  interface Solution {
    title: string;
    description: string;
    results: string[];
  }
  
  interface CaseStudy {
    title: string;
    challenge: string;
    solution: string;
    results: string[];
  }
  
  interface Feature {
    title: string;
    description: string;
  }
  
  interface FAQ {
    question: string;
    answer: string;
  }
  
  export interface ServiceDetail {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    painPoints: PainPoint[];
    solutions: Solution[];
    caseStudies: CaseStudy[];
    features: Feature[];
    benefits: string[];
    faq: FAQ[];
  }