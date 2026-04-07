export type ProjectSectionKey =
  | "problem-validation"
  | "customer-discovery"
  | "icp"
  | "conversation-framework"
  | "product-design"
  | "user-journey-map"
  | "business-model-canvas"
  | "current-hacks"
  | "competitive-alternatives"
  | "competitive-map"
  | "go-to-market";

export interface Section {
  id: ProjectSectionKey;
  title: string;
  objective: string;
  notes: string[];
  insights: string[];
  timeSpentHours: number;
  sprintFocus: string;
}

export interface Conversation {
  id: string;
  person: string;
  context: string;
  painPoints: string[];
  signals: string[];
  trustLevel: "Low" | "Medium" | "High";
  felt: string;
  learned: string;
  changed: string;
}

export interface SprintTask {
  id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
}

export interface Sprint {
  id: string;
  goal: string;
  duration: string;
  review: string;
  retrospective: string;
  tasks: SprintTask[];
}

export interface FileAsset {
  id: string;
  name: string;
  type: "PDF" | "DOC" | "IMG" | "SHEET";
  target: string;
  url: string;
}

export interface MetricCard {
  id: string;
  label: string;
  value: string;
  note: string;
}

export interface Project {
  id: string;
  name: string;
  stage: string;
  currentSectionId: ProjectSectionKey;
  dayCount: number;
  warning: string;
  sections: Section[];
  conversations: Conversation[];
  sprint: Sprint;
  files: FileAsset[];
  metrics: MetricCard[];
}

export type DemoStepKey =
  | "define-problem"
  | "target-user"
  | "validate-urgency"
  | "outline-solution"
  | "business-opportunity";

export type DemoStepStatus = "todo" | "active" | "done";

export interface DemoStep {
  id: DemoStepKey;
  title: string;
  shortLabel: string;
  description: string;
  prompt: string;
  placeholder: string;
  value: string;
  status: DemoStepStatus;
  helper: string;
}

export interface DemoTask {
  id: string;
  title: string;
  done: boolean;
}

export interface DemoFocusItem {
  id: string;
  title: string;
  value: string;
}

export interface DemoNotification {
  id: string;
  title: string;
  detail: string;
  whenLabel: string;
  read: boolean;
  kind: "reminder" | "deadline" | "signal";
}

export interface DemoReminder {
  id: string;
  title: string;
  dueLabel: string;
  done: boolean;
}

export interface DemoCalendarItem {
  id: string;
  dayLabel: string;
  timeLabel: string;
  title: string;
  type: "call" | "focus" | "review" | "milestone";
  startsAt?: string;
  endsAt?: string | null;
  source?: "manual" | "google";
}

export type DemoBoardLane = "now" | "next" | "later";

export type DemoWorkspaceView =
  | "overview"
  | "today"
  | "capture"
  | "strategy"
  | "records"
  | "planner"
  | "sprint"
  | "desk";

export interface DemoMarketSnapshot {
  tam: number;
  sam: number;
  som: number;
  note: string;
}

export interface DemoEconomicsSnapshot {
  productionCost: number;
  monthlyPrice: number;
  runwayMonths: number;
}

export interface DemoBuildSnapshot {
  weeklyHoursAvailable: number;
  hoursSpent: number;
  mvpHoursTarget: number;
  calendarConnectionLabel: string;
}

export interface DemoGoToMarketSnapshot {
  firstClientTargetDays: number;
  clientsAcquired: number;
  acquisitionFrequencyPerMonth: number;
  primaryChannel: string;
}

export interface DemoBusinessSnapshot {
  market: DemoMarketSnapshot;
  economics: DemoEconomicsSnapshot;
  build: DemoBuildSnapshot;
  goToMarket: DemoGoToMarketSnapshot;
}

export interface DemoBoardCard {
  id: string;
  title: string;
  detail: string;
  lane: DemoBoardLane;
  accent: "pine" | "ember" | "ink";
}

export type DemoCanvasKey =
  | "problem-validation"
  | "customer-discovery"
  | "icp"
  | "tam"
  | "conversation-framework"
  | "business-model-canvas"
  | "go-to-market";

export interface DemoCanvas {
  id: DemoCanvasKey;
  title: string;
  prompt: string;
  helper: string;
  value: string;
}

export interface DemoConversation {
  id: string;
  person: string;
  context: string;
  painPoints: string;
  signals: string;
  trustLevel: "Low" | "Medium" | "High";
  learned: string;
}

export interface DemoFileRecord {
  id: string;
  name: string;
  target: string;
  url: string;
}

export interface DemoSprintTask {
  id: string;
  title: string;
  status: "To Do" | "In Progress" | "Done";
}

export interface DemoSprintRecord {
  goal: string;
  duration: string;
  review: string;
  retrospective: string;
  tasks: DemoSprintTask[];
}

export interface DemoProject {
  id: string;
  name: string;
  createdAt: string;
  dayCount: number;
  currentStepId: DemoStepKey;
  stageLabel: string;
  warning: string;
  founderNote: string;
  steps: DemoStep[];
  focusItems: DemoFocusItem[];
  quickTasks: DemoTask[];
  decisions: string[];
  reminders: DemoReminder[];
  calendar: DemoCalendarItem[];
  boardCards: DemoBoardCard[];
  canvases: DemoCanvas[];
  notifications: DemoNotification[];
  conversations: DemoConversation[];
  files: DemoFileRecord[];
  sprint: DemoSprintRecord;
  business: DemoBusinessSnapshot;
}
