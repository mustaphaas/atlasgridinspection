import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type WorkflowStatus =
  | "New"
  | "Validated"
  | "Consultant Assigned"
  | "Field Officer Assigned"
  | "Arrival Verified"
  | "Inspection In Progress"
  | "Consultant Review"
  | "Pending REA Review"
  | "Verified"
  | "Returned"
  | "Re-inspection Required"
  | "Rejected";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type ContractRecord = {
  id: string;
  projectId: string;
  project: string;
  contractor: string;
  state: string;
  lga: string;
  community: string;
  type: string;
  status: "Active" | "Completed" | "On Hold";
  capacity: string;
  beneficiaries: number;
  coordinates: string;
  startDate: string;
  endDate: string;
};

export type ClaimRecord = {
  id: string;
  contractId: string;
  projectId: string;
  project: string;
  contractor: string;
  state: string;
  lga: string;
  community: string;
  type: string;
  coordinates: string;
  capacity: string;
  beneficiaries: number;
  submittedDate: string;
  submittedBy: string;
  status: WorkflowStatus;
  consultant?: string;
  consultantLead?: string;
  fieldOfficer?: string;
  fieldOfficerId?: string;
  dueDate?: string;
  priority: "Normal" | "High" | "Urgent" | "Critical";
  arrivalVerified: boolean;
  arrivalDistanceM?: number;
  inspectionProgress: number;
  score?: number;
  findings?: number;
  criticalFindings?: number;
  evidenceCount?: number;
  recommendation?: string;
  lastUpdated: string;
};

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  role: "REA Admin" | "REA Reviewer" | "Consultant Admin" | "Field Officer" | "Auditor";
  organization: string;
  state: string;
  status: "Active" | "Invited" | "Suspended";
  lastActive: string;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: "Claim" | "Inspection" | "Report" | "User" | "System";
  entityId: string;
  details: string;
};

const contracts: ContractRecord[] = [
  {
    id: "REA/SMG/KN/2026/014",
    projectId: "REA-KN-2026-014",
    project: "Rimin Gado Solar Mini-Grid",
    contractor: "Arewa Solar Concepts",
    state: "Kano",
    lga: "Rimin Gado",
    community: "Rimin Gado",
    type: "Solar mini-grid",
    status: "Active",
    capacity: "96 kW",
    beneficiaries: 617,
    coordinates: "11.62, 8.58",
    startDate: "01 Feb 2026",
    endDate: "31 Jan 2027",
  },
  {
    id: "REA/SMG/KD/2026/021",
    projectId: "REA-KD-2026-009",
    project: "Kachia Rural Electrification",
    contractor: "Sahel Power Systems Ltd",
    state: "Kaduna",
    lga: "Kachia",
    community: "Awon",
    type: "Distribution extension",
    status: "Active",
    capacity: "75 kW",
    beneficiaries: 402,
    coordinates: "9.87, 7.95",
    startDate: "15 Jan 2026",
    endDate: "14 Jan 2027",
  },
  {
    id: "REA/SMG/BA/2026/011",
    projectId: "REA-BA-2026-011",
    project: "Bauchi Community Energy",
    contractor: "Sahel Power Systems Ltd",
    state: "Bauchi",
    lga: "Bauchi",
    community: "Bauchi Central",
    type: "Solar mini-grid",
    status: "Active",
    capacity: "58 kW",
    beneficiaries: 512,
    coordinates: "10.31, 9.84",
    startDate: "04 Mar 2026",
    endDate: "03 Mar 2027",
  },
  {
    id: "REA/SMG/FC/2026/002",
    projectId: "REA-FC-2026-002",
    project: "Abuja Satellite Community Grid",
    contractor: "GreenVolt Nigeria Ltd",
    state: "FCT",
    lga: "Abuja Municipal",
    community: "Kuje Extension",
    type: "Solar mini-grid",
    status: "Active",
    capacity: "110 kW",
    beneficiaries: 730,
    coordinates: "9.08, 7.40",
    startDate: "10 Jan 2026",
    endDate: "09 Jan 2027",
  },
  {
    id: "REA/SMG/KN/2026/021",
    projectId: "REA-KN-2026-021",
    project: "Tarauni Community Power",
    contractor: "GreenVolt Nigeria Ltd",
    state: "Kano",
    lga: "Tarauni",
    community: "Hotoro",
    type: "Solar mini-grid",
    status: "Active",
    capacity: "80 kW",
    beneficiaries: 488,
    coordinates: "12.02, 8.54",
    startDate: "20 Feb 2026",
    endDate: "19 Feb 2027",
  },
  {
    id: "REA/SMG/LA/2026/018",
    projectId: "REA-LA-2026-018",
    project: "Lagos Coastal Energy Point",
    contractor: "SolarTech Nigeria",
    state: "Lagos",
    lga: "Epe",
    community: "Coastal Epe",
    type: "Institutional solar",
    status: "Active",
    capacity: "52 kW",
    beneficiaries: 344,
    coordinates: "6.58, 3.75",
    startDate: "11 Apr 2026",
    endDate: "10 Apr 2027",
  },
  {
    id: "REA/SMG/EN/2026/005",
    projectId: "REA-EN-2026-005",
    project: "Enugu Rural Solar Cluster",
    contractor: "Sahel Power Systems Ltd",
    state: "Enugu",
    lga: "Nsukka",
    community: "Nsukka East",
    type: "Solar mini-grid",
    status: "Active",
    capacity: "54 kW",
    beneficiaries: 381,
    coordinates: "6.86, 7.40",
    startDate: "02 May 2026",
    endDate: "01 May 2027",
  },
  {
    id: "REA/SMG/BO/2026/010",
    projectId: "REA-BO-2026-010",
    project: "Borno Resilience Power Hub",
    contractor: "Sahel Power Systems Ltd",
    state: "Borno",
    lga: "Maiduguri",
    community: "Maiduguri North",
    type: "Solar mini-grid",
    status: "Active",
    capacity: "88 kW",
    beneficiaries: 624,
    coordinates: "11.83, 13.15",
    startDate: "18 Mar 2026",
    endDate: "17 Mar 2027",
  },
];

