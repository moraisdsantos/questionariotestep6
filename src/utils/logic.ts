import type { AppState, AuditStage, InputType, Modality, TimeLevel } from '../types';

export function mapPainToFocus(mainPain: string): string {
  const mapping: Record<string, string> = {
    'O cidadão não entende o que o Estado diz (ex.: relatórios contábeis, juridiquês)': 'Tradução, clareza e design de informação.',
    'O problema é complexo e envolve múltiplos atores (agências, concessionárias) onde o TCU está distante da ponta': 'Mapeamento de fricções e interfaces, uso de redes de confiança.',
    'O serviço existe no papel, mas falha na entrega humana (ex.: fila do SUS, burocracia do benefício)': 'Empatia, sentimento e experiência vivida (etnografia).',
    'Temas áridos ou macroeconômicos onde o cidadão não vê conexão direta com sua vida (ex.: contas de governo)': 'Percepção de prioridades, trade-offs e valor público.',
    'O impacto é concentrado geograficamente ou envolve cadeias longas de exploração (ex.: mineração, barragens)': 'Impacto local, segurança e vigilância comunitária.',
    'O dado não explica o sofrimento real: indicadores e relatórios mostram quantos atendimentos, quanto tempo médio, quantas demandas, mas não mostram a experiência do cidadão': 'Tornar visíveis as barreiras invisíveis, inclusive as simbólicas e relacionais, produzindo insumos que expliquem o que os números não contam e apontem pontos de atrito concretos na prestação do serviço.',
  };

  return mapping[mainPain] ?? '';
}

export function mapAuditStageToIdeo(stage: AuditStage | ''): string[] {
  if (!stage) return [];

  const mapping: Record<AuditStage, string[]> = {
    Seleção: ['Inspiração'],
    Planejamento: ['Inspiração'],
    Execução: ['Ideação'],
    Análise: ['Ideação', 'Implementação'],
    'Elaboração de Relatório': ['Implementação'],
    Divulgação: ['Implementação'],
    Monitoramento: ['Implementação', 'Ideação'],
  };

  return mapping[stage];
}

export function mapObjectiveToOecd(objective: string): string[] {
  const mapping: Record<string, string[]> = {
    'Informar, sem espaço para influência': ['Tipo 1: Acesso à Informação e Transparência Ativa'],
    'Co-criar soluções e protótipos': ['Tipo 3: Monitoramento Cívico e Ciência Cidadã', 'Tipo 5: Inovação Aberta e Co-criação'],
    'Julgamento coletivo informado': ['Tipo 2: Consultas Públicas e Diálogo', 'Tipo 4: Processos Deliberativos e de Priorização'],
    'Coletar e analisar dados de políticas/serviços': ['Tipo 3: Monitoramento Cívico e Ciência Cidadã', 'Tipo 5: Inovação Aberta e Co-criação'],
    'Coletar opiniões e feedback em escala': ['Tipo 2: Consultas Públicas e Diálogo', 'Tipo 3: Monitoramento Cívico e Ciência Cidadã', 'Tipo 4: Processos Deliberativos e de Priorização'],
    'Deliberar sobre prioridades': ['Tipo 2: Consultas Públicas e Diálogo', 'Tipo 4: Processos Deliberativos e de Priorização'],
    'Acompanhar execução/qualidade': ['Tipo 3: Monitoramento Cívico e Ciência Cidadã', 'Tipo 5: Inovação Aberta e Co-criação'],
    'Acessar a jornada e experiência do usuário': ['Tipo 6: Imersão e Experiência do Usuário'],
  };

  return mapping[objective] ?? [];
}

export function deriveModality(state: AppState): Modality | '' {
  if (!state.canGatherInSamePlace) return '';

  if (state.canGatherInSamePlace === 'Sim') return 'Presencial';

  if (state.canTravelToTerritory === 'Sim') {
    if (state.canUseDigitalWithLowExclusion === 'Não') return 'No território';
    if (state.canUseDigitalWithLowExclusion === 'Sim') return 'Mediada/Híbrida';
    return '';
  }

  if (state.canTravelToTerritory === 'Não') {
    if (state.hasLocalPartners === 'Não') return 'Digital';
    if (state.hasLocalPartners === 'Sim') {
      if (state.canUseDigitalWithLowExclusion === 'Sim') return 'Mediada/Híbrida';
      if (state.canUseDigitalWithLowExclusion === 'Não') return 'No território';
    }
  }

  return '';
}

export function deriveTimeLevel(availableTime: AppState['availableTime']): TimeLevel | '' {
  const mapping: Record<Exclude<AppState['availableTime'], ''>, TimeLevel> = {
    'Até 2 semanas': 'Baixo',
    '3 a 8 semanas': 'Médio',
    'Mais de 8 semanas': 'Alto',
  };

  return availableTime ? mapping[availableTime] : '';
}

export function deriveInputType(inputNeed: string): InputType | '' {
  if (inputNeed === 'Identificar padrões, frequência ou distribuição do problema') return 'Quantitativo';
  if (inputNeed === 'Mapear padrões e também compreender experiências') return 'Qualitativo + Quantitativo';
  if (inputNeed === 'Compreender experiências, percepções ou causas do problema') return 'Qualitativo';
  return '';
}

export function deriveDepthLevel(detailNeed: string): AppState['depthLevel'] {
  const mapping: Record<string, AppState['depthLevel']> = {
    'Relatos curtos ou comentários': 'Baixo',
    'Conversa estruturada sobre a experiência': 'Médio',
    'Compreensão detalhada da jornada e do contexto': 'Alto',
  };

  return mapping[detailNeed] ?? '';
}

export function summarizeProblem(state: AppState): string {
  const values = Object.values(state.problemResponses).filter(Boolean);
  if (!values.length) return '';
  return `Problema qualificado a partir de ${values.length} respostas abertas. A síntese deverá considerar definição do problema, grau de consenso, estabilidade, existência de soluções conhecidas, experiência prévia, subproblemas abordáveis, lacunas de aprendizagem e expectativa quanto ao papel da participação cidadã.`;
}

export function hasSensitiveRisk(state: AppState): boolean {
  return (
    state.riskNegativeConsequences === 'Sim' ||
    state.dependsOnEvaluatedInstitution === 'Sim' ||
    state.mayExposeSensitiveSituations === 'Sim'
  );
}

export function deriveForcedRecommendation(state: AppState): string {
  if (hasSensitiveRisk(state) && state.canMitigateRisk === 'Não') {
    return 'Entrevista em profundidade';
  }
  return '';
}
