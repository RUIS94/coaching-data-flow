import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Step {
  id: string;
  letter: string;
  name: string;
  time: string;
  description: string;
}

interface PulseFlowProps {
  onNavigateToStep?: (step: string) => void;
  compact?: boolean;
  completeOnClick?: boolean;
  initialActiveStep?: string | null;
  disableActiveHighlight?: boolean;
  pageStepId?: 'prepare' | 'uncover' | 'lead' | 'sync' | 'evaluate' | null;
}

const steps: Step[] = [
  {
    id: 'prepare',
    letter: 'P',
    name: 'Prepare',
    time: '~30 min',
    description: 'Review pipeline and gather insights'
  },
  {
    id: 'uncover',
    letter: 'U',
    name: 'Uncover',
    time: '~60 min',
    description: 'Deep dive into deal dynamics'
  },
  {
    id: 'lead',
    letter: 'L',
    name: 'Lead',
    time: '~75 min',
    description: 'Guide team through strategy'
  },
  {
    id: 'sync',
    letter: 'S',
    name: 'Sync',
    time: '~30 min',
    description: 'Align with stakeholders'
  },
  {
    id: 'evaluate',
    letter: 'E',
    name: 'Evaluate',
    time: '~15 min',
    description: 'Assess progress and outcomes'
  }
];

function mapGlobalIdxToPulseIdx(gIdx: number, completed: boolean): number {
  if (completed) return 4; // evaluate
  const clamped = Math.max(0, Math.min(4, gIdx));
  return clamped; // 0:P, 1:U, 2:L, 3:S, 4:E
}
function pulseStepIdToGlobalIdx(stepId: string): number {
  if (stepId === 'prepare') return 0;
  if (stepId === 'uncover') return 1;
  if (stepId === 'lead') return 2;
  if (stepId === 'sync') return 3;
  return 4; // evaluate
}

export default function PulseFlow({ onNavigateToStep, compact, completeOnClick, initialActiveStep, disableActiveHighlight, pageStepId }: PulseFlowProps) {
  const [activeStep, setActiveStep] = useState<string | null>(pageStepId ?? initialActiveStep ?? 'prepare');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    const readState = () => {
      const gStr = typeof window !== 'undefined' ? sessionStorage.getItem('pulse.currentIdx') : null;
      const comp = typeof window !== 'undefined' ? sessionStorage.getItem('pulse.completed') === 'true' : false;
      const gIdxNum = gStr ? parseInt(gStr, 10) : 0;
      const gIdx = Number.isNaN(gIdxNum) ? 0 : gIdxNum;
      const pfIdx = mapGlobalIdxToPulseIdx(gIdx, comp);
      const completedCount = comp ? steps.length : Math.max(0, pfIdx);
      setCompletedSteps(new Set(steps.slice(0, completedCount).map(s => s.id)));
      if (!pageStepId) {
        const act = steps[pfIdx]?.id ?? 'evaluate';
        setActiveStep(act);
      } else {
        setActiveStep(pageStepId);
      }
    };
    readState();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pulse.currentIdx' || e.key === 'pulse.completed') {
        readState();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pageStepId]);

  const handleStepClick = (stepId: string) => {
    if (!disableActiveHighlight) {
      setActiveStep(stepId);
    }
    onNavigateToStep?.(stepId);
    if (completeOnClick) {
      setCompletedSteps(prev => new Set([...prev, stepId]));
    }
    const gIdx = pulseStepIdToGlobalIdx(stepId);
    if (typeof window !== 'undefined') {
      const wasCompleted = sessionStorage.getItem('pulse.completed') === 'true';
      sessionStorage.setItem('pulse.started', 'true');
      sessionStorage.setItem('pulse.completed', wasCompleted || (stepId === 'evaluate' && !!completeOnClick) ? 'true' : 'false');
      sessionStorage.setItem('pulse.currentIdx', String(gIdx));
      window.dispatchEvent(new Event('pulse:state'));
    }
  };

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId);
  const isStepActive = (stepId: string) => !disableActiveHighlight && activeStep === stepId;

  return (
    <div className="relative">
      <div className="flex items-stretch justify-between gap-0">
        {steps.map((step, index) => {
          const isActive = isStepActive(step.id);
          const isCompleted = isStepCompleted(step.id);

          return (
            <div key={step.id} className="relative flex items-center flex-1 group">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`
                  relative w-full min-w-[120px] md:min-w-[130px] px-3 py-1
                  ${index === 0 ? 'rounded-l-md' : index === steps.length - 1 ? 'rounded-r-md' : 'rounded-none'}
                  transition-all duration-200
                  ${isActive
                    ? 'bg-[#605BFF] text-white'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-[#605BFF]/20'
                  }
                `}
              >
                {isCompleted && (
                  <div className="absolute top-1 right-1 z-10 pointer-events-none">
                    <CheckCircle2 size={16} className="text-green-600 bg-white rounded-full" />
                  </div>
                )}

                <div className="flex flex-col items-center justify-center">
                  <div className="text-lg font-bold leading-none">
                    {step.letter}
                  </div>
                  <div className="mt-0.5 text-center leading-tight">
                    <span className={`font-semibold text-xs ${isActive ? 'text-white' : isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                      {step.name}
                    </span>
                    <span className={`ml-1 text-[11px] ${isActive ? 'text-white/90' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      · {step.time}
                    </span>
                  </div>
                </div>
              </button>

              {index < steps.length - 1 && (
                <>
                  <div className={`pointer-events-none absolute right-0 top-0 h-full w-px ${isCompleted ? 'bg-green-500' : 'bg-[#605BFF]'}`} />
                  <span
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 z-10"
                    style={{
                      width: 0,
                      height: 0,
                      borderTopWidth: 5,
                      borderBottomWidth: 5,
                      borderLeftWidth: 6,
                      borderTopStyle: 'solid',
                      borderBottomStyle: 'solid',
                      borderLeftStyle: 'solid',
                      borderTopColor: 'transparent',
                      borderBottomColor: 'transparent',
                      borderLeftColor: isCompleted ? '#22c55e' : '#605BFF',
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-blue-900">
                {steps.find(s => s.id === activeStep)?.name}
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                {steps.find(s => s.id === activeStep)?.description}
              </p>
            </div>
            <button
              onClick={() => {
                setCompletedSteps(prev => new Set([...prev, activeStep]));
                const currentIndex = steps.findIndex(s => s.id === activeStep);
                if (currentIndex < steps.length - 1) {
                  handleStepClick(steps[currentIndex + 1].id);
                } else {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pulse.started', 'true');
                    sessionStorage.setItem('pulse.completed', 'true');
                    sessionStorage.setItem('pulse.currentIdx', String(4)); // evaluate
                    window.dispatchEvent(new Event('pulse:state'));
                  }
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex-shrink-0"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