const initialClaims: ClaimRecord[] = [
  {
    id: "CLM-2026-00248",
    contractId: contracts[0].id,
    projectId: contracts[0].projectId,
    project: contracts[0].project,
    contractor: contracts[0].contractor,
    state: contracts[0].state,
    lga: contracts[0].lga,
    community: contracts[0].community,
    type: contracts[0].type,
    coordinates: contracts[0].coordinates,
    capacity: contracts[0].capacity,
    beneficiaries: contracts[0].beneficiaries,
    submittedDate: "08 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "New",
    priority: "Normal",
    arrivalVerified: false,
    inspectionProgress: 0,
    lastUpdated: "Today, 08:14 AM",
  },
  {
    id: "CLM-2026-00247",
    contractId: contracts[1].id,
    projectId: contracts[1].projectId,
    project: contracts[1].project,
    contractor: contracts[1].contractor,
    state: contracts[1].state,
    lga: contracts[1].lga,
    community: contracts[1].community,
    type: contracts[1].type,
    coordinates: contracts[1].coordinates,
    capacity: contracts[1].capacity,
    beneficiaries: contracts[1].beneficiaries,
    submittedDate: "07 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "Validated",
    priority: "High",
    arrivalVerified: false,
    inspectionProgress: 0,
    lastUpdated: "Today, 08:26 AM",
  },
  {
    id: "CLM-2026-00246",
    contractId: contracts[2].id,
    projectId: contracts[2].projectId,
    project: contracts[2].project,
    contractor: contracts[2].contractor,
    state: contracts[2].state,
    lga: contracts[2].lga,
    community: contracts[2].community,
    type: contracts[2].type,
    coordinates: contracts[2].coordinates,
    capacity: contracts[2].capacity,
    beneficiaries: contracts[2].beneficiaries,
    submittedDate: "06 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "Consultant Assigned",
    consultant: "NorthGrid Consultants",
    consultantLead: "Engr. Fatima Sani",
    dueDate: "18 Aug 2026",
    priority: "High",
    arrivalVerified: false,
    inspectionProgress: 0,
    lastUpdated: "Today, 08:38 AM",
  },
  {
    id: "CLM-2026-00245",
    contractId: contracts[3].id,
    projectId: contracts[3].projectId,
    project: contracts[3].project,
    contractor: contracts[3].contractor,
    state: contracts[3].state,
    lga: contracts[3].lga,
    community: contracts[3].community,
    type: contracts[3].type,
    coordinates: contracts[3].coordinates,
    capacity: contracts[3].capacity,
    beneficiaries: contracts[3].beneficiaries,
    submittedDate: "05 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "Field Officer Assigned",
    consultant: "NorthGrid Consultants",
    consultantLead: "Engr. Fatima Sani",
    fieldOfficer: "Amina Yusuf",
    fieldOfficerId: "FO-0198",
    dueDate: "14 Aug 2026",
    priority: "Urgent",
    arrivalVerified: false,
    inspectionProgress: 0,
    lastUpdated: "Today, 08:52 AM",
  },
  {
    id: "CLM-2026-00244",
    contractId: contracts[4].id,
    projectId: contracts[4].projectId,
    project: contracts[4].project,
    contractor: contracts[4].contractor,
    state: contracts[4].state,
    lga: contracts[4].lga,
    community: contracts[4].community,
    type: contracts[4].type,
    coordinates: contracts[4].coordinates,
    capacity: contracts[4].capacity,
    beneficiaries: contracts[4].beneficiaries,
    submittedDate: "04 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "Consultant Review",
    consultant: "NorthGrid Consultants",
    consultantLead: "Engr. Fatima Sani",
    fieldOfficer: "Ibrahim Abdullahi",
    fieldOfficerId: "FO-0241",
    dueDate: "12 Aug 2026",
    priority: "High",
    arrivalVerified: true,
    arrivalDistanceM: 34,
    inspectionProgress: 100,
    score: 94,
    findings: 2,
    criticalFindings: 0,
    evidenceCount: 11,
    recommendation: "Installation is compliant subject to minor cable-label corrections.",
    lastUpdated: "Today, 09:05 AM",
  },
  {
    id: "CLM-2026-00243",
    contractId: contracts[5].id,
    projectId: contracts[5].projectId,
    project: contracts[5].project,
    contractor: contracts[5].contractor,
    state: contracts[5].state,
    lga: contracts[5].lga,
    community: contracts[5].community,
    type: contracts[5].type,
    coordinates: contracts[5].coordinates,
    capacity: contracts[5].capacity,
    beneficiaries: contracts[5].beneficiaries,
    submittedDate: "03 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "Pending REA Review",
    consultant: "SouthWest Grid Audit",
    consultantLead: "Adebayo Cole",
    fieldOfficer: "Grace Eze",
    fieldOfficerId: "FO-0150",
    dueDate: "09 Aug 2026",
    priority: "Critical",
    arrivalVerified: true,
    arrivalDistanceM: 19,
    inspectionProgress: 100,
    score: 87,
    findings: 4,
    criticalFindings: 1,
    evidenceCount: 14,
    recommendation: "Verify transformer earthing evidence before closure.",
    lastUpdated: "Today, 09:16 AM",
  },
  {
    id: "CLM-2026-00242",
    contractId: contracts[6].id,
    projectId: contracts[6].projectId,
    project: contracts[6].project,
    contractor: contracts[6].contractor,
    state: contracts[6].state,
    lga: contracts[6].lga,
    community: contracts[6].community,
    type: contracts[6].type,
    coordinates: contracts[6].coordinates,
    capacity: contracts[6].capacity,
    beneficiaries: contracts[6].beneficiaries,
    submittedDate: "01 Aug 2026",
    submittedBy: "REA Claims Desk",
    status: "Verified",
    consultant: "Eastern Energy Review",
    consultantLead: "Ngozi Okafor",
    fieldOfficer: "Chinedu Okeke",
    fieldOfficerId: "FO-0312",
    dueDate: "08 Aug 2026",
    priority: "Normal",
    arrivalVerified: true,
    arrivalDistanceM: 22,
    inspectionProgress: 100,
    score: 92,
    findings: 1,
    criticalFindings: 0,
    evidenceCount: 12,
    recommendation: "Verified as installed and operational.",
    lastUpdated: "Today, 09:28 AM",
  },
  {
    id: "CLM-2026-00241",
    contractId: contracts[7].id,
    projectId: contracts[7].projectId,
    project: contracts[7].project,
    contractor: contracts[7].contractor,
    state: contracts[7].state,
    lga: contracts[7].lga,
    community: contracts[7].community,
    type: contracts[7].type,
    coordinates: contracts[7].coordinates,
    capacity: contracts[7].capacity,
    beneficiaries: contracts[7].beneficiaries,
    submittedDate: "30 Jul 2026",
    submittedBy: "REA Claims Desk",
    status: "Re-inspection Required",
    consultant: "NorthGrid Consultants",
    consultantLead: "Engr. Fatima Sani",
    fieldOfficer: "Amina Yusuf",
    fieldOfficerId: "FO-0198",
    dueDate: "16 Aug 2026",
    priority: "Critical",
    arrivalVerified: false,
    inspectionProgress: 0,
    score: 68,
    findings: 6,
    criticalFindings: 2,
    evidenceCount: 9,
    recommendation: "Repeat the inspection after corrective works and capture transformer serial data.",
    lastUpdated: "Yesterday, 04:22 PM",
  },
];

