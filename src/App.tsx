import { useMemo, useState } from 'react';
import { Field } from './components/Field';
import { ProgressBar } from './components/ProgressBar';
import { StepCard } from './components/StepCard';
import { auditStageOptions, inputNeedOptions, objectiveOptions, painOptions } from './data/options';
import type { AppState, ProblemResponses } from './types';
import { getRecommendations } from './utils/recommendation';
import {
  deriveForcedRecommendation,
  deriveInputType,
  deriveModality,
  deriveTimeLevel,
  isFullyDigitalForbidden,
  mapAuditStageToIdeo,
  mapObjectiveToOecd,
  mapPainToFocus,
  summarizeProblem,
} from './utils/logic';

const yesNoOptions = ['Sim', 'Não'] as const;

const initialProblemResponses: ProblemResponses = {
  problemaClaramenteDefinido: '',
  haConsensoEntreAtores: '',
  haCertezaQuantoNatureza: '',
  problemaPermaneceMesmo: '',
  haSolucoesAceitas: '',
  haExperienciaPrevia: '',
  problemasMenoresQuePublicoAjuda: '',
  oQueQuerAprender: '',
  expectativaAoEnvolverCidadaos: '',
  desafioEspecificoParticipantes: '',
};

const initialState: AppState = {
  canParticipationHelp: '',
  problemResponses: initialProblemResponses,
  mainPain: '',
  focusOfListening: '',
  auditStage: '',
  ideoTypes: [],
  objective: '',
  oecdTypes: [],
  expectedEvidence: '',
  perceptionsToCollect: '',
  coherenceCheck: '',
  isDirectUser: '',
  policyService: '',
  isVulnerableGroup: '',
  dependsOnPolicy: '',
  journeyStage: '',
  stateContactMode: '',
  internetAccess: '',
  computerAccess: '',
  digitalLiteracy: '',
  understandsInstitutionalLanguage: '',
  accessBarriers: '',
  desiredScale: '',
  recruitmentMode: '',
  canGatherInSamePlace: '',
  canTravelToTerritory: '',
  canUseDigitalWithLowExclusion: '',
  hasLocalPartners: '',
  modality: '',
  needOwnPlatform: '',
  needThirdPartyTech: '',
  willUseOpenSource: '',
  willLeaveLegacy: '',
  hasFacilitationExperience: '',
  canAnalyzeLargeVolumes: '',
  canFacilitateGroups: '',
  canConductInterviews: '',
  availableTime: '',
  timeLevel: '',
  inputNeed: '',
  inputType: '',
  sampleSize: '',
  mixedPriority: '',
  depthLevel: '',
  riskNegativeConsequences: '',
  dependsOnEvaluatedInstitution: '',
  mayExposeSensitiveSituations: '',
  canMitigateRisk: '',
  forcedRecommendation: '',
};

const totalSteps = 9;

