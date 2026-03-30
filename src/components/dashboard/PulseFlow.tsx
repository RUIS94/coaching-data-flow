import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

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
    name: 'Prioritize',
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
      const cStr = typeof window !== 'undefined' ? sessionStorage.getItem('pulse.completedSteps') : null;
      const gIdxNum = gStr ? parseInt(gStr, 10) : 0;
      const gIdx = Number.isNaN(gIdxNum) ? 0 : gIdxNum;
      const pfIdx = mapGlobalIdxToPulseIdx(gIdx, comp);
      let cSet: Set<string>;
      if (cStr) {
        try {
          const arr = JSON.parse(cStr) as string[];
          cSet = new Set(arr.filter(id => steps.some(s => s.id === id)));
        } catch {
          cSet = new Set();
        }
      } else {
        const cnt = comp ? steps.length : Math.max(0, pfIdx);
        cSet = new Set(steps.slice(0, cnt).map(s => s.id));
      }
      setCompletedSteps(cSet);
      if (typeof window !== 'undefined' && !cStr) {
        try {
          sessionStorage.setItem('pulse.completedSteps', JSON.stringify(Array.from(cSet)));
        } catch { /* no-op */ }
      }
      if (!pageStepId) {
        const act = steps[pfIdx]?.id ?? 'evaluate';
        setActiveStep(act);
      } else {
        setActiveStep(pageStepId);
      }
    };
    readState();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pulse.currentIdx' || e.key === 'pulse.completed' || e.key === 'pulse.completedSteps') {
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
      setCompletedSteps(prev => {
        const prevArr = Array.from(prev);
        let prevMax = -1;
        if (typeof window !== 'undefined') {
          const ms = sessionStorage.getItem('pulse.maxIdx');
          const pn = ms ? parseInt(ms, 10) : -1;
          prevMax = Number.isNaN(pn) ? -1 : pn;
        }
        const uptoPrevMax = prevMax >= 0 ? steps.slice(0, prevMax + 1).map(s => s.id) : [];
        const nextSet = new Set<string>([...prevArr, stepId, ...uptoPrevMax]);
        if (typeof window !== 'undefined') {
          const g = pulseStepIdToGlobalIdx(stepId);
          const newMax = Math.max(prevMax, g);
          sessionStorage.setItem('pulse.maxIdx', String(newMax));
          sessionStorage.setItem('pulse.completedSteps', JSON.stringify(Array.from(nextSet)));
        }
        return nextSet;
      });
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
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isActive = isStepActive(step.id);
          const isCompleted = isStepCompleted(step.id);
          const activeIdx = steps.findIndex(s => s.id === activeStep);
          const isFuture = !isCompleted && !isActive && index > activeIdx;
          const isDoneForBadge = isCompleted;
          const baseCls = "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors";
          const stateCls = isActive
            ? (isCompleted ? "bg-[#605BFF]/10 text-green-700" : "bg-[#605BFF]/10 text-foreground")
            : isCompleted
            ? "text-green-600 hover:bg-gray-100"
            : isFuture
            ? "text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground hover:bg-gray-100"
            : "text-muted-foreground hover:text-foreground hover:bg-gray-100";
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(step.id)}
                className={`${baseCls} ${stateCls}`}
              >
                <span
                  className={`w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? "bg-green-600 text-white border-green-600"
                      : (isActive ? "bg-[#605BFF] text-white border-[#605BFF]" : "")
                  }`}
                >
                  {isDoneForBadge ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span>{step.name}</span>
              </button>
              {index < steps.length - 1 && <div className="w-5 h-px bg-border mx-1" />}
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
                setCompletedSteps(prev => {
                  const prevArr = Array.from(prev);
                  let prevMax = -1;
                  if (typeof window !== 'undefined') {
                    const ms = sessionStorage.getItem('pulse.maxIdx');
                    const pn = ms ? parseInt(ms, 10) : -1;
                    prevMax = Number.isNaN(pn) ? -1 : pn;
                  }
                  const uptoPrevMax = prevMax >= 0 ? steps.slice(0, prevMax + 1).map(s => s.id) : [];
                  const nextSet = new Set<string>([...prevArr, activeStep as string, ...uptoPrevMax]);
                  if (typeof window !== 'undefined') {
                    const curIdx = steps.findIndex(s => s.id === activeStep);
                    const newMax = Math.max(prevMax, curIdx);
                    sessionStorage.setItem('pulse.maxIdx', String(newMax));
                    sessionStorage.setItem('pulse.completedSteps', JSON.stringify(Array.from(nextSet)));
                  }
                  return nextSet;
                });
                const currentIndex = steps.findIndex(s => s.id === activeStep);
                if (currentIndex < steps.length - 1) {
                  handleStepClick(steps[currentIndex + 1].id);
                } else {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('pulse.started', 'true');
                    sessionStorage.setItem('pulse.completed', 'true');
                    sessionStorage.setItem('pulse.currentIdx', String(4)); // evaluate
                    const allIds = steps.map(s => s.id);
                    sessionStorage.setItem('pulse.completedSteps', JSON.stringify(allIds));
                    sessionStorage.setItem('pulse.maxIdx', String(4));
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