const initialUsers: PortalUser[] = [
  { id: "USR-001", name: "Engr. Fatima Sani", email: "fatima.sani@rea.gov.ng", role: "REA Admin", organization: "REA", state: "FCT", status: "Active", lastActive: "2 min ago" },
  { id: "USR-002", name: "Musa Danjuma", email: "musa.danjuma@rea.gov.ng", role: "REA Reviewer", organization: "REA", state: "Kaduna", status: "Active", lastActive: "18 min ago" },
  { id: "USR-003", name: "Engr. Fatima Bello", email: "fatima.bello@northgrid.ng", role: "Consultant Admin", organization: "NorthGrid Consultants", state: "Kano", status: "Active", lastActive: "12 min ago" },
  { id: "USR-004", name: "Amina Yusuf", email: "amina.yusuf@northgrid.ng", role: "Field Officer", organization: "NorthGrid Consultants", state: "Kano", status: "Active", lastActive: "6 min ago" },
  { id: "USR-005", name: "Ibrahim Abdullahi", email: "ibrahim.abdullahi@northgrid.ng", role: "Field Officer", organization: "NorthGrid Consultants", state: "Kano", status: "Active", lastActive: "24 min ago" },
  { id: "USR-006", name: "Ngozi Okafor", email: "ngozi.okafor@audit.gov.ng", role: "Auditor", organization: "REA Internal Audit", state: "FCT", status: "Invited", lastActive: "Never" },
];