const variableLinks = [
  ['Foco da escuta', 'Objetivo'],
  ['Tipologia IDEO', 'Etapa Design (IDEO)'],
  ['Tipologia OCDE', 'Tipologia (OCDE)'],
  ['Modalidade', 'Formato'],
  ['Tempo disponível / nível de tempo', 'Duração'],
  ['Escala / amostra', 'Tamanho do Grupo'],
  ['Capacidades da equipe', 'Habilidades Necessárias'],
  ['Riscos e barreiras', 'Riscos e Limitações'],
] as const;

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [step, setStep] = useState(1);
  const [qualitativeDetail, setQualitativeDetail] = useState('');

  const problemSummary = useMemo(() => summarizeProblem(state), [state]);
  const recommendations = useMemo(() => getRecommendations(state), [state]);
  const topRecommendations = recommendations.slice(0, 5);
  const digitalOnlyForbidden = useMemo(() => isFullyDigitalForbidden(state), [state]);

  const updateState = <K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((current) => {
      const next = { ...current, [key]: value };

      if (key === 'mainPain') next.focusOfListening = mapPainToFocus(value as string);
      if (key === 'auditStage') next.ideoTypes = mapAuditStageToIdeo(value as AppState['auditStage']);
      if (key === 'objective') next.oecdTypes = mapObjectiveToOecd(value as string);

      if (
        ['canGatherInSamePlace', 'canTravelToTerritory', 'canUseDigitalWithLowExclusion', 'hasLocalPartners', 'digitalLiteracy', 'computerAccess'].includes(
          String(key),
        )
      ) {
        next.modality = deriveModality(next);
      }

      if (key === 'availableTime') next.timeLevel = deriveTimeLevel(value as AppState['availableTime']);

      if (key === 'inputNeed') {
        next.inputType = deriveInputType(value as string);
        next.sampleSize = '';
        next.mixedPriority = '';
        next.depthLevel = '';
      }

      if (['riskNegativeConsequences', 'dependsOnEvaluatedInstitution', 'mayExposeSensitiveSituations', 'canMitigateRisk'].includes(String(key))) {
        next.forcedRecommendation = deriveForcedRecommendation(next);
      }

      return next;
    });
  };

  const updateProblem = (key: keyof ProblemResponses, value: string) => {
    setState((current) => ({
      ...current,
      problemResponses: {
        ...current.problemResponses,
        [key]: value,
      },
    }));
  };

  const canGoNext = useMemo(() => {
    if (step === 1) return state.canParticipationHelp !== '';
    if (step === 2) return state.mainPain !== '' && state.auditStage !== '';
    if (step === 3) return state.objective !== '' && state.perceptionsToCollect.trim() !== '' && state.coherenceCheck === 'Sim';
    if (step === 4) {
      return (
        state.isDirectUser !== '' &&
        state.policyService.trim() !== '' &&
        state.isVulnerableGroup !== '' &&
        state.dependsOnPolicy !== '' &&
        state.journeyStage.trim() !== '' &&
        state.stateContactMode !== '' &&
        state.internetAccess !== '' &&
        state.computerAccess !== '' &&
        state.digitalLiteracy !== '' &&
        state.understandsInstitutionalLanguage !== '' &&
        state.accessBarriers !== '' &&
        state.desiredScale !== '' &&
        state.recruitmentMode !== ''
      );
    }
    if (step === 5) return state.canGatherInSamePlace !== '' && state.modality !== '';
    if (step === 6) {
      return (
        state.hasFacilitationExperience !== '' &&
        state.canAnalyzeLargeVolumes !== '' &&
        state.canFacilitateGroups !== '' &&
        state.canConductInterviews !== '' &&
        state.availableTime !== ''
      );
    }
    if (step === 7) {
      if (state.inputType === 'Quantitativo') return state.sampleSize !== '';
      if (state.inputType === 'Qualitativo + Quantitativo') return state.mixedPriority !== '';
      if (state.inputType === 'Qualitativo') return state.depthLevel !== '';
      return state.inputNeed !== '';
    }
    if (step === 8) {
      const baseAnswered =
        state.riskNegativeConsequences !== '' && state.dependsOnEvaluatedInstitution !== '' && state.mayExposeSensitiveSituations !== '';
      if (!baseAnswered) return false;
      const anyRisk =
        state.riskNegativeConsequences === 'Sim' ||
        state.dependsOnEvaluatedInstitution === 'Sim' ||
        state.mayExposeSensitiveSituations === 'Sim';
      return anyRisk ? state.canMitigateRisk !== '' : true;
    }
    return true;
  }, [state, step]);

  const next = () => {
    if (step === 3 && state.coherenceCheck === 'Não') return;
    if (step < totalSteps) setStep((current) => current + 1);
  };

  const previous = () => setStep((current) => Math.max(1, current - 1));

  const reset = () => {
    setState(initialState);
    setQualitativeDetail('');
    setStep(1);
  };

  const setDepthFromDetail = (value: string) => {
    setQualitativeDetail(value);
    let depthLevel: AppState['depthLevel'] = '';
    if (value === 'Relatos curtos ou comentários') depthLevel = 'Baixo';
    if (value === 'Conversa estruturada sobre a experiência') depthLevel = 'Médio';
    if (value === 'Compreensão detalhada da jornada e do contexto') depthLevel = 'Alto';
    updateState('depthLevel', depthLevel);
  };

  const binaryProblemField = (key: keyof ProblemResponses, label: string) => (
    <Field label={label}>
      <div className="binary-row">
        {yesNoOptions.map((option) => (
          <label key={`${key}-${option}`} className="binary-option">
            <input
              type="radio"
              name={key}
              checked={state.problemResponses[key] === option}
              onChange={() => updateProblem(key, option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </Field>
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Toolkit de Escuta Cidadã</p>
          <h1>Quiz de decisão para auditorias</h1>
          <p className="hero-copy">Projeto pronto em React + Vite, com fluxo condicional baseado no algoritmo de linguagem natural e preparado para GitHub Pages.</p>
        </div>
      </header>

      <main className="main-grid">
        <aside className="sidebar-card">
          <ProgressBar current={step} total={totalSteps} />
          <h3>Saídas parciais</h3>
          <ul className="summary-list">
            <li><strong>Foco da escuta:</strong> {state.focusOfListening || '—'}</li>
            <li><strong>Tipologia IDEO:</strong> {state.ideoTypes.join(', ') || '—'}</li>
            <li><strong>Tipologia OCDE:</strong> {state.oecdTypes.join(', ') || '—'}</li>
            <li><strong>Modalidade:</strong> {state.modality || '—'}</li>
            <li><strong>Tipo de insumo:</strong> {state.inputType || '—'}</li>
            <li><strong>Recomendação forçada:</strong> {state.forcedRecommendation || '—'}</li>
            <li><strong>Top método:</strong> {topRecommendations[0]?.method.name || '—'}</li>
          </ul>

          <div className="trace-box small-trace">
            <p className="trace-title">Variáveis definidas e conexão com a ficha técnica</p>
            <ul className="trace-list">
              <li>Foco: {state.focusOfListening || '—'} → Objetivo</li>
              <li>IDEO: {state.ideoTypes.join(', ') || '—'} → Etapa Design</li>
              <li>OCDE: {state.oecdTypes.join(', ') || '—'} → Tipologia OCDE</li>
              <li>Modalidade: {state.modality || '—'} → Formato</li>
              <li>Tempo: {state.timeLevel || '—'} → Duração</li>
              <li>Escala: {state.sampleSize || state.desiredScale || '—'} → Tamanho do grupo</li>
              <li>Capacidades → Habilidades necessárias</li>
              <li>Riscos/barreiras → Riscos e limitações</li>
            </ul>
          </div>
        </aside>

        <section>
          {step === 1 && (
            <StepCard title="Eixo 1 — Pertinência da participação social" subtitle="Verifica se a escuta cidadã é aplicável ao caso.">
              <Field label="A participação social pode auxiliar na auditoria do problema?">
                <select value={state.canParticipationHelp} onChange={(e) => updateState('canParticipationHelp', e.target.value as AppState['canParticipationHelp'])}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </Field>

              {state.canParticipationHelp === 'Não' && <div className="alert warning">O fluxo é encerrado porque a escuta cidadã foi considerada não pertinente para este problema.</div>}
              {state.canParticipationHelp === 'Sim' && <div className="alert success">A escuta cidadã foi considerada pertinente. O fluxo segue para a qualificação do problema.</div>}
            </StepCard>
          )}

          {step === 2 && (
            <StepCard title="Qualificação do problema e definição do foco" subtitle="As 6 primeiras perguntas foram convertidas em respostas de sim ou não; os demais campos seguem abertos para síntese do problema.">
              <div className="two-columns">
                {binaryProblemField('problemaClaramenteDefinido', 'O problema que você está enfrentando está claramente definido?')}
                {binaryProblemField('haConsensoEntreAtores', 'Há consenso sobre o problema entre diferentes atores?')}
                {binaryProblemField('haCertezaQuantoNatureza', 'Há certeza quanto à natureza do problema?')}
                {binaryProblemField('problemaPermaneceMesmo', 'É provável que o problema permaneça o mesmo ao longo do processo de solução?')}
                {binaryProblemField('haSolucoesAceitas', 'Existem soluções já existentes e amplamente aceitas?')}
                {binaryProblemField('haExperienciaPrevia', 'Há experiência prévia no enfrentamento desse problema?')}
                <Field label="Se o problema ou desafio for amplo, quais são alguns dos problemas menores que o público pode ajudar a abordar?">
                  <textarea value={state.problemResponses.problemasMenoresQuePublicoAjuda} onChange={(e) => updateProblem('problemasMenoresQuePublicoAjuda', e.target.value)} />
                </Field>
                <Field label="O que você quer aprender com os participantes que você ainda não sabe?">
                  <textarea value={state.problemResponses.oQueQuerAprender} onChange={(e) => updateProblem('oQueQuerAprender', e.target.value)} />
                </Field>
                <Field label="O que você espera ao envolver cidadãos? Ideias, soluções, opiniões, feedback?">
                  <textarea value={state.problemResponses.expectativaAoEnvolverCidadaos} onChange={(e) => updateProblem('expectativaAoEnvolverCidadaos', e.target.value)} />
                </Field>
                <Field label="Que problema ou desafio específico os participantes ajudarão a resolver?">
                  <textarea value={state.problemResponses.desafioEspecificoParticipantes} onChange={(e) => updateProblem('desafioEspecificoParticipantes', e.target.value)} />
                </Field>
                <Field label="Qual é a principal dor que justifica a escuta?">
                  <select value={state.mainPain} onChange={(e) => updateState('mainPain', e.target.value)}>
                    <option value="">Selecione</option>
                    {painOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Qual é a etapa da auditoria?">
                  <select value={state.auditStage} onChange={(e) => updateState('auditStage', e.target.value as AppState['auditStage'])}>
                    <option value="">Selecione</option>
                    {auditStageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
              </div>

              <div className="derived-box">
                <p><strong>Tipo de problema:</strong> {problemSummary || '—'}</p>
                <p><strong>Foco da escuta:</strong> {state.focusOfListening || '—'}</p>
                <p><strong>Tipologia IDEO:</strong> {state.ideoTypes.join(', ') || '—'}</p>
              </div>
            </StepCard>
          )}

          {step === 3 && (
            <StepCard title="Objetivo da escuta e evidências esperadas" subtitle="Define tipologia OCDE, percepções a coletar e coerência com a dor identificada.">
              <div className="two-columns">
                <Field label="Qual é o objetivo da escuta?" hint="Defina as expectativas da escuta: quais dados ou evidências tangíveis serão obtidas?">
                  <select value={state.objective} onChange={(e) => updateState('objective', e.target.value)}>
                    <option value="">Selecione</option>
                    {objectiveOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Quais percepções serão coletadas?" hint="Ex.: respostas sim/não, relatos escritos, relatos verbais, fotografias, mapas, prioridades.">
                  <textarea value={state.perceptionsToCollect} onChange={(e) => updateState('perceptionsToCollect', e.target.value)} />
                </Field>
              </div>

              <Field label="A percepção esperada comunica com a dor e o foco da escuta estabelecido na etapa 1?">
                <select value={state.coherenceCheck} onChange={(e) => updateState('coherenceCheck', e.target.value as AppState['coherenceCheck'])}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </Field>

              {state.coherenceCheck === 'Não' && <div className="alert warning">Reavalie o objetivo da escuta. O fluxo só avança quando houver coerência entre dor, foco e percepção esperada.</div>}

              <div className="derived-box">
                <p><strong>Tipologia OCDE:</strong> {state.oecdTypes.join(', ') || '—'}</p>
              </div>
            </StepCard>
          )}

          {step === 4 && (
            <StepCard title="Perfil social, jornada e barreiras" subtitle="Delimita o público, o ponto da jornada e as restrições de acesso.">
              <div className="two-columns">
                <Field label="O público é usuário direto do serviço ou atua como intermediário?">
                  <select value={state.isDirectUser} onChange={(e) => updateState('isDirectUser', e.target.value as AppState['isDirectUser'])}>
                    <option value="">Selecione</option>
                    <option value="Usuário direto">Usuário direto</option>
                    <option value="Intermediário">Intermediário</option>
                  </select>
                </Field>
                <Field label="Em qual política, programa ou serviço esse público interage com o Estado?">
                  <textarea value={state.policyService} onChange={(e) => updateState('policyService', e.target.value)} />
                </Field>
                <Field label="Esse público integra grupo historicamente vulnerabilizado?">
                  <select value={state.isVulnerableGroup} onChange={(e) => updateState('isVulnerableGroup', e.target.value as AppState['isVulnerableGroup'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="Esse público depende fortemente da política pública analisada?">
                  <select value={state.dependsOnPolicy} onChange={(e) => updateState('dependsOnPolicy', e.target.value as AppState['dependsOnPolicy'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="Em que etapa da jornada da cidadã a escuta deve ocorrer?">
                  <input value={state.journeyStage} onChange={(e) => updateState('journeyStage', e.target.value)} placeholder="Ex.: cadastro, solicitação, atendimento, recurso" />
                </Field>
                <Field label="Como ocorre o contato com o Estado?">
                  <select value={state.stateContactMode} onChange={(e) => updateState('stateContactMode', e.target.value as AppState['stateContactMode'])}>
                    <option value="">Selecione</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Digital">Digital</option>
                    <option value="Por intermediários">Por intermediários</option>
                    <option value="Misto">Misto</option>
                  </select>
                </Field>
                <Field label="O público possui acesso regular à internet ou a dispositivos digitais?">
                  <select value={state.internetAccess} onChange={(e) => updateState('internetAccess', e.target.value as AppState['internetAccess'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Parcial">Parcial</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="O público tem acesso a computadores para responder online com autonomia?">
                  <select value={state.computerAccess} onChange={(e) => updateState('computerAccess', e.target.value as AppState['computerAccess'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Parcial">Parcial</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="O letramento digital é suficiente para responder questionários online ou usar aplicativos?">
                  <select value={state.digitalLiteracy} onChange={(e) => updateState('digitalLiteracy', e.target.value as AppState['digitalLiteracy'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Parcial">Parcial</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="Há facilidade para compreender linguagem institucional ou técnica?">
                  <select value={state.understandsInstitutionalLanguage} onChange={(e) => updateState('understandsInstitutionalLanguage', e.target.value as AppState['understandsInstitutionalLanguage'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Parcial">Parcial</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="Existem barreiras linguísticas, educacionais, culturais ou territoriais relevantes?">
                  <select value={state.accessBarriers} onChange={(e) => updateState('accessBarriers', e.target.value as AppState['accessBarriers'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="O problema afeta muitas pessoas em diferentes territórios ou um grupo específico em contexto delimitado?">
                  <select value={state.desiredScale} onChange={(e) => updateState('desiredScale', e.target.value as AppState['desiredScale'])}>
                    <option value="">Selecione</option><option value="Geral">Geral</option><option value="Localizada">Localizada</option>
                  </select>
                </Field>
                <Field label="Como o público será selecionado?">
                  <select value={state.recruitmentMode} onChange={(e) => updateState('recruitmentMode', e.target.value as AppState['recruitmentMode'])}>
                    <option value="">Selecione</option><option value="Chamamento fechado">Chamamento fechado</option><option value="Chamamento aberto">Chamamento aberto</option><option value="Loteria cívica">Loteria cívica</option>
                  </select>
                </Field>
              </div>

              {state.isVulnerableGroup === 'Sim' && <div className="alert info">Observar os grupos de interesse definidos pela Estratégia de Controle de Equidade em Políticas Públicas.</div>}
              {digitalOnlyForbidden && <div className="alert warning">Com letramento digital baixo/parcial e sem acesso adequado a computadores, o método não poderá ser completamente digital.</div>}
            </StepCard>
          )}

          {step === 5 && (
            <StepCard title="Arranjo operacional da escuta" subtitle="Define a modalidade mais adequada de execução da escuta.">
              <div className="two-columns">
                <Field label="É possível reunir o público-alvo em um mesmo local para uma atividade de escuta?">
                  <select value={state.canGatherInSamePlace} onChange={(e) => updateState('canGatherInSamePlace', e.target.value as AppState['canGatherInSamePlace'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>

                {state.canGatherInSamePlace === 'Não' && (
                  <>
                    <Field label="A equipe pode viajar ou ir ao território onde estão os usuários?">
                      <select value={state.canTravelToTerritory} onChange={(e) => updateState('canTravelToTerritory', e.target.value as AppState['canTravelToTerritory'])}>
                        <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                      </select>
                    </Field>

                    {state.canTravelToTerritory === 'Sim' && (
                      <Field label="A escuta pode utilizar meios digitais mediados por atividades presenciais sem exclusão significativa de usuários?">
                        <select value={state.canUseDigitalWithLowExclusion} onChange={(e) => updateState('canUseDigitalWithLowExclusion', e.target.value as AppState['canUseDigitalWithLowExclusion'])}>
                          <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                        </select>
                      </Field>
                    )}

                    {state.canTravelToTerritory === 'Não' && (
                      <>
                        <Field label="Há parceiros locais capazes de apoiar a mobilização ou a facilitação?">
                          <select value={state.hasLocalPartners} onChange={(e) => updateState('hasLocalPartners', e.target.value as AppState['hasLocalPartners'])}>
                            <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                          </select>
                        </Field>

                        {state.hasLocalPartners === 'Sim' && (
                          <Field label="É possível usar meios digitais com mediação presencial sem exclusão significativa?">
                            <select value={state.canUseDigitalWithLowExclusion} onChange={(e) => updateState('canUseDigitalWithLowExclusion', e.target.value as AppState['canUseDigitalWithLowExclusion'])}>
                              <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                            </select>
                          </Field>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="derived-box">
                <p><strong>Modalidade derivada:</strong> {state.modality || '—'}</p>
                {digitalOnlyForbidden && <p><strong>Regra aplicada:</strong> formato completamente digital bloqueado para a recomendação final.</p>}
              </div>

              {state.modality === 'Mediada/Híbrida' && (
                <div className="subpanel">
                  <h3>Subbloco digital</h3>
                  <div className="two-columns">
                    <Field label="Será necessário criar plataforma própria do TCU?">
                      <select value={state.needOwnPlatform} onChange={(e) => updateState('needOwnPlatform', e.target.value as AppState['needOwnPlatform'])}>
                        <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                      </select>
                    </Field>
                    <Field label="Será necessária contratação de TI, dados ou serviço correlato terceirizado?">
                      <select value={state.needThirdPartyTech} onChange={(e) => updateState('needThirdPartyTech', e.target.value as AppState['needThirdPartyTech'])}>
                        <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                      </select>
                    </Field>
                    <Field label="Será utilizada plataforma open source?">
                      <select value={state.willUseOpenSource} onChange={(e) => updateState('willUseOpenSource', e.target.value as AppState['willUseOpenSource'])}>
                        <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                      </select>
                    </Field>
                    <Field label="A aplicação será recorrente ou deixará legado para outras auditorias?">
                      <select value={state.willLeaveLegacy} onChange={(e) => updateState('willLeaveLegacy', e.target.value as AppState['willLeaveLegacy'])}>
                        <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </StepCard>
          )}

          {step === 6 && (
            <StepCard title="Capacidades da equipe e tempo disponível" subtitle="Qualifica a recomendação final conforme as condições de execução.">
              <div className="two-columns">
                <Field label="Há alguém com experiência em mediação ou métodos participativos?">
                  <select value={state.hasFacilitationExperience} onChange={(e) => updateState('hasFacilitationExperience', e.target.value as AppState['hasFacilitationExperience'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="A equipe tem capacidade de analisar grandes volumes de respostas?">
                  <select value={state.canAnalyzeLargeVolumes} onChange={(e) => updateState('canAnalyzeLargeVolumes', e.target.value as AppState['canAnalyzeLargeVolumes'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="A equipe pode facilitar grupos de discussão?">
                  <select value={state.canFacilitateGroups} onChange={(e) => updateState('canFacilitateGroups', e.target.value as AppState['canFacilitateGroups'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="A equipe pode conduzir entrevistas individuais com cidadãos?">
                  <select value={state.canConductInterviews} onChange={(e) => updateState('canConductInterviews', e.target.value as AppState['canConductInterviews'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="Quanto tempo está disponível para preparar a escuta?">
                  <select value={state.availableTime} onChange={(e) => updateState('availableTime', e.target.value as AppState['availableTime'])}>
                    <option value="">Selecione</option><option value="Até 2 semanas">Até 2 semanas</option><option value="3 a 8 semanas">3 a 8 semanas</option><option value="Mais de 8 semanas">Mais de 8 semanas</option>
                  </select>
                </Field>
              </div>

              <div className="derived-box"><p><strong>Nível de tempo:</strong> {state.timeLevel || '—'}</p></div>
            </StepCard>
          )}

          {step === 7 && (
            <StepCard title="Tipo de insumo necessário" subtitle="Define se a auditoria precisa de escala, profundidade ou combinação de ambas.">
              <Field label="Qual tipo de insumo a auditoria precisa descobrir com a escuta?">
                <select value={state.inputNeed} onChange={(e) => updateState('inputNeed', e.target.value)}>
                  <option value="">Selecione</option>
                  {inputNeedOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </Field>

              {state.inputType === 'Quantitativo' && (
                <Field label="Quantas pessoas precisam ser ouvidas para responder à pergunta da auditoria?">
                  <select value={state.sampleSize} onChange={(e) => updateState('sampleSize', e.target.value as AppState['sampleSize'])}>
                    <option value="">Selecione</option><option value="Até 50 respostas">Até 50 respostas</option><option value="50 a 300 respostas">50 a 300 respostas</option><option value="Mais de 300 respostas">Mais de 300 respostas</option>
                  </select>
                </Field>
              )}

              {state.inputType === 'Qualitativo + Quantitativo' && (
                <Field label="Qual dimensão é mais importante neste momento da auditoria?">
                  <select value={state.mixedPriority} onChange={(e) => updateState('mixedPriority', e.target.value as AppState['mixedPriority'])}>
                    <option value="">Selecione</option><option value="Escala">Escala</option><option value="Profundidade">Profundidade</option>
                  </select>
                </Field>
              )}

              {state.inputType === 'Qualitativo' && (
                <Field label="Qual nível de detalhe é necessário sobre a experiência da pessoa cidadã?">
                  <select value={qualitativeDetail} onChange={(e) => setDepthFromDetail(e.target.value)}>
                    <option value="">Selecione</option><option value="Relatos curtos ou comentários">Relatos curtos ou comentários</option><option value="Conversa estruturada sobre a experiência">Conversa estruturada sobre a experiência</option><option value="Compreensão detalhada da jornada e do contexto">Compreensão detalhada da jornada e do contexto</option>
                  </select>
                </Field>
              )}

              <div className="derived-box">
                <p><strong>Tipo de insumo derivado:</strong> {state.inputType || '—'}</p>
                <p><strong>Profundidade:</strong> {state.depthLevel || '—'}</p>
              </div>
            </StepCard>
          )}

          {step === 8 && (
            <StepCard title="Riscos, sensibilidade e conflito" subtitle="Se houver risco não mitigável, o sistema força a recomendação de entrevista em profundidade.">
              <div className="two-columns">
                <Field label="O público participante pode sofrer consequências negativas por participar da escuta?">
                  <select value={state.riskNegativeConsequences} onChange={(e) => updateState('riskNegativeConsequences', e.target.value as AppState['riskNegativeConsequences'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="Os participantes dependem diretamente da instituição avaliada?">
                  <select value={state.dependsOnEvaluatedInstitution} onChange={(e) => updateState('dependsOnEvaluatedInstitution', e.target.value as AppState['dependsOnEvaluatedInstitution'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
                <Field label="As contribuições podem expor pessoas ou situações sensíveis?">
                  <select value={state.mayExposeSensitiveSituations} onChange={(e) => updateState('mayExposeSensitiveSituations', e.target.value as AppState['mayExposeSensitiveSituations'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
              </div>

              {(state.riskNegativeConsequences === 'Sim' || state.dependsOnEvaluatedInstitution === 'Sim' || state.mayExposeSensitiveSituations === 'Sim') && (
                <Field label="É possível mitigar os riscos identificados?">
                  <select value={state.canMitigateRisk} onChange={(e) => updateState('canMitigateRisk', e.target.value as AppState['canMitigateRisk'])}>
                    <option value="">Selecione</option><option value="Sim">Sim</option><option value="Não">Não</option>
                  </select>
                </Field>
              )}

              {state.forcedRecommendation && <div className="alert warning">Há risco não mitigável. Recomendar sempre: <strong>{state.forcedRecommendation}</strong>.</div>}
            </StepCard>
          )}

          {step === 9 && (
            <StepCard title="Síntese final" subtitle="Consolidação das variáveis produzidas pelos eixos implementados no quiz.">
              <div className="results-grid">
                <div className="result-card"><h3>Problema</h3><p>{problemSummary || '—'}</p></div>
                <div className="result-card"><h3>Foco da escuta</h3><p>{state.focusOfListening || '—'}</p></div>
                <div className="result-card"><h3>Momento de auditoria</h3><p>{state.auditStage || '—'}</p></div>
                <div className="result-card"><h3>Tipologia IDEO</h3><p>{state.ideoTypes.join(', ') || '—'}</p></div>
                <div className="result-card"><h3>Objetivo</h3><p>{state.objective || '—'}</p></div>
                <div className="result-card"><h3>Tipologia OCDE</h3><p>{state.oecdTypes.join(', ') || '—'}</p></div>
                <div className="result-card"><h3>Público e jornada</h3><p>{state.isDirectUser || '—'} / {state.journeyStage || '—'}</p></div>
                <div className="result-card"><h3>Modalidade</h3><p>{state.modality || '—'}</p></div>
                <div className="result-card"><h3>Tempo disponível</h3><p>{state.availableTime || '—'} ({state.timeLevel || '—'})</p></div>
                <div className="result-card"><h3>Tipo de insumo</h3><p>{state.inputType || '—'}</p></div>
                <div className="result-card"><h3>Risco e sensibilidade</h3><p>{state.forcedRecommendation ? `Recomendação forçada: ${state.forcedRecommendation}` : 'Sem recomendação forçada por risco não mitigável.'}</p></div>
                <div className="result-card full"><h3>Percepções a coletar</h3><p>{state.perceptionsToCollect || '—'}</p></div>
              </div>

              <div className="trace-box">
                <p className="trace-title">Variáveis definidas e conexão com as variáveis de produto</p>
                <ul className="trace-list">
                  {variableLinks.map(([from, to]) => <li key={`${from}-${to}`}>{from} → {to}</li>)}
                </ul>
              </div>

              <div className="subpanel">
                <h3>Ferramentas mais recomendáveis</h3>
                <div className="recommendation-list">
                  {topRecommendations.map((item, index) => (
                    <article key={item.method.id} className="result-card full">
                      <h3>{index + 1}. {item.method.name}</h3>
                      <p><strong>ID:</strong> {item.method.id} · <strong>Pontuação:</strong> {item.score}</p>
                      <p>{item.method.shortDescription}</p>
                      <p><strong>Etapa IDEO:</strong> {item.method.ideo}</p>
                      <p><strong>Tipologia OCDE:</strong> {item.method.oecd}</p>
                      <p><strong>Formato:</strong> {item.method.format} · <strong>Duração:</strong> {item.method.duration}</p>
                      <p><strong>Tamanho do grupo:</strong> {item.method.groupSize}</p>

                      <div className="two-columns">
                        <div>
                          <h4>Por que apareceu no topo</h4>
                          <ul className="summary-list">
                            {item.reasons.slice(0, 5).map((reason) => <li key={reason}>{reason}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4>Pontos de atenção</h4>
                          <ul className="summary-list">
                            {(item.cautions.length ? item.cautions : ['Sem alerta relevante para este caso.']).slice(0, 5).map((caution) => <li key={caution}>{caution}</li>)}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="actions-row">
                <button className="secondary" onClick={reset}>Reiniciar quiz</button>
              </div>
            </StepCard>
          )}

          {step < 9 && (
            <div className="actions-row">
              <button className="secondary" onClick={previous} disabled={step === 1}>Voltar</button>
              <button className="primary" onClick={next} disabled={!canGoNext || state.canParticipationHelp === 'Não'}>Avançar</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
