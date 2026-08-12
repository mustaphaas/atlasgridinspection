import { useMemo, useState, type ReactNode } from "react";
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSignature,
  Gauge,
  Image as ImageIcon,
  LocateFixed,
  ShieldCheck,
  TriangleAlert,
  UserRoundCheck,
  X,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/ModernUI";
import type {
  ClaimRecord,
  InspectionEvidenceRecord,
  InspectionFormRecord,
} from "@/context/AtlasGridContext";

export type InspectionReportTab =
  | "Summary"
  | "Field form"
  | "Equipment"
  | "Findings"
  | "Evidence"
  | "Signatures"
  | "Review history";

const tabs: { label: InspectionReportTab; icon: typeof ClipboardCheck }[] = [
  { label: "Summary", icon: Gauge },
  { label: "Field form", icon: ClipboardCheck },
  { label: "Equipment", icon: Zap },
  { label: "Findings", icon: TriangleAlert },
  { label: "Evidence", icon: Camera },
  { label: "Signatures", icon: FileSignature },
  { label: "Review history", icon: ShieldCheck },
];

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div className="ag-report-detail"><small>{label}</small><b>{children}</b></div>;
}

function SignatureCard({ title, signature }: { title: string; signature: InspectionFormRecord["signatures"]["community"] }) {
  return (
    <article className={`ag-signature-card ${signature.captured ? "is-complete" : ""}`}>
      <span>{signature.captured ? <CheckCircle2 size={21} /> : <FileSignature size={21} />}</span>
      <div><small>{title}</small><b>{signature.name || "Not captured"}</b><p>{signature.role} · {signature.phone || "No phone"}</p><em>{signature.captured ? `Signed ${signature.signedAt}` : "Signature missing"}</em></div>
    </article>
  );
}

function EvidencePreview({ evidence, onClose }: { evidence: InspectionEvidenceRecord; onClose: () => void }) {
  return (
    <div className="ag-evidence-preview" role="dialog" aria-modal="true" aria-label={`${evidence.category} evidence details`}>
      <button type="button" onClick={onClose} aria-label="Close evidence preview"><X size={17} /></button>
      <div className="ag-evidence-placeholder"><ImageIcon size={38} /><span>{evidence.category}</span><small>GPS-tagged {evidence.kind.toLowerCase()} evidence</small></div>
      <dl>
        <div><dt>File</dt><dd>{evidence.fileName}</dd></div>
        <div><dt>Captured</dt><dd>{evidence.capturedAt}</dd></div>
        <div><dt>Coordinates</dt><dd>{evidence.coordinates}</dd></div>
        <div><dt>Project ID</dt><dd>{evidence.projectId}</dd></div>
        <div><dt>Officer</dt><dd>{evidence.officerName}</dd></div>
        <div><dt>Evidence ID</dt><dd>{evidence.id}</dd></div>
      </dl>
    </div>
  );
}

