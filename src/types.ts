export type AuditStage =
  | 'Seleção'
  | 'Planejamento'
  | 'Execução'
  | 'Análise'
  | 'Elaboração de Relatório'
  | 'Divulgação'
  | 'Monitoramento';

export type RecruitmentMode = 'Chamamento fechado' | 'Chamamento aberto' | 'Loteria cívica';
export type Modality = 'Presencial' | 'No território' | 'Mediada/Híbrida' | 'Digital';
export type InputType = 'Quantitativo' | 'Qualitativo' | 'Qualitativo + Quantitativo';
export type DepthLevel = 'Baixo' | 'Médio' | 'Alto';
export type TimeLevel = 'Baixo' | 'Médio' | 'Alto';
export type ScaleType = 'Geral' | 'Localizada';

export interface ProblemResponses {
  problemaClaramenteDefinido: string;
  haConsensoEntreAtores: string;
  haCertezaQuantoNatureza: string;
  problemaPermaneceMesmo: string;
  haSolucoesAceitas: string;
  haExperienciaPrevia: string;
  problemasMenoresQuePublicoAjuda: string;
  oQueQuerAprender: string;
  expectativaAoEnvolverCidadaos: string;
  desafioEspecificoParticipantes: string;
}

export interface MethodRecord {
  id: string;
  name: string;
  ideo: string;
  oecd: string;
  shortDescription: string;
  objectiveText: string;
  whenToUse: string;
  whenNotToUse: string;
  targetAudience: string;
  risks: string;
  effort: string;
  skills: string;
  tags: string;
  groupSize: string;
  deliverables: string;
  duration: string;
  format: string;
}

export interface RecommendationResult {
  method: MethodRecord;
  score: number;
  reasons: string[];
  cautions: string[];
}

export interface AppState {
  canParticipationHelp: '' | 'Sim' | 'Não';
  problemResponses: ProblemResponses;
  mainPain: string;
  focusOfListening: string;
  auditStage: '' | AuditStage;
  ideoTypes: string[];

  objective: string;
  oecdTypes: string[];
  expectedEvidence: string;
  perceptionsToCollect: string;
  coherenceCheck: '' | 'Sim' | 'Não';

  impactedPerson: string;
  isDirectUser: '' | 'Usuária direta' | 'Intermediária';
  policyService: string;
  isVulnerableGroup: '' | 'Sim' | 'Não';
  dependsOnPolicy: '' | 'Sim' | 'Não';
  journeyStage: string;
  stateContactMode: '' | 'Presencial' | 'Digital' | 'Por intermediários' | 'Misto';
  internetAccess: '' | 'Sim' | 'Não' | 'Parcial';
  digitalLiteracy: '' | 'Sim' | 'Não' | 'Parcial';
  understandsInstitutionalLanguage: '' | 'Sim' | 'Não' | 'Parcial';
  accessBarriers: string;
  hasOtherPublics: '' | 'Sim' | 'Não';
  desiredScale: '' | ScaleType;
  recruitmentMode: '' | RecruitmentMode;

  canGatherInSamePlace: '' | 'Sim' | 'Não';
  canTravelToTerritory: '' | 'Sim' | 'Não';
  canUseDigitalWithLowExclusion: '' | 'Sim' | 'Não';
  hasLocalPartners: '' | 'Sim' | 'Não';
  modality: '' | Modality;

  needOwnPlatform: '' | 'Sim' | 'Não';
  needThirdPartyTech: '' | 'Sim' | 'Não';
  willUseOpenSource: '' | 'Sim' | 'Não';
  willLeaveLegacy: '' | 'Sim' | 'Não';

  hasFacilitationExperience: '' | 'Sim' | 'Não';
  canAnalyzeLargeVolumes: '' | 'Sim' | 'Não';
  canFacilitateGroups: '' | 'Sim' | 'Não';
  canConductInterviews: '' | 'Sim' | 'Não';

  availableTime: '' | 'Até 2 semanas' | '3 a 8 semanas' | 'Mais de 8 semanas';
  timeLevel: '' | TimeLevel;

  inputNeed: string;
  inputType: '' | InputType;
  sampleSize: '' | 'Até 50 respostas' | '50 a 300 respostas' | 'Mais de 300 respostas';
  mixedPriority: '' | 'Escala' | 'Profundidade';
  depthLevel: '' | DepthLevel;

  riskNegativeConsequences: '' | 'Sim' | 'Não';
  dependsOnEvaluatedInstitution: '' | 'Sim' | 'Não';
  mayExposeSensitiveSituations: '' | 'Sim' | 'Não';
  canMitigateRisk: '' | 'Sim' | 'Não';

  forcedRecommendation: string;
}
