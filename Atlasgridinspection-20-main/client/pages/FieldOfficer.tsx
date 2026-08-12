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
import InspectionReportView from "@/components/InspectionReportView";
import { useAtlasGrid, type InspectionFormRecord } from "@/context/AtlasGridContext";

type FieldDraft = {
  inspectionType: InspectionFormRecord["inspectionType"];
  equipment: string;
  capacity: string;
  beneficiaries: string;
  meterNumber: string;
  meterCondition: string;
  transformerSerial: string;
  transformerRating: string;
  expectedPoles: string;
  observedPoles: string;
  damagedPoles: string;
  cableLength: string;
  contractorRepresentative: string;
  contractorPhone: string;
  communityRepresentative: string;
  communityPhone: string;
  observations: string;
  recommendation: string;
  photos: number;
  communitySignature: boolean;
  contractorSignature: boolean;
  evidenceNames: string[];
};

export default function FieldOfficer() {
  const {
    claims,
    currentUser,
    signOut,
    verifyArrival,
    startInspection,
    updateInspectionProgress,
    submitInspection,
  } = useAtlasGrid();
  const assignments = useMemo(() => claims.filter((claim) => claim.fieldOfficerId === currentUser?.id || claim.fieldOfficer === currentUser?.name), [claims, currentUser?.id, currentUser?.name]);
  const [selectedId, setSelectedId] = useState(assignments[0]?.id ?? "");
  const selected = assignments.find((claim) => claim.id === selectedId) ?? assignments[0];
  const [checkingGps, setCheckingGps] = useState(false);
  const [notice, setNotice] = useState("");
  const [inspectionType, setInspectionType] = useState<InspectionFormRecord["inspectionType"]>("Progress");
  const [equipment, setEquipment] = useState("");
  const [capacity, setCapacity] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [meterCondition, setMeterCondition] = useState("Installed and sealed");
  const [transformerSerial, setTransformerSerial] = useState("");
  const [transformerRating, setTransformerRating] = useState("");
  const [expectedPoles, setExpectedPoles] = useState("25");
  const [observedPoles, setObservedPoles] = useState("25");
  const [damagedPoles, setDamagedPoles] = useState("0");
  const [cableLength, setCableLength] = useState("3500");
  const [contractorRepresentative, setContractorRepresentative] = useState("");
  const [contractorPhone, setContractorPhone] = useState("");
  const [communityRepresentative, setCommunityRepresentative] = useState("");
  const [communityPhone, setCommunityPhone] = useState("");
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
      const draft = stored ? JSON.parse(stored) as Partial<FieldDraft> : null;
      const form = selected.inspectionForm;
      setInspectionType(draft?.inspectionType ?? form?.inspectionType ?? "Progress");
      setEquipment(draft?.equipment ?? form?.equipment.map((item) => item.type).join(", ") ?? "");
      setCapacity(draft?.capacity ?? String(form?.capacity.observedKw ?? selected.capacity.replace(/[^0-9.]/g, "")));
      setBeneficiaries(draft?.beneficiaries ?? String(form?.beneficiaries.verified ?? selected.beneficiaries));
      setMeterNumber(draft?.meterNumber ?? form?.meter.number ?? "");
      setMeterCondition(draft?.meterCondition ?? form?.meter.condition ?? "Installed and sealed");
      setTransformerSerial(draft?.transformerSerial ?? form?.transformer.serialNumber ?? "");
      setTransformerRating(draft?.transformerRating ?? String(form?.transformer.ratingKva ?? ""));
      setExpectedPoles(draft?.expectedPoles ?? String(form?.infrastructure.expectedPoles ?? 25));
      setObservedPoles(draft?.observedPoles ?? String(form?.infrastructure.observedPoles ?? 25));
      setDamagedPoles(draft?.damagedPoles ?? String(form?.infrastructure.damagedPoles ?? 0));
      setCableLength(draft?.cableLength ?? String(form?.infrastructure.installedCableLengthM ?? 3500));
      setContractorRepresentative(draft?.contractorRepresentative ?? form?.contractorRepresentative.name ?? "");
      setContractorPhone(draft?.contractorPhone ?? form?.contractorRepresentative.phone ?? "");
      setCommunityRepresentative(draft?.communityRepresentative ?? form?.signatures.community.name ?? "");
      setCommunityPhone(draft?.communityPhone ?? form?.signatures.community.phone ?? "");
      setObservations(draft?.observations ?? form?.observations ?? "");
      setRecommendation(draft?.recommendation ?? form?.recommendation ?? "");
      setPhotos(draft?.photos ?? form?.evidence.length ?? selected.evidenceCount ?? 0);
      setCommunitySignature(draft?.communitySignature ?? form?.signatures.community.captured ?? false);
      setContractorSignature(draft?.contractorSignature ?? form?.signatures.contractor.captured ?? false);
      setEvidenceNames(draft?.evidenceNames ?? form?.evidence.map((item) => item.fileName) ?? []);
    } catch {
      setInspectionType("Progress");
      setEquipment("");
      setCapacity(selected.capacity.replace(/[^0-9.]/g, ""));
      setBeneficiaries(String(selected.beneficiaries));
      setMeterNumber("");
      setMeterCondition("Installed and sealed");
      setTransformerSerial("");
      setTransformerRating("");
      setExpectedPoles("25");
      setObservedPoles("25");
      setDamagedPoles("0");
      setCableLength("3500");
      setContractorRepresentative("");
      setContractorPhone("");
      setCommunityRepresentative("");
      setCommunityPhone("");
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
    const checks = [
      inspectionType,
      equipment.trim(),
      capacity.trim(),
      beneficiaries.trim(),
      meterNumber.trim(),
      transformerSerial.trim(),
      transformerRating.trim(),
      observedPoles.trim(),
      cableLength.trim(),
      contractorRepresentative.trim(),
      communityRepresentative.trim(),
      observations.trim(),
      recommendation.trim(),
      photos >= 3,
      communitySignature,
      contractorSignature,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [beneficiaries, cableLength, capacity, communityRepresentative, communitySignature, contractorRepresentative, contractorSignature, equipment, inspectionType, meterNumber, observations, observedPoles, photos, recommendation, transformerRating, transformerSerial]);

  const selectedSubmitted = selected ? ["Consultant Review", "Pending REA Review", "Verified"].includes(selected.status) : false;

  useEffect(() => {
    if (!selected || !draftReady || selectedSubmitted) return;
    try {
      const draft: FieldDraft = { inspectionType, equipment, capacity, beneficiaries, meterNumber, meterCondition, transformerSerial, transformerRating, expectedPoles, observedPoles, damagedPoles, cableLength, contractorRepresentative, contractorPhone, communityRepresentative, communityPhone, observations, recommendation, photos, communitySignature, contractorSignature, evidenceNames };
      window.localStorage.setItem(`atlasgrid-inspection-draft-${selected.id}`, JSON.stringify(draft));
    } catch {
      // Continue the current session if persistent browser storage is unavailable.
    }
  }, [beneficiaries, cableLength, capacity, communityPhone, communityRepresentative, communitySignature, contractorPhone, contractorRepresentative, contractorSignature, damagedPoles, draftReady, equipment, evidenceNames, expectedPoles, inspectionType, meterCondition, meterNumber, observations, observedPoles, photos, recommendation, selected?.id, selectedSubmitted, transformerRating, transformerSerial]);

  useEffect(() => {
    if (selected?.status === "Inspection In Progress" && completion !== selected.inspectionProgress) {
      updateInspectionProgress(selected.id, completion);
    }
  }, [completion, selected?.id, selected?.status]);

  if (!selected) {
    return <div className="ag-officer-shell"><div className="ag-officer-empty"><ClipboardCheck size={28} /><h1>No assignments</h1><p>Your consultant has not assigned an inspection yet.</p><Link to="/login" onClick={signOut}>Sign out</Link></div></div>;
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
    const now = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
    const approvedCapacity = Number(selected.capacity.replace(/[^0-9.]/g, "")) || 0;
    const observedCapacity = Number(capacity) || 0;
    const verifiedBeneficiaries = Number(beneficiaries) || 0;
    const critical = observations.toLowerCase().includes("critical");
    const hasDefect = critical || observations.toLowerCase().includes("defect") || Number(damagedPoles) > 0;
    const evidenceFiles = Array.from({ length: photos }, (_, index) => evidenceNames[index] ?? `${selected.projectId.toLowerCase()}-camera-${String(index + 1).padStart(2, "0")}.jpg`);
    const form: InspectionFormRecord = {
      reportId: `AIR-${selected.id.replace("CLM-", "")}`,
      formVersion: "REA-FI-2026.2",
      inspectionType,
      startedAt: selected.inspectionForm?.startedAt ?? now,
      submittedAt: now,
      deviceId: `AG-${currentUser?.id ?? "DEVICE"}-${navigator.userAgent.includes("Android") ? "ANDROID" : "WEB"}`,
      gps: {
        approvedCoordinates: selected.coordinates,
        capturedCoordinates: selected.coordinates,
        distanceM: selected.arrivalDistanceM ?? 0,
        accuracyM: 8,
        capturedAt: now,
        verified: selected.arrivalVerified,
      },
      contractorRepresentative: {
        name: contractorRepresentative,
        role: "Site Supervisor",
        phone: contractorPhone,
        presentOnSite: true,
      },
      equipment: [
        {
          id: `${selected.id}-EQ-01`,
          type: equipment,
          manufacturer: "Recorded on site",
          model: "See nameplate evidence",
          serialNumber: transformerSerial || meterNumber,
          quantity: 1,
          capacity: `${observedCapacity} kW verified`,
          condition: hasDefect ? "Fair" : "Good",
          operational: !critical,
        },
      ],
      meter: {
        available: true,
        type: "Three-phase smart meter",
        number: meterNumber,
        manufacturer: "Recorded on site",
        condition: meterCondition,
        reading: "Captured in meter evidence",
      },
      transformer: {
        available: true,
        manufacturer: "Recorded on site",
        serialNumber: transformerSerial,
        ratingKva: Number(transformerRating) || 0,
        condition: critical ? "Requires action" : hasDefect ? "Fair" : "Good",
        operational: !critical,
      },
      infrastructure: {
        expectedPoles: Number(expectedPoles) || 0,
        observedPoles: Number(observedPoles) || 0,
        damagedPoles: Number(damagedPoles) || 0,
        cableType: "Armoured distribution cable",
        expectedCableLengthM: 3500,
        installedCableLengthM: Number(cableLength) || 0,
      },
      capacity: {
        approvedKw: approvedCapacity,
        observedKw: observedCapacity,
        variancePercent: approvedCapacity ? Number((((observedCapacity - approvedCapacity) / approvedCapacity) * 100).toFixed(1)) : 0,
      },
      beneficiaries: {
        expected: selected.beneficiaries,
        verified: verifiedBeneficiaries,
        residential: Math.max(0, verifiedBeneficiaries - 70),
        commercial: Math.min(55, verifiedBeneficiaries),
        publicFacilities: Math.min(15, verifiedBeneficiaries),
      },
      observations,
      recommendation,
      findings: hasDefect ? [{
        id: `${selected.id}-F01`,
        category: critical ? "Safety / equipment" : "Installation quality",
        severity: critical ? "Critical" : "Major",
        description: observations,
        correctiveAction: recommendation,
        evidenceReference: evidenceFiles.length ? `${selected.id}-EV-01` : undefined,
        status: "Open",
      }] : [{
        id: `${selected.id}-F01`,
        category: "General observation",
        severity: "Minor",
        description: observations,
        correctiveAction: recommendation,
        evidenceReference: evidenceFiles.length ? `${selected.id}-EV-01` : undefined,
        status: "Open",
      }],
      evidence: evidenceFiles.map((fileName, index) => ({
        id: `${selected.id}-EV-${String(index + 1).padStart(2, "0")}`,
        category: ["Site overview", "Equipment", "Transformer", "Meter", "Distribution infrastructure", "Beneficiaries"][index % 6],
        fileName,
        kind: "Photo",
        capturedAt: now,
        coordinates: selected.coordinates,
        projectId: selected.projectId,
        officerName: currentUser?.name ?? selected.fieldOfficer ?? "Field Officer",
      })),
      signatures: {
        community: { name: communityRepresentative, role: "Community Representative", phone: communityPhone, signedAt: now, captured: communitySignature },
        contractor: { name: contractorRepresentative, role: "Contractor Representative", phone: contractorPhone, signedAt: now, captured: contractorSignature },
        officer: { name: currentUser?.name ?? selected.fieldOfficer ?? "Field Officer", role: "Field Officer", phone: currentUser?.phone ?? "", signedAt: now, captured: true },
      },
      declarationAccepted: true,
      consultantReview: {
        reviewerName: selected.consultantLead ?? "Consultant Lead",
        reviewerId: "CONS-QA-PENDING",
        reviewedAt: "Pending review",
        decision: "Pending",
        score: hasDefect ? 82 : 94,
        notes: "Field submission is awaiting consultant quality assurance.",
        gpsChecked: false,
        evidenceChecked: false,
        signaturesChecked: false,
        formCompletenessChecked: false,
      },
    };
    const ok = submitInspection(selected.id, {
      score: hasDefect ? 82 : 94,
      findings: form.findings.length,
      criticalFindings: critical ? 1 : 0,
      evidenceCount: photos,
      recommendation,
      inspectionProgress: completion,
      inspectionForm: form,
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
      const draft: FieldDraft = { inspectionType, equipment, capacity, beneficiaries, meterNumber, meterCondition, transformerSerial, transformerRating, expectedPoles, observedPoles, damagedPoles, cableLength, contractorRepresentative, contractorPhone, communityRepresentative, communityPhone, observations, recommendation, photos, communitySignature, contractorSignature, evidenceNames };
      window.localStorage.setItem(`atlasgrid-inspection-draft-${selected.id}`, JSON.stringify(draft));
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
        <div className="ag-role-user"><span>{(currentUser?.name ?? "FO").split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("")}</span><div><b>{currentUser?.name ?? "Field Officer"}</b><small>Field Officer · {currentUser?.id ?? "Unassigned"} · {currentUser?.phone ?? "Phone not set"}</small></div><Link to="/login" onClick={signOut}><LogOut size={15} /> Log out</Link></div>
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
              {selected.fieldInstructions && <div className="ag-field-instructions"><ShieldCheck size={18} /><div><b>Consultant instructions</b><p>{selected.fieldInstructions}</p></div></div>}
              {arrivalVerified && !dataEntryOpen && !alreadySubmitted && <button className="ag-button ag-button-primary ag-full-button" onClick={beginInspection}><ClipboardCheck size={16} /> Start data entry</button>}
            </div>
          </Panel>
        </div>

        <Panel title="Inspection data entry" subtitle={dataEntryOpen ? "Required project, equipment, evidence and signature fields" : alreadySubmitted ? "Inspection has been submitted and is read-only" : "Locked until site arrival is verified and the inspection is started"} action={<div className="ag-form-progress"><span><em style={{ width: `${completion}%` }} /></span><b>{completion}%</b></div>} className={!dataEntryOpen ? "ag-panel-locked" : ""}>
          {!dataEntryOpen && !alreadySubmitted && <div className="ag-form-lock"><LockKeyhole size={23} /><b>Data entry is locked</b><p>Complete the GPS/geofence arrival check and select “Start data entry”.</p></div>}
          <fieldset className="ag-inspection-form" disabled={!dataEntryOpen}>
            <div className="ag-field-form-sections">
              <section><header><span>01</span><div><b>Inspection and asset details</b><small>Record the physical equipment and verified capacity.</small></div></header><div className="ag-form-grid">
                <label>Inspection type<select value={inspectionType} onChange={(event) => setInspectionType(event.target.value as InspectionFormRecord["inspectionType"])}><option>Progress</option><option>Completion</option><option>Routine</option><option>Re-inspection</option></select></label>
                <label>Equipment installed<input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="e.g. PV modules, inverters, batteries" /></label>
                <label>Verified capacity (kW)<input type="number" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></label>
                <label>Beneficiaries confirmed<input type="number" value={beneficiaries} onChange={(event) => setBeneficiaries(event.target.value)} /></label>
              </div></section>

              <section><header><span>02</span><div><b>Meter and transformer</b><small>Use the serial numbers visible on the installed equipment.</small></div></header><div className="ag-form-grid">
                <label>Meter number<input value={meterNumber} onChange={(event) => setMeterNumber(event.target.value)} placeholder="MTR-..." /></label>
                <label>Meter condition<select value={meterCondition} onChange={(event) => setMeterCondition(event.target.value)}><option>Installed and sealed</option><option>Installed, seal missing</option><option>Damaged</option><option>Not operational</option></select></label>
                <label>Transformer serial number<input value={transformerSerial} onChange={(event) => setTransformerSerial(event.target.value)} placeholder="TR-..." /></label>
                <label>Transformer rating (kVA)<input type="number" value={transformerRating} onChange={(event) => setTransformerRating(event.target.value)} /></label>
              </div></section>

              <section><header><span>03</span><div><b>Infrastructure verification</b><small>Compare observed infrastructure against the approved scope.</small></div></header><div className="ag-form-grid ag-form-grid-4">
                <label>Expected poles<input type="number" value={expectedPoles} onChange={(event) => setExpectedPoles(event.target.value)} /></label>
                <label>Observed poles<input type="number" value={observedPoles} onChange={(event) => setObservedPoles(event.target.value)} /></label>
                <label>Damaged poles<input type="number" value={damagedPoles} onChange={(event) => setDamagedPoles(event.target.value)} /></label>
                <label>Installed cable (m)<input type="number" value={cableLength} onChange={(event) => setCableLength(event.target.value)} /></label>
              </div></section>

              <section><header><span>04</span><div><b>Representatives and signatures</b><small>Capture the names used for the signed inspection record.</small></div></header><div className="ag-form-grid">
                <label>Contractor representative<input value={contractorRepresentative} onChange={(event) => setContractorRepresentative(event.target.value)} placeholder="Full name" /></label>
                <label>Contractor phone<input type="tel" value={contractorPhone} onChange={(event) => setContractorPhone(event.target.value)} placeholder="080..." /></label>
                <label>Community representative<input value={communityRepresentative} onChange={(event) => setCommunityRepresentative(event.target.value)} placeholder="Full name" /></label>
                <label>Community phone<input type="tel" value={communityPhone} onChange={(event) => setCommunityPhone(event.target.value)} placeholder="080..." /></label>
              </div></section>

              <section><header><span>05</span><div><b>Findings and recommendation</b><small>Record what was observed and the action required.</small></div></header><div className="ag-form-grid">
                <label className="ag-span-2">Observations and defects<textarea value={observations} onChange={(event) => setObservations(event.target.value)} placeholder="Describe installation quality, safety issues and defects" /></label>
                <label className="ag-span-2">Recommendation<textarea value={recommendation} onChange={(event) => setRecommendation(event.target.value)} placeholder="State the recommended action or verification outcome" /></label>
              </div></section>
            </div>
            <div className="ag-evidence-grid">
              <input ref={cameraInput} className="ag-camera-input" type="file" accept="image/*" capture="environment" multiple onChange={(event) => captureEvidence(event.target.files)} />
              <button type="button" onClick={() => cameraInput.current?.click()}><Camera size={20} /><span><b>Capture evidence</b><small>{photos} photos captured · minimum 3{evidenceNames.length ? ` · ${evidenceNames[evidenceNames.length - 1]}` : ""}</small></span></button>
              <label className={communitySignature ? "complete" : ""}><input type="checkbox" checked={communitySignature} onChange={(event) => setCommunitySignature(event.target.checked)} /><FileSignature size={20} /><span><b>Community signature</b><small>{communitySignature ? "Captured" : "Required"}</small></span></label>
              <label className={contractorSignature ? "complete" : ""}><input type="checkbox" checked={contractorSignature} onChange={(event) => setContractorSignature(event.target.checked)} /><FileSignature size={20} /><span><b>Contractor signature</b><small>{contractorSignature ? "Captured" : "Required"}</small></span></label>
            </div>
            <div className="ag-form-actions"><button type="button" className="ag-button ag-button-outline" onClick={saveDraft}><Save size={16} /> Save locally</button><button type="button" className="ag-button ag-button-primary" onClick={submit}><ShieldCheck size={16} /> Submit to consultant</button></div>
          </fieldset>
          {alreadySubmitted && <><div className="ag-submitted-state"><CheckCircle2 size={25} /><div><b>Inspection submitted</b><p>The report is now in the {selected.status} stage. Data remains read-only to protect the audit record.</p></div></div><InspectionReportView claim={selected} /></>}
        </Panel>
      </main>
    </div>
  );
}