const initialAudit: AuditEvent[] = [
  { id: "AUD-1008", timestamp: "12 Aug 2026, 09:28 AM", actor: "Musa Danjuma", role: "REA Reviewer", action: "Verified inspection report", entityType: "Report", entityId: "CLM-2026-00242", details: "Report passed evidence, GPS and compliance checks." },
  { id: "AUD-1007", timestamp: "12 Aug 2026, 09:16 AM", actor: "Adebayo Cole", role: "Consultant Admin", action: "Submitted report to REA", entityType: "Inspection", entityId: "CLM-2026-00243", details: "Consultant QA completed with one critical finding." },
  { id: "AUD-1006", timestamp: "12 Aug 2026, 09:05 AM", actor: "Ibrahim Abdullahi", role: "Field Officer", action: "Submitted field inspection", entityType: "Inspection", entityId: "CLM-2026-00244", details: "11 evidence files captured within the approved geofence." },
  { id: "AUD-1005", timestamp: "12 Aug 2026, 08:52 AM", actor: "Engr. Fatima Bello", role: "Consultant Admin", action: "Assigned field officer", entityType: "Claim", entityId: "CLM-2026-00245", details: "Assigned to Amina Yusuf with an urgent priority." },
  { id: "AUD-1004", timestamp: "12 Aug 2026, 08:38 AM", actor: "Engr. Fatima Sani", role: "REA Admin", action: "Assigned consultant", entityType: "Claim", entityId: "CLM-2026-00246", details: "Assigned to NorthGrid Consultants." },
  { id: "AUD-1003", timestamp: "12 Aug 2026, 08:26 AM", actor: "REA Claims Desk", role: "REA Admin", action: "Validated claim", entityType: "Claim", entityId: "CLM-2026-00247", details: "Contract, project coordinates and supporting records matched." },
];

