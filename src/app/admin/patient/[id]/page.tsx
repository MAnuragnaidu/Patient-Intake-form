import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('userRole');

  if (userRole?.value !== 'ADMIN') {
    redirect('/');
  }

  const { id } = await params;
  const filePath = path.join(process.cwd(), 'submissions.json');
  let patients: any[] = [];
  if (fs.existsSync(filePath)) {
    patients = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  const patient = patients.find(p => p.id === parseInt(id, 10));

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1a' }}>
        <p style={{ color: '#94a3b8', fontFamily: 'IBM Plex Mono, monospace' }}>Patient not found</p>
      </div>
    );
  }

  // Parse array fields
  const parseSurgeries = (() => {
    try { return JSON.parse(patient.previousSurgeries || '[]'); } catch { return []; }
  })();
  const parsePreviousTreatments = (() => {
    try { return JSON.parse(patient.previousTreatmentsTried || '[]'); } catch { return []; }
  })();
  const parseComorbidities = (() => {
    try { return JSON.parse(patient.comorbidities || '[]'); } catch { return []; }
  })();

  const activityColor: Record<string, string> = {
    Remission: '#22c55e',
    Mild: '#facc15',
    Moderate: '#f97316',
    Severe: '#ef4444',
  };

  const severityBg: Record<string, string> = {
    Remission: 'rgba(34,197,94,0.12)',
    Mild: 'rgba(250,204,21,0.12)',
    Moderate: 'rgba(249,115,22,0.12)',
    Severe: 'rgba(239,68,68,0.12)',
  };

  const labStatusColor = (v: string) => {
    if (!v || v === '-') return '#64748b';
    if (v.toLowerCase().includes('negative')) return '#22c55e';
    if (v.toLowerCase().includes('positive')) return '#f97316';
    return '#94a3b8';
  };

  const actColor = activityColor[patient.currentDiseaseActivity] || '#94a3b8';
  const actBg = severityBg[patient.currentDiseaseActivity] || 'rgba(148,163,184,0.1)';

  const createdDate = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #070c16;
          font-family: 'Inter', sans-serif;
        }

        .pr-root {
          min-height: 100vh;
          background: #070c16;
          color: #e2e8f0;
        }

        /* ── HEADER BAND ── */
        .pr-header-band {
          background: linear-gradient(135deg, #0d1526 0%, #111827 60%, #0a1020 100%);
          border-bottom: 1px solid rgba(59,130,246,0.15);
          padding: 28px 40px 24px;
          position: relative;
          overflow: hidden;
        }
        .pr-header-band::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .pr-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #3b82f6;
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 20px;
          transition: color 0.2s;
        }
        .pr-back-link:hover { color: #93c5fd; }

        .pr-patient-hero {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .pr-avatar {
          width: 56px; height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1e3a5f, #1e40af);
          border: 1px solid rgba(59,130,246,0.3);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #93c5fd;
          flex-shrink: 0;
        }

        .pr-patient-meta { flex: 1; min-width: 0; }

        .pr-patient-name {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .pr-patient-sub {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 6px;
          flex-wrap: wrap;
        }

        .pr-mono-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #64748b;
          letter-spacing: 0.05em;
        }
        .pr-mono-tag span {
          color: #94a3b8;
          font-weight: 500;
        }

        .pr-dot { color: #1e3a5f; font-size: 8px; }

        .pr-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .pr-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          display: inline-block;
        }

        /* ── STATS STRIP ── */
        .pr-stats-strip {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .pr-stat-chip {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 8px 14px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pr-stat-chip-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .pr-stat-chip-value {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #cbd5e1;
        }

        /* ── MAIN LAYOUT ── */
        .pr-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 36px 32px 80px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 28px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .pr-body { grid-template-columns: 1fr; padding: 24px 16px 60px; }
          .pr-header-band { padding: 20px 16px 18px; }
        }

        /* ── SECTION CARD ── */
        .pr-card {
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .pr-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .pr-card-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }

        .pr-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #cbd5e1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          flex: 1;
        }

        .pr-card-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #334155;
          letter-spacing: 0.05em;
        }

        /* ── FIELD ROW ── */
        .pr-field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 6px 10px;
        }
        @media (max-width: 600px) {
          .pr-field-grid { grid-template-columns: 1fr; }
        }

        .pr-field {
          padding: 10px 12px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .pr-field:hover { background: rgba(255,255,255,0.025); }

        .pr-field-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 4px;
        }
        .pr-field-value {
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          color: #cbd5e1;
          font-weight: 400;
          line-height: 1.4;
          word-break: break-word;
        }
        .pr-field-value.empty { color: #334155; font-style: italic; }

        /* Tag list */
        .pr-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 2px;
        }
        .pr-tag {
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          color: #93c5fd;
          font-size: 11.5px;
          padding: 2px 9px;
          border-radius: 5px;
          font-family: 'Inter', sans-serif;
        }

        /* Serology pills */
        .pr-serology-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 10px;
          padding: 14px 22px 20px;
        }
        .pr-serology-pill {
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 10px 14px;
        }
        .pr-serology-pill-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 5px;
        }
        .pr-serology-pill-value {
          font-size: 12.5px;
          font-weight: 500;
        }

        /* Vaccine grid */
        .pr-vaccine-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 8px;
          padding: 14px 22px 20px;
        }
        .pr-vaccine-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.025);
          border-radius: 8px;
          padding: 8px 12px;
          gap: 8px;
        }
        .pr-vaccine-name {
          font-size: 12px;
          color: #94a3b8;
        }
        .pr-vaccine-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #64748b;
          text-align: right;
          flex-shrink: 0;
        }

        /* ── SIDEBAR ── */
        .pr-sidebar {}

        .pr-sidebar-card {
          background: #0d1526;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .pr-sidebar-card-header {
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #475569;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .pr-sidebar-rows {
          padding: 8px 0;
        }
        .pr-sidebar-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 7px 16px;
          gap: 8px;
        }
        .pr-sidebar-row-label {
          font-size: 11.5px;
          color: #475569;
          flex-shrink: 0;
        }
        .pr-sidebar-row-value {
          font-size: 12px;
          color: #94a3b8;
          text-align: right;
          font-weight: 500;
        }

        .pr-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 0 16px;
        }

        /* Infection alert */
        .pr-infection-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .pr-infection-row:last-child { border-bottom: none; }
        .pr-infection-label { font-size: 12px; color: #64748b; }

        /* Big indicator */
        .pr-big-indicator {
          padding: 16px;
          text-align: center;
        }
        .pr-big-indicator-value {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
        }
        .pr-big-indicator-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .pr-big-indicator-sub {
          font-size: 11px;
          color: #475569;
          margin-top: 6px;
        }

        /* Record ID watermark */
        .pr-record-id {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          color: #1e293b;
          padding: 10px 16px;
          text-align: right;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="pr-root">

        {/* ── HEADER ── */}
        <div className="pr-header-band">
          <Link href="/admin" className="pr-back-link">
            ← Back to Dashboard
          </Link>

          <div className="pr-patient-hero">
            <div className="pr-avatar">
              {patient.name?.charAt(0).toUpperCase()}
            </div>
            <div className="pr-patient-meta">
              <div className="pr-patient-name">{patient.name}</div>
              <div className="pr-patient-sub">
                <span className="pr-mono-tag">MRN <span>{patient.mrn || '—'}</span></span>
                <span className="pr-dot">●</span>
                <span className="pr-mono-tag">DOB <span>{patient.dateOfBirth || '—'}</span></span>
                <span className="pr-dot">●</span>
                <span className="pr-mono-tag">{patient.sex || '—'}</span>
                <span className="pr-dot">●</span>
                <div
                  className="pr-status-badge"
                  style={{ background: actBg, border: `1px solid ${actColor}30`, color: actColor }}
                >
                  <span className="pr-status-dot" style={{ background: actColor }} />
                  {patient.currentDiseaseActivity || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          <div className="pr-stats-strip">
            {[
              { label: 'Diagnosis', value: patient.primaryDiagnosis || '—' },
              { label: 'Duration', value: patient.diseaseDuration || '—' },
              { label: 'Age', value: patient.currentAge ? `${patient.currentAge} yrs` : '—' },
              { label: 'Age at Dx', value: patient.ageAtDiagnosis ? `${patient.ageAtDiagnosis} yrs` : '—' },
              { label: 'Smoking', value: patient.smokingStatus || '—' },
              { label: 'Submitted', value: createdDate },
            ].map((s, i) => (
              <div className="pr-stat-chip" key={i}>
                <span className="pr-stat-chip-label">{s.label}</span>
                <span className="pr-stat-chip-value">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="pr-body">

          {/* LEFT COLUMN */}
          <div>

            {/* 1. Patient Characteristics */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>👤</div>
                <span className="pr-card-title">Patient Characteristics</span>
                <span className="pr-card-number">01</span>
              </div>
              <div className="pr-field-grid">
                {[
                  { label: 'Full Name', value: patient.name },
                  { label: 'Medical Record No.', value: patient.mrn },
                  { label: 'Contact Phone', value: patient.contactPhone },
                  { label: 'Place of Living', value: patient.placeOfLiving },
                  { label: 'Referred By', value: patient.referredBy },
                  { label: 'Date of Birth', value: patient.dateOfBirth },
                  { label: 'Occupation', value: patient.occupation },
                  { label: 'Preferred Language', value: patient.preferredLanguage },
                ].map((f, i) => (
                  <div className="pr-field" key={i}>
                    <div className="pr-field-label">{f.label}</div>
                    <div className={`pr-field-value${!f.value ? ' empty' : ''}`}>{f.value || 'Not provided'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Disease Characteristics */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>🧬</div>
                <span className="pr-card-title">Disease Characteristics</span>
                <span className="pr-card-number">02</span>
              </div>
              <div className="pr-field-grid">
                <div className="pr-field">
                  <div className="pr-field-label">Primary Diagnosis</div>
                  <div className="pr-field-value" style={{ color: '#c084fc', fontWeight: 500 }}>{patient.primaryDiagnosis || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Disease Duration</div>
                  <div className="pr-field-value">{patient.diseaseDuration || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Montreal Classification</div>
                  <div className="pr-field-value">{patient.montrealClass || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Previous Surgeries</div>
                  <div className="pr-field-value">
                    {parseSurgeries.length > 0
                      ? <div className="pr-tag-list">{parseSurgeries.map((s: string, i: number) => <span key={i} className="pr-tag">{s}</span>)}</div>
                      : <span className="empty">None</span>}
                  </div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Comorbidities</div>
                  <div className="pr-field-value">
                    {parseComorbidities.length > 0
                      ? <div className="pr-tag-list">{parseComorbidities.map((s: string, i: number) => <span key={i} className="pr-tag" style={{ background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>{s}</span>)}</div>
                      : <span className="empty">None</span>}
                  </div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Extraintestinal Manifestations</div>
                  <div className="pr-field-value">{patient.extraintestinalManif || '—'}</div>
                </div>
              </div>
            </div>

            {/* 3. Disease Activity */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(234,179,8,0.12)', color: '#eab308' }}>📊</div>
                <span className="pr-card-title">Disease Activity & Symptoms</span>
                <span className="pr-card-number">03</span>
              </div>
              <div className="pr-field-grid">
                <div className="pr-field" style={{ gridColumn: '1/-1' }}>
                  <div className="pr-field-label">Current Disease Activity</div>
                  <div
                    className="pr-status-badge"
                    style={{ background: actBg, border: `1px solid ${actColor}30`, color: actColor, marginTop: 4, fontSize: 13 }}
                  >
                    <span className="pr-status-dot" style={{ background: actColor }} />
                    {patient.currentDiseaseActivity || '—'}
                  </div>
                </div>
                {[
                  { label: 'Stool Frequency', value: patient.stoolFrequency },
                  { label: 'Blood in Stool', value: patient.bloodInStool },
                  { label: 'Abdominal Pain', value: patient.abdominalPain },
                  { label: 'Impact on QoL', value: patient.impactOnQoL },
                  { label: 'Weight Loss', value: patient.weightLoss },
                  { label: 'Steroid Use', value: patient.steroidUse },
                ].map((f, i) => (
                  <div className="pr-field" key={i}>
                    <div className="pr-field-label">{f.label}</div>
                    <div className={`pr-field-value${!f.value ? ' empty' : ''}`}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Labs & Investigations */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6' }}>🔬</div>
                <span className="pr-card-title">Laboratory & Investigations</span>
                <span className="pr-card-number">04</span>
              </div>
              <div className="pr-field-grid">
                {[
                  { label: 'Date of Most Recent Labs', value: patient.dateMostRecentLabs },
                  { label: 'Date of Most Recent Colonoscopy', value: patient.dateMostRecentColono },
                  { label: 'Recent Lab Values', value: patient.recentLabValues },
                  { label: 'Colonoscopy Findings', value: patient.colonoscopyFindings },
                  { label: 'Recent Imaging', value: patient.recentImaging },
                  { label: 'Most Recent DEXA Scan', value: patient.mostRecentDexa },
                ].map((f, i) => (
                  <div className="pr-field" key={i}>
                    <div className="pr-field-label">{f.label}</div>
                    <div className={`pr-field-value${!f.value ? ' empty' : ''}`}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Treatment */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>💊</div>
                <span className="pr-card-title">Treatment History</span>
                <span className="pr-card-number">05</span>
              </div>
              <div className="pr-field-grid">
                <div className="pr-field">
                  <div className="pr-field-label">Current IBD Medications</div>
                  <div className="pr-field-value">{patient.currentIbdMedications || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Failed Treatments</div>
                  <div className="pr-field-value">{patient.failedTreatments || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">TDM Results</div>
                  <div className="pr-field-value">{patient.tdmResults || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Response to Treatment</div>
                  <div className="pr-field-value">
                    {patient.responseToTreatment
                      ? <span className="pr-status-badge" style={{
                        background: patient.responseToTreatment === 'Complete' ? 'rgba(34,197,94,0.1)' : 'rgba(250,204,21,0.1)',
                        border: `1px solid ${patient.responseToTreatment === 'Complete' ? '#22c55e30' : '#facc1530'}`,
                        color: patient.responseToTreatment === 'Complete' ? '#22c55e' : '#facc15',
                        fontSize: 12,
                      }}>{patient.responseToTreatment}</span>
                      : '—'}
                  </div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Current Supplements</div>
                  <div className="pr-field-value">{patient.currentSupplements || '—'}</div>
                </div>
                <div className="pr-field">
                  <div className="pr-field-label">Previous Treatments Tried</div>
                  <div className="pr-field-value">
                    {parsePreviousTreatments.length > 0
                      ? <div className="pr-tag-list">{parsePreviousTreatments.map((s: string, i: number) => <span key={i} className="pr-tag" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>{s}</span>)}</div>
                      : <span style={{ color: '#334155', fontStyle: 'italic' }}>None</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Serology */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(236,72,153,0.12)', color: '#ec4899' }}>🩸</div>
                <span className="pr-card-title">Infection Screening & Serology</span>
                <span className="pr-card-number">06</span>
              </div>
              <div className="pr-serology-grid">
                {[
                  { label: 'TB Screening', value: patient.tbScreening },
                  { label: 'HBsAg', value: patient.hepBSurfaceAg },
                  { label: 'HBsAb', value: patient.hepBSurfaceAb },
                  { label: 'HBcAb', value: patient.hepBCoreAb },
                  { label: 'Anti-HCV', value: patient.antiHcv },
                  { label: 'Anti-HIV', value: patient.antiHiv },
                ].map((s, i) => (
                  <div className="pr-serology-pill" key={i}>
                    <div className="pr-serology-pill-label">{s.label}</div>
                    <div className="pr-serology-pill-value" style={{ color: labStatusColor(s.value) }}>
                      {s.value || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. Vaccination */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>💉</div>
                <span className="pr-card-title">Vaccination History</span>
                <span className="pr-card-number">07</span>
              </div>
              <div className="pr-vaccine-grid">
                {[
                  { name: 'Influenza', value: patient.influenza },
                  { name: 'COVID-19', value: patient.covid19 },
                  { name: 'Pneumococcal', value: patient.pneumococcal },
                  { name: 'Hepatitis B', value: patient.hepatitisB },
                  { name: 'Hepatitis A', value: patient.hepatitisA },
                  { name: 'Hepatitis E', value: patient.hepatitisE },
                  { name: 'Zoster', value: patient.zoster },
                  { name: 'MMR / Varicella', value: patient.mmrVaricella },
                  { name: 'Tetanus (Tdap)', value: patient.tetanusTdap },
                ].map((v, i) => (
                  <div className="pr-vaccine-row" key={i}>
                    <span className="pr-vaccine-name">{v.name}</span>
                    <span className="pr-vaccine-value">{v.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. Other */}
            <div className="pr-card">
              <div className="pr-card-header">
                <div className="pr-card-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>📋</div>
                <span className="pr-card-title">Other Considerations</span>
                <span className="pr-card-number">08</span>
              </div>
              <div className="pr-field-grid">
                {[
                  { label: 'Pregnancy Planning', value: patient.pregnancyPlanning },
                  { label: 'Special Considerations', value: patient.specialConsiderations },
                ].map((f, i) => (
                  <div className="pr-field" key={i}>
                    <div className="pr-field-label">{f.label}</div>
                    <div className={`pr-field-value${!f.value ? ' empty' : ''}`}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="pr-sidebar">

            {/* Activity meter */}
            <div className="pr-sidebar-card">
              <div className="pr-sidebar-card-header">Disease Activity</div>
              <div className="pr-big-indicator">
                <div className="pr-big-indicator-value" style={{ color: actColor }}>
                  {patient.currentDiseaseActivity || '—'}
                </div>
                <div className="pr-big-indicator-label">{patient.primaryDiagnosis}</div>
                <div className="pr-big-indicator-sub">Montreal: {patient.montrealClass || '—'}</div>
              </div>
            </div>

            {/* Quick demographics */}
            <div className="pr-sidebar-card">
              <div className="pr-sidebar-card-header">Demographics</div>
              <div className="pr-sidebar-rows">
                {[
                  { label: 'Age', value: patient.currentAge ? `${patient.currentAge} years` : '—' },
                  { label: 'Age at Dx', value: patient.ageAtDiagnosis ? `${patient.ageAtDiagnosis} years` : '—' },
                  { label: 'Sex', value: patient.sex },
                  { label: 'Smoking', value: patient.smokingStatus },
                  { label: 'Location', value: patient.placeOfLiving },
                  { label: 'Language', value: patient.preferredLanguage },
                  { label: 'Occupation', value: patient.occupation },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="pr-sidebar-row">
                      <span className="pr-sidebar-row-label">{r.label}</span>
                      <span className="pr-sidebar-row-value">{r.value || '—'}</span>
                    </div>
                    {i < 6 && <div className="pr-divider" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Key clinical */}
            <div className="pr-sidebar-card">
              <div className="pr-sidebar-card-header">Clinical Snapshot</div>
              <div className="pr-sidebar-rows">
                {[
                  { label: 'Stool / day', value: patient.stoolFrequency },
                  { label: 'Abdominal Pain', value: patient.abdominalPain },
                  { label: 'Blood in Stool', value: patient.bloodInStool },
                  { label: 'QoL Impact', value: patient.impactOnQoL },
                  { label: 'Weight Loss', value: patient.weightLoss },
                  { label: 'Steroid Use', value: patient.steroidUse },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="pr-sidebar-row">
                      <span className="pr-sidebar-row-label">{r.label}</span>
                      <span className="pr-sidebar-row-value">{r.value || '—'}</span>
                    </div>
                    {i < 5 && <div className="pr-divider" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Infection summary */}
            <div className="pr-sidebar-card">
              <div className="pr-sidebar-card-header">Serology Summary</div>
              <div style={{ padding: '4px 0 8px' }}>
                {[
                  { label: 'TB', value: patient.tbScreening },
                  { label: 'HBsAg', value: patient.hepBSurfaceAg },
                  { label: 'Anti-HCV', value: patient.antiHcv },
                  { label: 'Anti-HIV', value: patient.antiHiv },
                ].map((r, i) => (
                  <div key={i} className="pr-infection-row">
                    <span className="pr-infection-label">{r.label}</span>
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: labStatusColor(r.value),
                    }}>{r.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Record meta */}
            <div className="pr-sidebar-card">
              <div className="pr-sidebar-card-header">Record Info</div>
              <div className="pr-sidebar-rows">
                {[
                  { label: 'Patient ID', value: `#${patient.id}` },
                  { label: 'User ID', value: `#${patient.userId}` },
                  { label: 'Submitted', value: createdDate },
                  { label: 'Referred By', value: patient.referredBy },
                  { label: 'Contact', value: patient.contactPhone },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="pr-sidebar-row">
                      <span className="pr-sidebar-row-label">{r.label}</span>
                      <span className="pr-sidebar-row-value" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>{r.value || '—'}</span>
                    </div>
                    {i < 4 && <div className="pr-divider" />}
                  </div>
                ))}
              </div>
              <div className="pr-record-id">REC-{patient.id}-{patient.mrn}</div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}