const BEEKLE_SUFFIX_PATTERN = /(?:\s*[|｜]\s*Beekle)+\s*$/u;

export const normalizeBeeklePageTitle = (title: string): string => {
  const withoutBrandSuffix = title.replace(BEEKLE_SUFFIX_PATTERN, '').trim();

  if (!withoutBrandSuffix) {
    return 'Beekle';
  }

  if (withoutBrandSuffix.includes('Beekle')) {
    return withoutBrandSuffix;
  }

  return `${withoutBrandSuffix} | Beekle`;
};