type AtlasGridContextValue = {
  contracts: ContractRecord[];
  claims: ClaimRecord[];
  users: PortalUser[];
  auditEvents: AuditEvent[];
  consultants: string[];
  fieldOfficers: PortalUser[];
  createClaim: (contractId: string, submittedBy?: string) => ClaimRecord | null;
  validateClaim: (claimId: string) => void;
  assignConsultant: (claimId: string, consultant: string, lead?: string) => void;
  assignFieldOfficer: (claimId: string, officerName: string) => void;
  verifyArrival: (claimId: string, distanceM?: number) => void;
  startInspection: (claimId: string) => boolean;
  updateInspectionProgress: (claimId: string, progress: number) => void;
  submitInspection: (claimId: string, payload?: Partial<ClaimRecord>) => boolean;
  consultantApprove: (claimId: string) => void;
  returnForReinspection: (claimId: string, reason: string, actor?: string, role?: string) => void;
  reaVerify: (claimId: string) => void;
  rejectClaim: (claimId: string, reason: string) => void;
  addUser: (user: Omit<PortalUser, "id" | "lastActive">) => void;
  toggleUserStatus: (userId: string) => void;
  resetDemo: () => void;
};

const AtlasGridContext = createContext<AtlasGridContextValue | null>(null);
const STORAGE_KEY = "atlasgrid-demo-state-v3";
let claimSequence = 248;

function nextClaimId(records: ClaimRecord[]) {
  const largestExisting = records.reduce((maximum, record) => {
    const numeric = Number(record.id.match(/(\d+)$/)?.[1] ?? 0);
    return Math.max(maximum, numeric);
  }, 0);
  claimSequence = Math.max(claimSequence, largestExisting) + 1;
  return `CLM-2026-${String(claimSequence).padStart(5, "0")}`;
}

