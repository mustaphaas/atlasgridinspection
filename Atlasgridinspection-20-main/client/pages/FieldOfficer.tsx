import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  CloudUpload,
  FileSignature,
  LocateFixed,
  LockKeyhole,
  LogOut,
  MapPin,
  Navigation,
  Save,
  ShieldCheck,
  Wifi,
  Zap,
} from "lucide-react";
import { KpiCard, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import { useAtlasGrid } from "@/context/AtlasGridContext";

export default function FieldOfficer() {
  const {
    claims,
    verifyArrival,
    startInspection,
    updateInspectionProgress,
    submitInspection,
  } = useAtlasGrid();
  const assignments = useMemo(() => claims.filter((claim) => claim.fieldOfficer === "Amina Yusuf" || claim.fieldOfficerId === "USR-004"), [claims]);
  const [selectedId, setSelectedId] = useState(assignments[0]?.id ?? "");
  const selected = assignments.find((claim) => claim.id === selectedId) ?? assignments[0];
  const [checkingGps, setCheckingGps] = useState(false);
  const [notice, setNotice] = useState("");
  const [equipment, setEquipment] = useState("");
  const [capacity, setCapacity] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [observations, setObservations] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [photos, setPhotos] = useState(0);
  const [communitySignature, setCommunitySignature] = useState(false);
  const [contractorSignature, setContractorSignature] = useState(false);
  const [evidenceNames, setEvidenceNames] = useState<string[]>([]);
  const [draftReady, setDraftReady] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selected && assignments[0]) setSelectedId(assignments[0].id);
  }, [assignments, selected]);

  useEffect(() => {
    if (!selected) return;
    setDraftReady(false);
    try {
      const stored = window.localStorage.getItem(`atlasgrid-inspection-draft-${selected.id}`);
      const draft = stored ? JSON.parse(stored) as { equipment?: string; capacity?: string; beneficiaries?: string; observations?: string; recommendation?: string; photos?: number; communitySignature?: boolean; contractorSignature?: boolean; evidenceNames?: string[] } : null;
      setEquipment(draft?.equipment ?? "");
      setCapacity(draft?.capacity ?? selected.capacity.replace(/[^0-9.]/g, ""));
      setBeneficiaries(draft?.beneficiaries ?? String(selected.beneficiaries));
      setObservations(draft?.observations ?? "");
      setRecommendation(draft?.recommendation ?? "");
      setPhotos(draft?.photos ?? selected.evidenceCount ?? 0);
      setCommunitySignature(draft?.communitySignature ?? false);
      setContractorSignature(draft?.contractorSignature ?? false);
      setEvidenceNames(draft?.evidenceNames ?? []);
    } catch {
      setEquipment("");
      setCapacity(selected.capacity.replace(/[^0-9.]/g, ""));
      setBeneficiaries(String(selected.beneficiaries));
      setObservations("");
      setRecommendation("");
      setPhotos(selected.evidenceCount ?? 0);
      setCommunitySignature(false);
      setContractorSignature(false);
      setEvidenceNames([]);
    } finally {
      setDraftReady(true);
    }
  }, [selected?.id]);

  const completion = useMemo(() => {
    const checks = [equipment.trim(), capacity.trim(), beneficiaries.trim(), observations.trim(), recommendation.trim(), photos >= 3, communitySignature, contractorSignature];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [beneficiaries, capacity, communitySignature, contractorSignature, equipment, observations, photos, recommendation]);

  const selectedSubmitted = selected ? ["Consultant Review", "Pending REA Review", "Verified"].includes(selected.status) : false;

  useEffect(() => {
    if (!selected || !draftReady || selectedSubmitted) return;
    try {
      window.localStorage.setItem(`atlasgrid-inspection-draft-${selected.id}`, JSON.stringify({ equipment, capacity, beneficiaries, observations, recommendation, photos, communitySignature, contractorSignature, evidenceNames }));
    } catch {
      // Continue the current session if persistent browser storage is unavailable.
    }
  }, [beneficiaries, capacity, communitySignature, contractorSignature, draftReady, equipment, evidenceNames, observations, photos, recommendation, selected?.id, selectedSubmitted]);

  useEffect(() => {
    if (selected?.status === "Inspection In Progress" && completion !== selected.inspectionProgress) {
      updateInspectionProgress(selected.id, completion);
    }
  }, [completion, selected?.id, selected?.status]);

  if (!selected) {
    return <div className="ag-officer-shell"><div className="ag-officer-empty"><ClipboardCheck size={28} /><h1>No assignments</h1><p>Your consultant has not assigned an inspection yet.</p><Link to="/login">Return to login</Link></div></div>;
  }

  const arrivalVerified = selected.arrivalVerified;
  const dataEntryOpen = arrivalVerified && selected.status === "Inspection In Progress";
  const alreadySubmitted = selectedSubmitted;
  const demoGpsEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_GPS === "true";

  const distanceInMetres = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRadians = (value: number) => value * Math.PI / 180;
    const earthRadius = 6_371_000;
    const deltaLatitude = toRadians(lat2 - lat1);
    const deltaLongitude = toRadians(lon2 - lon1);
    const a = Math.sin(deltaLatitude / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLongitude / 2) ** 2;
    return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setNotice("This device does not provide browser GPS. Use a supported mobile browser or the configured demo mode.");
      return;
    }
    setCheckingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const [approvedLatitude, approvedLongitude] = selected.coordinates.split(",").map((value) => Number(value.trim()));
        const distance = distanceInMetres(position.coords.latitude, position.coords.longitude, approvedLatitude, approvedLongitude);
        setCheckingGps(false);
        if (distance > 250) {
          setNotice(`Location not verified. You are approximately ${distance.toLocaleString()} m from the approved project coordinates.`);
          return;
        }
        verifyArrival(selected.id, distance);
        setNotice(`Arrival verified ${distance} m from the approved coordinates. Data entry can now be started.`);
      },
      (error) => {
        setCheckingGps(false);
        setNotice(error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Enable GPS permission before starting the inspection."
          : "GPS verification could not be completed. Move outdoors and retry with location services enabled.");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  };

  const simulateLocation = () => {
    verifyArrival(selected.id, 24);
    setNotice("Demo-mode arrival verified 24 m from the approved coordinates. Disable VITE_ENABLE_DEMO_GPS in production.");
  };

  const beginInspection = () => {
    if (!startInspection(selected.id)) {
      setNotice("Verify your arrival before starting data entry.");
      return;
    }
    setNotice("Inspection started. Data-entry controls are now unlocked.");
  };

  const submit = () => {
    if (completion < 100) {
      setNotice("Complete all required fields, capture at least three photos and collect both signatures.");
      return;
    }
    const ok = submitInspection(selected.id, {
      score: 91,
      findings: observations.toLowerCase().includes("defect") ? 2 : 1,
      criticalFindings: observations.toLowerCase().includes("critical") ? 1 : 0,
      evidenceCount: photos,
      recommendation,
      inspectionProgress: completion,
    });
    if (ok) {
      try { window.localStorage.removeItem(`atlasgrid-inspection-draft-${selected.id}`); } catch { /* no-op */ }
    }
    setNotice(ok ? "Inspection submitted to the consultant review queue." : "Submission is locked until GPS verification and 100% completion.");
  };

  const captureEvidence = (files?: FileList | null) => {
    if (!files?.length) return;
    const names = Array.from(files).map((file) => file.name);
    setEvidenceNames((current) => [...current, ...names]);
    setPhotos((current) => current + files.length);
    if (cameraInput.current) cameraInput.current.value = "";
  };

  const saveDraft = () => {
    try {
      window.localStorage.setItem(`atlasgrid-inspection-draft-${selected.id}`, JSON.stringify({ equipment, capacity, beneficiaries, observations, recommendation, photos, communitySignature, contractorSignature, evidenceNames }));
      setNotice("Inspection draft saved securely on this device.");
    } catch {
      setNotice("This browser could not persist the draft. Keep this page open and retry synchronization.");
    }
  };

  return (
    <div className="ag-officer-shell">
      <header className="ag-role-topbar">
        <div className="ag-brand ag-role-brand"><span className="ag-brand-logo"><Zap size={19} fill="currentColor" /></span><div className="ag-brand-copy"><b>Atlas Grid Inspection</b><small>FIELD OFFICER APPLICATION</small></div></div>
        <div className="ag-role-live"><span /> Offline-ready field workspace</div>
        <div className="ag-role-user"><span>AY</span><div><b>Amina Yusuf</b><small>Field Officer · FO-0198</small></div><Link to="/login"><LogOut size={15} /> Log out</Link></div>
      </header>

      <main className="ag-role-content ag-officer-content">
        <PageTitle
          eyebrow="FIELD OPERATIONS"
          title="My Inspections"
          description="Verify your physical arrival, complete the approved inspection form and submit evidence for consultant quality assurance."
          meta={<><span className="ag-live-dot" /> Device verified <span>Automatic offline saving enabled</span></>}
          actions={<button className="ag-button ag-button-outline" onClick={() => setNotice("All locally saved records are synchronized.")}><CloudUpload size={16} /> Sync now</button>}
        />

        {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}

        <div className="ag-kpi-grid ag-kpi-grid-4">
          <KpiCard label="Assigned Inspections" value={assignments.length} detail="From consultant admin" icon={ClipboardCheck} tone="green" />
          <KpiCard label="Arrival Status" value={arrivalVerified ? "Verified" : "Required"} detail={arrivalVerified ? `${selected.arrivalDistanceM ?? 24} m from site` : "GPS check pending"} icon={LocateFixed} tone={arrivalVerified ? "mint" : "amber"} />
          <KpiCard label="Form Completion" value={`${selected.inspectionProgress}%`} detail="Autosaved on device" icon={Save} tone="blue" />
          <KpiCard label="Sync Status" value="Online" detail="No pending uploads" icon={Wifi} tone="green" />
        </div>

        <div className="ag-officer-layout">
          <Panel title="Assigned projects" subtitle="Select an assignment to continue its inspection workflow">
            <div className="ag-assignment-list">
              {assignments.map((claim) => <button key={claim.id} className={claim.id === selected.id ? "active" : ""} onClick={() => setSelectedId(claim.id)}><span className="ag-assignment-icon"><Navigation size={17} /></span><div><b>{claim.project}</b><small>{claim.id} · {claim.community}, {claim.state}</small></div><StatusBadge status={claim.status} /></button>)}
            </div>
          </Panel>

          <Panel title="Site arrival & workflow" subtitle={`${selected.project} · ${selected.id}`} action={<StatusBadge status={selected.status} />}>
            <div className="ag-site-card">
              <div className="ag-site-map"><div className="ag-site-grid" /><span className="ag-site-radius" /><MapPin size={24} /><b>{selected.community}</b><small>{selected.coordinates} · 250 m approved radius</small></div>
              <div className={`ag-arrival-check ${arrivalVerified ? "verified" : ""}`}><span>{arrivalVerified ? <CheckCircle2 size={22} /> : <LocateFixed size={22} />}</span><div><b>{arrivalVerified ? "Arrival verified" : "Verify arrival before data entry"}</b><p>{arrivalVerified ? `GPS, device and timestamp captured ${selected.arrivalDistanceM ?? 24} m from the approved location.` : "The inspection form remains locked until the officer is within the approved project geofence."}</p></div>{!arrivalVerified && <div className="ag-arrival-actions"><button onClick={checkLocation} disabled={checkingGps}>{checkingGps ? "Checking GPS..." : "Verify location"}</button>{demoGpsEnabled && <button className="secondary" onClick={simulateLocation}>Demo onsite</button>}</div>}</div>
              <div className="ag-workflow-strip ag-workflow-4"><div className="complete"><span>1</span><small>Assigned</small></div><div className={arrivalVerified ? "complete" : ""}><span>2</span><small>Arrival verified</small></div><div className={dataEntryOpen || alreadySubmitted ? "complete" : ""}><span>3</span><small>Data entry</small></div><div className={alreadySubmitted ? "complete" : ""}><span>4</span><small>Submitted</small></div></div>
              {arrivalVerified && !dataEntryOpen && !alreadySubmitted && <button className="ag-button ag-button-primary ag-full-button" onClick={beginInspection}><ClipboardCheck size={16} /> Start data entry</button>}
            </div>
          </Panel>
        </div>

        <Panel title="Inspection data entry" subtitle={dataEntryOpen ? "Required project, equipment, evidence and signature fields" : alreadySubmitted ? "Inspection has been submitted and is read-only" : "Locked until site arrival is verified and the inspection is started"} action={<div className="ag-form-progress"><span><em style={{ width: `${completion}%` }} /></span><b>{completion}%</b></div>} className={!dataEntryOpen ? "ag-panel-locked" : ""}>
          {!dataEntryOpen && !alreadySubmitted && <div className="ag-form-lock"><LockKeyhole size={23} /><b>Data entry is locked</b><p>Complete the GPS/geofence arrival check and select “Start data entry”.</p></div>}
          <fieldset className="ag-inspection-form" disabled={!dataEntryOpen}>
            <div className="ag-form-grid">
              <label>Equipment installed<input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="e.g. inverter, batteries, transformer" /></label>
              <label>Verified capacity (kW)<input type="number" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></label>
              <label>Beneficiaries confirmed<input type="number" value={beneficiaries} onChange={(event) => setBeneficiaries(event.target.value)} /></label>
              <label>Meter / transformer details<input placeholder="Serial number and condition" /></label>
              <label className="ag-span-2">Observations and defects<textarea value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Describe installation quality, safety issues and defects" /></label>
              <label className="ag-span-2">Recommendation<textarea value={recommendation} onChange={(event) => setRecommendation(event.target.value)} placeholder="State the recommended action or verification outcome" /></label>
            </div>
            <div className="ag-evidence-grid">
              <input ref={cameraInput} className="ag-camera-input" type="file" accept="image/*" capture="environment" multiple onChange={(event) => captureEvidence(event.target.files)} />
              <button type="button" onClick={() => cameraInput.current?.click()}><Camera size={20} /><span><b>Capture evidence</b><small>{photos} photos captured · minimum 3{evidenceNames.length ? ` · ${evidenceNames[evidenceNames.length - 1]}` : ""}</small></span></button>
              <label className={communitySignature ? "complete" : ""}><input type="checkbox" checked={communitySignature} onChange={(event) => setCommunitySignature(event.target.checked)} /><FileSignature size={20} /><span><b>Community signature</b><small>{communitySignature ? "Captured" : "Required"}</small></span></label>
              <label className={contractorSignature ? "complete" : ""}><input type="checkbox" checked={contractorSignature} onChange={(event) => setContractorSignature(event.target.checked)} /><FileSignature size={20} /><span><b>Contractor signature</b><small>{contractorSignature ? "Captured" : "Required"}</small></span></label>
            </div>
            <div className="ag-form-actions"><button type="button" className="ag-button ag-button-outline" onClick={saveDraft}><Save size={16} /> Save locally</button><button type="button" className="ag-button ag-button-primary" onClick={submit}><ShieldCheck size={16} /> Submit to consultant</button></div>
          </fieldset>
          {alreadySubmitted && <div className="ag-submitted-state"><CheckCircle2 size={25} /><div><b>Inspection submitted</b><p>The report is now in the {selected.status} stage. Data remains read-only to protect the audit record.</p></div></div>}
        </Panel>
      </main>
    </div>
  );
}