export default function InspectionReportView({
  claim,
  initialTab = "Summary",
}: {
  claim: ClaimRecord;
  initialTab?: InspectionReportTab;
}) {
  const [tab, setTab] = useState<InspectionReportTab>(initialTab);
  const [selectedEvidence, setSelectedEvidence] = useState<InspectionEvidenceRecord | null>(null);
  const form = claim.inspectionForm;

  const severityCounts = useMemo(() => {
    const counts = { Critical: 0, Major: 0, Moderate: 0, Minor: 0 };
    form?.findings.forEach((finding) => { counts[finding.severity] += 1; });
    return counts;
  }, [form]);

  if (!form) {
    return (
      <div className="ag-report-empty">
        <ClipboardCheck size={28} />
        <h3>No submitted inspection form</h3>
        <p>This workflow record has not reached field-form submission yet.</p>
        <StatusBadge status={claim.status} />
      </div>
    );
  }

  const coverage = form.beneficiaries.expected
    ? Math.round((form.beneficiaries.verified / form.beneficiaries.expected) * 100)
    : 0;

  return (
    <div className="ag-report-view">
      <div className="ag-report-header-card">
        <div>
          <span className="ag-report-document-icon"><FileCheck2 size={22} /></span>
          <div><small>{form.formVersion} · CONTROLLED WORKFLOW RECORD</small><h3>{form.reportId}</h3><p>{claim.project} · {claim.community}, {claim.lga}, {claim.state}</p></div>
        </div>
        <div className="ag-report-header-status"><StatusBadge status={claim.status} /><small>Submitted {form.submittedAt}</small></div>
      </div>

      <nav className="ag-report-tabs" aria-label="Inspection report sections">
        {tabs.map(({ label, icon: Icon }) => (
          <button key={label} type="button" className={tab === label ? "active" : ""} onClick={() => setTab(label)}>
            <Icon size={15} /><span>{label}</span>
          </button>
        ))}
      </nav>

      {tab === "Summary" && (
        <div className="ag-report-section-stack">
          <div className="ag-report-summary-grid">
            <Detail label="Inspection type">{form.inspectionType}</Detail>
            <Detail label="Field officer">{claim.fieldOfficer ?? form.signatures.officer.name}</Detail>
            <Detail label="Consultant">{claim.consultant ?? "Not assigned"}</Detail>
            <Detail label="Inspection score">{claim.score ?? form.consultantReview?.score ?? 0}%</Detail>
            <Detail label="GPS verification">{form.gps.verified ? `Verified · ${form.gps.distanceM} m` : "Not verified"}</Detail>
            <Detail label="Device ID">{form.deviceId}</Detail>
            <Detail label="Started">{form.startedAt}</Detail>
            <Detail label="Submitted">{form.submittedAt}</Detail>
          </div>
          <div className="ag-report-metrics">
            <article><span><LocateFixed size={19} /></span><div><b>{form.gps.distanceM} m</b><small>Distance from approved coordinates</small></div></article>
            <article><span><Zap size={19} /></span><div><b>{form.capacity.observedKw} kW</b><small>Verified capacity · {form.capacity.variancePercent}% variance</small></div></article>
            <article><span><UserRoundCheck size={19} /></span><div><b>{form.beneficiaries.verified}</b><small>Beneficiaries confirmed · {coverage}% coverage</small></div></article>
            <article><span><Camera size={19} /></span><div><b>{form.evidence.length}</b><small>GPS-tagged evidence files</small></div></article>
          </div>
          <div className="ag-report-narrative"><div><small>Field observations</small><p>{form.observations}</p></div><div><small>Field recommendation</small><p>{form.recommendation}</p></div></div>
        </div>
      )}

      {tab === "Field form" && (
        <div className="ag-report-section-stack">
          <section className="ag-form-review-section"><header><div><span>01</span><h4>Project and GPS verification</h4></div><StatusBadge status={form.gps.verified ? "Verified" : "Not verified"} /></header><div className="ag-report-summary-grid"><Detail label="Project ID">{claim.projectId}</Detail><Detail label="Contract ID">{claim.contractId}</Detail><Detail label="Approved coordinates">{form.gps.approvedCoordinates}</Detail><Detail label="Captured coordinates">{form.gps.capturedCoordinates}</Detail><Detail label="GPS accuracy">{form.gps.accuracyM} m</Detail><Detail label="GPS timestamp">{form.gps.capturedAt}</Detail></div></section>
          <section className="ag-form-review-section"><header><div><span>02</span><h4>Contractor representative</h4></div><StatusBadge status={form.contractorRepresentative.presentOnSite ? "Present" : "Absent"} /></header><div className="ag-report-summary-grid"><Detail label="Name">{form.contractorRepresentative.name}</Detail><Detail label="Role">{form.contractorRepresentative.role}</Detail><Detail label="Phone">{form.contractorRepresentative.phone}</Detail><Detail label="Present on site">{form.contractorRepresentative.presentOnSite ? "Yes" : "No"}</Detail></div></section>
          <section className="ag-form-review-section"><header><div><span>03</span><h4>Meter and transformer</h4></div></header><div className="ag-report-summary-grid"><Detail label="Meter number">{form.meter.number}</Detail><Detail label="Meter type">{form.meter.type}</Detail><Detail label="Meter condition">{form.meter.condition}</Detail><Detail label="Meter reading">{form.meter.reading}</Detail><Detail label="Transformer serial">{form.transformer.serialNumber}</Detail><Detail label="Transformer rating">{form.transformer.ratingKva} kVA</Detail><Detail label="Transformer condition">{form.transformer.condition}</Detail><Detail label="Operational">{form.transformer.operational ? "Yes" : "No"}</Detail></div></section>
          <section className="ag-form-review-section"><header><div><span>04</span><h4>Infrastructure and beneficiaries</h4></div></header><div className="ag-report-summary-grid"><Detail label="Poles expected / observed">{form.infrastructure.expectedPoles} / {form.infrastructure.observedPoles}</Detail><Detail label="Damaged poles">{form.infrastructure.damagedPoles}</Detail><Detail label="Cable installed">{form.infrastructure.installedCableLengthM.toLocaleString()} m</Detail><Detail label="Cable type">{form.infrastructure.cableType}</Detail><Detail label="Beneficiaries expected / verified">{form.beneficiaries.expected} / {form.beneficiaries.verified}</Detail><Detail label="Residential">{form.beneficiaries.residential}</Detail><Detail label="Commercial">{form.beneficiaries.commercial}</Detail><Detail label="Public facilities">{form.beneficiaries.publicFacilities}</Detail></div></section>
        </div>
      )}

      {tab === "Equipment" && (
        <div className="ag-table-scroll ag-report-table-wrap">
          <table className="ag-table ag-report-table"><thead><tr><th>Equipment</th><th>Manufacturer / Model</th><th>Serial number</th><th>Quantity</th><th>Capacity</th><th>Condition</th><th>Status</th></tr></thead><tbody>{form.equipment.map((equipment) => <tr key={equipment.id}><td><b>{equipment.type}</b><small>{equipment.id}</small></td><td><b>{equipment.manufacturer}</b><small>{equipment.model}</small></td><td>{equipment.serialNumber}</td><td>{equipment.quantity}</td><td>{equipment.capacity}</td><td><StatusBadge status={equipment.condition} /></td><td><StatusBadge status={equipment.operational ? "Operational" : "Not operational"} /></td></tr>)}</tbody></table>
        </div>
      )}

      {tab === "Findings" && (
        <div className="ag-report-section-stack">
          <div className="ag-finding-summary">{Object.entries(severityCounts).map(([severity, value]) => <div key={severity}><StatusBadge status={severity} /><b>{value}</b><small>{severity} findings</small></div>)}</div>
          <div className="ag-findings-list">{form.findings.length ? form.findings.map((finding) => <article key={finding.id}><div><StatusBadge status={finding.severity} /><StatusBadge status={finding.status} /></div><h4>{finding.category}</h4><p>{finding.description}</p><section><small>Required corrective action</small><b>{finding.correctiveAction}</b></section>{finding.evidenceReference && <button type="button" onClick={() => { const evidence = form.evidence.find((item) => item.id === finding.evidenceReference); if (evidence) { setSelectedEvidence(evidence); } }}>Open linked evidence</button>}</article>) : <div className="ag-report-empty"><CheckCircle2 size={25} /><h3>No findings recorded</h3><p>The field officer did not record any defects or exceptions.</p></div>}</div>
        </div>
      )}

      {tab === "Evidence" && (
        <div className="ag-evidence-gallery">{form.evidence.map((evidence, index) => <button type="button" key={evidence.id} onClick={() => setSelectedEvidence(evidence)}><div><ImageIcon size={25} /><span>{String(index + 1).padStart(2, "0")}</span></div><b>{evidence.category}</b><small>{evidence.fileName}</small><em>{evidence.capturedAt}</em></button>)}</div>
      )}

      {tab === "Signatures" && (
        <div className="ag-signature-grid"><SignatureCard title="Community representative" signature={form.signatures.community} /><SignatureCard title="Contractor representative" signature={form.signatures.contractor} /><SignatureCard title="Field officer declaration" signature={form.signatures.officer} /><div className="ag-declaration-card"><ShieldCheck size={23} /><div><b>Officer declaration</b><p>{form.declarationAccepted ? "The field officer confirmed the submitted information accurately represents the conditions observed during the inspection." : "Declaration was not accepted."}</p></div><StatusBadge status={form.declarationAccepted ? "Accepted" : "Missing"} /></div></div>
      )}

      {tab === "Review history" && (
        <div className="ag-review-timeline">
          <article className="complete"><span><ClipboardCheck size={18} /></span><div><small>FIELD SUBMISSION</small><h4>{form.signatures.officer.name}</h4><p>Submitted the complete inspection form with {form.evidence.length} evidence files and required signatures.</p><em>{form.submittedAt}</em></div><StatusBadge status="Submitted" /></article>
          <article className={form.consultantReview?.decision === "Approved" ? "complete" : form.consultantReview?.decision === "Returned" ? "returned" : "pending"}><span><UserRoundCheck size={18} /></span><div><small>CONSULTANT QUALITY ASSURANCE</small><h4>{form.consultantReview?.reviewerName ?? claim.consultantLead ?? "Pending consultant review"}</h4><p>{form.consultantReview?.notes ?? "Awaiting consultant review."}</p><em>{form.consultantReview?.reviewedAt ?? "Pending"}</em>{form.consultantReview && <ul><li className={form.consultantReview.gpsChecked ? "checked" : ""}>GPS checked</li><li className={form.consultantReview.evidenceChecked ? "checked" : ""}>Evidence checked</li><li className={form.consultantReview.signaturesChecked ? "checked" : ""}>Signatures checked</li><li className={form.consultantReview.formCompletenessChecked ? "checked" : ""}>Form completeness checked</li></ul>}</div><StatusBadge status={form.consultantReview?.decision ?? "Pending"} /></article>
          <article className={form.reaVerification?.decision === "Verified" ? "complete" : form.reaVerification?.decision === "Returned" || form.reaVerification?.decision === "Rejected" ? "returned" : "pending"}><span><ShieldCheck size={18} /></span><div><small>REA FINAL VERIFICATION</small><h4>{form.reaVerification?.verifierName ?? "Pending REA reviewer"}</h4><p>{form.reaVerification?.notes ?? "Awaiting final REA verification."}</p><em>{form.reaVerification?.verifiedAt ?? "Pending"}</em>{form.reaVerification?.controlledRecordNumber && <strong>Controlled record: {form.reaVerification.controlledRecordNumber}</strong>}</div><StatusBadge status={form.reaVerification?.decision ?? "Pending"} /></article>
        </div>
      )}

      {selectedEvidence && <EvidencePreview evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />}
    </div>
  );
}
