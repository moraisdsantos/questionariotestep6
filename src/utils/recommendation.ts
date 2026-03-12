import { methods } from '../data/methods';
import type { AppState, MethodRecord, RecommendationResult } from '../types';
import { isFullyDigitalForbidden } from './logic';

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function containsAny(text: string, keywords: string[]): boolean {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function durationLevel(duration: string): 'Baixo' | 'Médio' | 'Alto' {
  const text = duration.toLowerCase();
  if (containsAny(text, ['1h', '2h', '4h', '4 a 7 dias', '2 dias', '2–5 dias', '1-2 dias'])) return 'Baixo';
  if (containsAny(text, ['1 semana', '1-2 semanas', '1–2 semanas', '3 a 8 semanas', '2–6 semanas', '6 a 12 semanas', '8 a 12 semanas'])) return 'Médio';
  return 'Alto';
}

function methodScale(method: MethodRecord): 'Pequena' | 'Média' | 'Grande' {
  const text = `${method.groupSize} ${method.format}`.toLowerCase();
  if (containsAny(text, ['>100', '100>', 'aberto ao público', '20–200', '12 - 120'])) return 'Grande';
  if (containsAny(text, ['20-60', '20–60', '15–40', '10-30', '10–30', '30–80', '20-200', '10-50', '12-25'])) return 'Média';
  return 'Pequena';
}

function methodInputProfile(method: MethodRecord): 'Qualitativo' | 'Quantitativo' | 'Misto' {
  const text = `${method.name} ${method.shortDescription} ${method.objectiveText} ${method.deliverables}`.toLowerCase();

  if (containsAny(text, ['entrevista', 'grupo focal', 'etnográ', 'observação', 'photovoice', 'roda de conversa'])) return 'Qualitativo';
  if (containsAny(text, ['mapa', 'crowd', 'social listening', 'instalação', 'pesquisa', 'hub', 'veedur', 'base', 'painel deliberativo'])) return 'Misto';
  return 'Misto';
}

function formatMatches(state: AppState, method: MethodRecord): boolean {
  const format = method.format.toLowerCase();
  if (!state.modality) return true;
  if (state.modality === 'Digital') return format.includes('online') || format.includes('híbrido');
  if (state.modality === 'Presencial') return format.includes('presencial') || format.includes('híbrido');
  if (state.modality === 'Mediada/Híbrida') return format.includes('híbrido') || format.includes('online');
  if (state.modality === 'No território') return format.includes('presencial') || format.includes('híbrido');
  return true;
}

function focusKeywords(focus: string): string[] {
  const mapping: Record<string, string[]> = {
    'Tradução, clareza e design de informação.': ['clareza', 'design', 'leitura', 'feedback', 'informação'],
    'Mapeamento de fricções e interfaces, uso de redes de confiança.': ['território', 'mapa', 'fricç', 'redes', 'organizações', 'intermediado'],
    'Empatia, sentimento e experiência vivida (etnografia).': ['experiência', 'vivida', 'etnogr', 'jornada', 'observação', 'relatos'],
    'Percepção de prioridades, trade-offs e valor público.': ['prioridades', 'delibera', 'trade', 'valor público', 'julgamento'],
    'Impacto local, segurança e vigilância comunitária.': ['território', 'local', 'segurança', 'vigilância', 'monitoramento'],
    'Tornar visíveis as barreiras invisíveis, inclusive as simbólicas e relacionais, produzindo insumos que expliquem o que os números não contam e apontem pontos de atrito concretos na prestação do serviço.': ['barreiras', 'experiência', 'jornada', 'fotograf', 'observação', 'fricç'],
  };
  return mapping[focus] ?? [];
}

function methodSupportsRecruitment(state: AppState, method: MethodRecord): boolean {
  const text = `${method.name} ${method.shortDescription} ${method.whenToUse}`.toLowerCase();
  if (state.recruitmentMode === 'Loteria cívica') {
    return containsAny(text, ['loteria', 'júri', 'deliberativo', 'painel']);
  }
  if (state.recruitmentMode === 'Chamamento aberto') {
    return containsAny(text, ['aberto', 'crowd', 'plataforma', 'hub', 'social listening', 'instalação']) || methodScale(method) === 'Grande';
  }
  if (state.recruitmentMode === 'Chamamento fechado') {
    return methodScale(method) !== 'Grande';
  }
  return true;
}

function sampleCompatible(state: AppState, method: MethodRecord): boolean {
  const scale = methodScale(method);
  if (state.sampleSize === 'Até 50 respostas') return scale === 'Pequena' || scale === 'Média';
  if (state.sampleSize === '50 a 300 respostas') return scale === 'Média' || scale === 'Grande';
  if (state.sampleSize === 'Mais de 300 respostas') return scale === 'Grande';
  return true;
}

function digitalPenalty(state: AppState, method: MethodRecord): boolean {
  const onlineOnly = method.format.toLowerCase().includes('online');
  const lowDigitalAccess = state.internetAccess === 'Não' || state.digitalLiteracy === 'Não' || state.computerAccess === 'Não';
  return onlineOnly && lowDigitalAccess;
}

function capabilityPenalty(state: AppState, method: MethodRecord): string[] {
  const text = `${method.name} ${method.skills} ${method.shortDescription}`.toLowerCase();
  const penalties: string[] = [];
  if (state.canConductInterviews === 'Não' && containsAny(text, ['entrevista'])) penalties.push('Exige entrevistas individuais e a equipe informou que não consegue conduzi-las.');
  if (state.canFacilitateGroups === 'Não' && containsAny(text, ['grupo', 'júri', 'roda', 'café', 'hackathon', 'deliberativo', 'focal'])) penalties.push('Depende de facilitação de grupos e a equipe informou restrição nessa capacidade.');
  if (state.hasFacilitationExperience === 'Não' && containsAny(text, ['facilita', 'etnogr', 'deliberativo', 'living lab', 'photovoice'])) penalties.push('Demanda facilitação qualificada e a equipe informou experiência limitada.');
  if (state.canAnalyzeLargeVolumes === 'Não' && methodScale(method) === 'Grande') penalties.push('Tende a gerar grande volume de contribuições e a equipe informou restrição analítica.');
  return penalties;
}

function oecdMatches(state: AppState, method: MethodRecord): string[] {
  const methodOecd = splitList(method.oecd);
  return state.oecdTypes.filter((item) => methodOecd.includes(item.replace(/\.$/, '')));
}

function ideoMatches(state: AppState, method: MethodRecord): string[] {
  const methodIdeo = splitList(method.ideo);
  return state.ideoTypes.filter((item) => methodIdeo.includes(item));
}

function scoreMethod(state: AppState, method: MethodRecord): RecommendationResult {
  let score = 0;
  const reasons: string[] = [];
  const cautions: string[] = [];

  if (state.forcedRecommendation && method.name.toLowerCase().includes(state.forcedRecommendation.toLowerCase())) {
    score += 1000;
    reasons.push('Recomendação forçada por risco não mitigável identificado no quiz.');
  }

  const ideo = ideoMatches(state, method);
  if (ideo.length) {
    score += 18 * ideo.length;
    reasons.push(`Compatível com a etapa da auditoria (${ideo.join(', ')}).`);
  }

  const oecd = oecdMatches(state, method);
  if (oecd.length) {
    score += 14 * oecd.length;
    reasons.push(`Compatível com a tipologia OCDE definida (${oecd.join(', ')}).`);
  }

  if (formatMatches(state, method)) {
    score += 12;
    reasons.push(`Formato compatível com a modalidade desejada (${state.modality || method.format}).`);
  } else {
    score -= 8;
    cautions.push(`Formato potencialmente desalinhado com a modalidade derivada (${state.modality}).`);
  }

  const keywords = focusKeywords(state.focusOfListening);
  const combinedText = `${method.objectiveText} ${method.shortDescription} ${method.whenToUse}`;
  const focusHits = keywords.filter((keyword) => combinedText.toLowerCase().includes(keyword.toLowerCase()));
  if (focusHits.length) {
    score += Math.min(16, focusHits.length * 4);
    reasons.push(`Dialoga com o foco da escuta (${state.focusOfListening}).`);
  }

  if (state.objective && combinedText.toLowerCase().includes(state.objective.toLowerCase().split(' ')[0])) {
    score += 4;
  }

  if (state.timeLevel) {
    const compatible = durationLevel(method.duration) === state.timeLevel || state.timeLevel === 'Alto';
    if (compatible) {
      score += 8;
      reasons.push(`Prazo compatível com o tempo disponível (${state.timeLevel}).`);
    } else {
      score -= 5;
      cautions.push(`Pode exigir mais tempo do que o disponível.`);
    }
  }

  if (state.inputType) {
    const profile = methodInputProfile(method);
    if (state.inputType === 'Qualitativo' && profile === 'Qualitativo') {
      score += 12;
      reasons.push('Adequado para aprofundamento qualitativo.');
    }
    if (state.inputType === 'Quantitativo' && (profile === 'Quantitativo' || profile === 'Misto')) {
      score += 10;
      reasons.push('Consegue produzir sinais em escala ou dados estruturados.');
    }
    if (state.inputType === 'Qualitativo + Quantitativo' && profile === 'Misto') {
      score += 12;
      reasons.push('Consegue combinar escala e interpretação.');
    }
  }

  if (state.sampleSize && sampleCompatible(state, method)) {
    score += 8;
    reasons.push(`Compatível com a escala de participação desejada (${state.sampleSize}).`);
  }

  if (state.depthLevel === 'Alto' && containsAny(method.name.toLowerCase(), ['entrevista', 'etnográ', 'observação', 'photovoice'])) {
    score += 10;
    reasons.push('Compatível com alta profundidade de escuta.');
  }

  if (state.recruitmentMode && methodSupportsRecruitment(state, method)) {
    score += 6;
    reasons.push(`Ajusta-se ao modo de seleção (${state.recruitmentMode}).`);
  }

  if (state.isVulnerableGroup === 'Sim' && containsAny(`${method.targetAudience} ${method.objectiveText}`.toLowerCase(), ['vulner', 'fragilidade', 'território', 'experiência', 'usuári'])) {
    score += 6;
    reasons.push('Tem aderência a público vulnerabilizado ou fortemente afetado.');
  }

  if (digitalPenalty(state, method)) {
    score -= 12;
    cautions.push('Depende fortemente de ambiente online, mas o público indicou barreiras de acesso ou letramento digital.');
  }

  if (isFullyDigitalForbidden(state) && method.format.toLowerCase().includes('online') && !method.format.toLowerCase().includes('híbrido')) {
    score -= 30;
    cautions.push('Método integralmente digital foi despriorizado: o público tem letramento digital baixo/parcial e não possui acesso adequado a computadores.');
  }

  const penalties = capabilityPenalty(state, method);
  if (penalties.length) {
    score -= penalties.length * 6;
    cautions.push(...penalties);
  }

  if (state.riskNegativeConsequences === 'Sim' && containsAny(method.risks.toLowerCase(), ['privacidade', 'exposição', 'reidentificação'])) {
    cautions.push('Exige salvaguardas adicionais de privacidade e proteção contra exposição.');
  }

  return { method, score, reasons: Array.from(new Set(reasons)), cautions: Array.from(new Set(cautions)) };
}

export function getRecommendations(state: AppState): RecommendationResult[] {
  return (methods as unknown as MethodRecord[])
    .map((method) => scoreMethod(state, method))
    .sort((a, b) => b.score - a.score);
}