function timestamp() {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function AtlasGridProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<ClaimRecord[]>(initialClaims);
  const [users, setUsers] = useState<PortalUser[]>(initialUsers);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAudit);
  const [hydrated, setHydrated] = useState(false);
  const synchronizingFromStorage = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { claims?: ClaimRecord[]; users?: PortalUser[]; auditEvents?: AuditEvent[] };
        if (Array.isArray(parsed.claims)) setClaims(parsed.claims);
        if (Array.isArray(parsed.users)) setUsers(parsed.users);
        if (Array.isArray(parsed.auditEvents)) setAuditEvents(parsed.auditEvents);
      }
    } catch {
      // Use the safe demo seed if local storage is unavailable or invalid.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (synchronizingFromStorage.current) {
      synchronizingFromStorage.current = false;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ claims, users, auditEvents }));
    } catch {
      // Keep the active session usable when browser storage is restricted.
    }
  }, [auditEvents, claims, hydrated, users]);

  useEffect(() => {
    const synchronizeAcrossTabs = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as { claims?: ClaimRecord[]; users?: PortalUser[]; auditEvents?: AuditEvent[] };
        synchronizingFromStorage.current = true;
        if (Array.isArray(parsed.claims)) setClaims(parsed.claims);
        if (Array.isArray(parsed.users)) setUsers(parsed.users);
        if (Array.isArray(parsed.auditEvents)) setAuditEvents(parsed.auditEvents);
      } catch {
        // Ignore invalid cross-tab payloads and retain the last valid state.
      }
    };
    window.addEventListener("storage", synchronizeAcrossTabs);
    return () => window.removeEventListener("storage", synchronizeAcrossTabs);
  }, []);

  const appendAudit = useCallback((event: Omit<AuditEvent, "id" | "timestamp">) => {
    setAuditEvents((current) => [
      {
        ...event,
        id: `AUD-${String(1000 + current.length + 1).padStart(4, "0")}`,
        timestamp: timestamp(),
      },
      ...current,
    ]);
  }, []);

  const updateClaim = useCallback((claimId: string, updates: Partial<ClaimRecord>) => {
    setClaims((current) => current.map((claim) => claim.id === claimId ? { ...claim, ...updates, lastUpdated: "Just now" } : claim));
  }, []);

  const createClaim = useCallback((contractId: string, submittedBy = "REA Claims Desk") => {
    const contract = contracts.find((item) => item.id === contractId);
    if (!contract) return null;
    const claim: ClaimRecord = {
      id: nextClaimId(claims),
      contractId: contract.id,
      projectId: contract.projectId,
      project: contract.project,
      contractor: contract.contractor,
      state: contract.state,
      lga: contract.lga,
      community: contract.community,
      type: contract.type,
      coordinates: contract.coordinates,
      capacity: contract.capacity,
      beneficiaries: contract.beneficiaries,
      submittedDate: "12 Aug 2026",
      submittedBy,
      status: "New",
      priority: "Normal",
      arrivalVerified: false,
      inspectionProgress: 0,
      lastUpdated: "Just now",
    };
    setClaims((current) => [claim, ...current]);
    appendAudit({ actor: submittedBy, role: "REA Admin", action: "Created claim", entityType: "Claim", entityId: claim.id, details: `Created from contract ${contract.id}.` });
    return claim;
  }, [appendAudit, claims.length]);

  const validateClaim = useCallback((claimId: string) => {
    updateClaim(claimId, { status: "Validated" });
    appendAudit({ actor: "Engr. Fatima Sani", role: "REA Admin", action: "Validated claim", entityType: "Claim", entityId: claimId, details: "Contract data, coordinates and supporting records matched." });
  }, [appendAudit, updateClaim]);

  const assignConsultant = useCallback((claimId: string, consultant: string, lead = "Consultant Lead") => {
    updateClaim(claimId, { status: "Consultant Assigned", consultant, consultantLead: lead, dueDate: "20 Aug 2026" });
    appendAudit({ actor: "Engr. Fatima Sani", role: "REA Admin", action: "Assigned consultant", entityType: "Claim", entityId: claimId, details: `Assigned to ${consultant}.` });
  }, [appendAudit, updateClaim]);

  const fieldOfficers = useMemo(() => users.filter((user) => user.role === "Field Officer" && user.status === "Active"), [users]);

  const assignFieldOfficer = useCallback((claimId: string, officerName: string) => {
    const officer = users.find((user) => user.name === officerName && user.role === "Field Officer");
    updateClaim(claimId, { status: "Field Officer Assigned", fieldOfficer: officerName, fieldOfficerId: officer?.id, arrivalVerified: false, inspectionProgress: 0 });
    appendAudit({ actor: "Engr. Fatima Bello", role: "Consultant Admin", action: "Assigned field officer", entityType: "Claim", entityId: claimId, details: `Assigned to ${officerName}.` });
  }, [appendAudit, updateClaim, users]);

  const verifyArrival = useCallback((claimId: string, distanceM = 28) => {
    updateClaim(claimId, { status: "Arrival Verified", arrivalVerified: true, arrivalDistanceM: distanceM });
    appendAudit({ actor: "Amina Yusuf", role: "Field Officer", action: "Verified site arrival", entityType: "Inspection", entityId: claimId, details: `GPS matched the approved geofence at ${distanceM} metres.` });
  }, [appendAudit, updateClaim]);

  const startInspection = useCallback((claimId: string) => {
    const claim = claims.find((item) => item.id === claimId);
    if (!claim?.arrivalVerified) return false;
    updateClaim(claimId, { status: "Inspection In Progress", inspectionProgress: Math.max(claim.inspectionProgress, 10) });
    appendAudit({ actor: claim.fieldOfficer ?? "Field Officer", role: "Field Officer", action: "Started field inspection", entityType: "Inspection", entityId: claimId, details: "Data-entry workflow unlocked after GPS verification." });
    return true;
  }, [appendAudit, claims, updateClaim]);

  const updateInspectionProgress = useCallback((claimId: string, progress: number) => {
    updateClaim(claimId, { inspectionProgress: Math.max(0, Math.min(100, progress)), status: "Inspection In Progress" });
  }, [updateClaim]);

  const submitInspection = useCallback((claimId: string, payload: Partial<ClaimRecord> = {}) => {
    const claim = claims.find((item) => item.id === claimId);
    const submittedProgress = payload.inspectionProgress ?? claim?.inspectionProgress ?? 0;
    if (!claim?.arrivalVerified || submittedProgress < 100) return false;
    updateClaim(claimId, {
      ...payload,
      status: "Consultant Review",
      inspectionProgress: 100,
      score: payload.score ?? claim.score ?? 90,
      findings: payload.findings ?? claim.findings ?? 2,
      criticalFindings: payload.criticalFindings ?? claim.criticalFindings ?? 0,
      evidenceCount: payload.evidenceCount ?? claim.evidenceCount ?? 10,
    });
    appendAudit({ actor: claim.fieldOfficer ?? "Field Officer", role: "Field Officer", action: "Submitted field inspection", entityType: "Inspection", entityId: claimId, details: "Inspection form, GPS evidence, photographs and signatures submitted for consultant QA." });
    return true;
  }, [appendAudit, claims, updateClaim]);

  const consultantApprove = useCallback((claimId: string) => {
    const claim = claims.find((item) => item.id === claimId);
    updateClaim(claimId, { status: "Pending REA Review" });
    appendAudit({ actor: claim?.consultantLead ?? "Consultant Admin", role: "Consultant Admin", action: "Approved report for REA", entityType: "Report", entityId: claimId, details: "Consultant quality assurance completed." });
  }, [appendAudit, claims, updateClaim]);

  const returnForReinspection = useCallback((claimId: string, reason: string, actor = "Engr. Fatima Bello", role = "Consultant Admin") => {
    updateClaim(claimId, { status: "Re-inspection Required", arrivalVerified: false, inspectionProgress: 0, recommendation: reason });
    appendAudit({ actor, role, action: "Requested re-inspection", entityType: "Inspection", entityId: claimId, details: reason });
  }, [appendAudit, updateClaim]);

  const reaVerify = useCallback((claimId: string) => {
    updateClaim(claimId, { status: "Verified" });
    appendAudit({ actor: "Musa Danjuma", role: "REA Reviewer", action: "Verified inspection report", entityType: "Report", entityId: claimId, details: "Report is now an authoritative REA verified record." });
  }, [appendAudit, updateClaim]);

  const rejectClaim = useCallback((claimId: string, reason: string) => {
    updateClaim(claimId, { status: "Rejected", recommendation: reason });
    appendAudit({ actor: "Engr. Fatima Sani", role: "REA Admin", action: "Rejected claim", entityType: "Claim", entityId: claimId, details: reason });
  }, [appendAudit, updateClaim]);

  const addUser = useCallback((user: Omit<PortalUser, "id" | "lastActive">) => {
    const record: PortalUser = { ...user, id: `USR-${String(users.length + 1).padStart(3, "0")}`, lastActive: "Never" };
    setUsers((current) => [record, ...current]);
    appendAudit({ actor: "Engr. Fatima Sani", role: "REA Admin", action: "Created user", entityType: "User", entityId: record.id, details: `${record.name} added as ${record.role}.` });
  }, [appendAudit, users.length]);

  const toggleUserStatus = useCallback((userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    const status = user.status === "Suspended" ? "Active" : "Suspended";
    setUsers((current) => current.map((item) => item.id === userId ? { ...item, status } : item));
    appendAudit({ actor: "Engr. Fatima Sani", role: "REA Admin", action: status === "Active" ? "Reactivated user" : "Suspended user", entityType: "User", entityId: userId, details: `${user.name} status changed to ${status}.` });
  }, [appendAudit, users]);

  const resetDemo = useCallback(() => {
    setClaims(initialClaims);
    setUsers(initialUsers);
    setAuditEvents(initialAudit);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AtlasGridContextValue>(() => ({
    contracts,
    claims,
    users,
    auditEvents,
    consultants: ["NorthGrid Consultants", "GridSure Advisory", "Capital Verification Partners", "SouthWest Grid Audit", "Eastern Energy Review"],
    fieldOfficers,
    createClaim,
    validateClaim,
    assignConsultant,
    assignFieldOfficer,
    verifyArrival,
    startInspection,
    updateInspectionProgress,
    submitInspection,
    consultantApprove,
    returnForReinspection,
    reaVerify,
    rejectClaim,
    addUser,
    toggleUserStatus,
    resetDemo,
  }), [addUser, assignConsultant, assignFieldOfficer, auditEvents, claims, consultantApprove, createClaim, fieldOfficers, reaVerify, rejectClaim, resetDemo, returnForReinspection, startInspection, submitInspection, toggleUserStatus, updateInspectionProgress, users, validateClaim, verifyArrival]);

  return <AtlasGridContext.Provider value={value}>{children}</AtlasGridContext.Provider>;
}

export function useAtlasGrid() {
  const context = useContext(AtlasGridContext);
  if (!context) throw new Error("useAtlasGrid must be used within AtlasGridProvider");
  return context;
}
