// src/data/company.ts

// サイト全体で使う「Beekleとは何者か」の共通定義。
// TOP meta / Company / Footer / Organization JSON-LD / llms.txt はここに揃える (TASK-003)。
export const companyPositioning = {
  short: 'AIを前提に開発工数を圧縮し、同じ予算でより多く前に進めるシステム開発会社です。',
  long: '業務課題を整理し、要求をユーザーストーリー・受入条件・開発タスクへ構造化。AIを前提に調査・設計・実装・検証を高速化し、早く動くものを出して手戻りを小さくします。必要な人月と開発総額を抑えながら改善回数を増やします。',
  zeroStart:
    '本開発前に検証用プロトタイプや判断材料を作り、開発する・見送る・範囲を変える判断を支援します。',
};

export const companyInfo = {
  name: '株式会社Beekle',
  established: '2023年2月1日',
  capital: '100万円',
  representative: '鶴岡 邦夫',
  businessActivities: [
    'コンピュータのソフトウェア・ハードウェアの企画、研究、開発、設計、製造、販売、保守、リース、賃貸、輸出入',
    'インターネット等を利用した各種情報提供サービス',
    '通信販売事業',
    '各種業務に関するアウトソーシングの受託',
    '人材育成・能力開発のための研修、教育',
    'マーケティングに関する企画、調査',
    'コンサルティング業務',
    '前各号に附帯関連する一切の事業',
  ],
  address: '東京都大田区久が原3丁目14番27号',
  email: 'support@beekle.jp',
  holidays: '土曜日、日曜日、祝日',
  advisors: {
    tax: '檜山税理士事務所',
    legal: '猿渡法律事務所',
    technical: '中村有貴',
    labor: '笠原労務管理事務所',
  },
};
