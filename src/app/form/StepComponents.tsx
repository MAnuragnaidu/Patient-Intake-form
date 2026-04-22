import { FormData } from './formData';

interface StepProps {
  data: FormData;
  updateData: (fields: Partial<FormData>) => void;
}

const radioGroup = (name: keyof FormData, label: string, options: string[], data: FormData, updateData: StepProps['updateData']) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="form-radio-group">
      {options.map((opt) => (
        <label key={opt} className="form-radio-label">
          <input
            type="radio"
            name={name as string}
            value={opt}
            checked={data[name] === opt}
            onChange={(e) => updateData({ [name]: e.target.value })}
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

const textInput = (name: keyof FormData, label: string, type: string = 'text', data: FormData, updateData: StepProps['updateData']) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      type={type}
      className="form-input"
      value={data[name] as string | number}
      onChange={(e) => updateData({ [name]: type === 'number' ? Number(e.target.value) : e.target.value })}
    />
  </div>
);

const textArea = (name: keyof FormData, label: string, data: FormData, updateData: StepProps['updateData']) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <textarea
      className="form-textarea"
      rows={3}
      value={data[name] as string}
      onChange={(e) => updateData({ [name]: e.target.value })}
    />
  </div>
);

const checkboxGroup = (name: keyof FormData, label: string, options: string[], data: FormData, updateData: StepProps['updateData']) => {
  const selected = data[name] as string[];
  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) {
      updateData({ [name]: selected.filter((item) => item !== opt) });
    } else {
      updateData({ [name]: [...selected, opt] });
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="form-checkbox-group">
        {options.map((opt) => (
          <label key={opt} className="form-checkbox-label">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => handleToggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

export function Step1({ data, updateData }: StepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Patient Characteristics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {textInput('name', 'Name', 'text', data, updateData)}
        {textInput('mrn', 'ID / MRN', 'text', data, updateData)}
        {textInput('contactPhone', 'Contact Phone', 'text', data, updateData)}
        {textInput('placeOfLiving', 'Place of Living', 'text', data, updateData)}
        {textInput('referredBy', 'Referred By', 'text', data, updateData)}
        {textInput('dateOfBirth', 'Date of Birth', 'date', data, updateData)}
        {textInput('currentAge', 'Current Age', 'number', data, updateData)}
        {textInput('ageAtDiagnosis', 'Age at Diagnosis', 'number', data, updateData)}
      </div>
      {radioGroup('sex', 'Sex', ['Male', 'Female', 'Other'], data, updateData)}
      {radioGroup('smokingStatus', 'Smoking Status', ['Current', 'Former', 'Never'], data, updateData)}
    </div>
  );
}

export function Step2({ data, updateData }: StepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Disease Characteristics</h2>
      {radioGroup('primaryDiagnosis', 'Primary Diagnosis', ['Ulcerative Colitis', 'Crohns Disease', 'IBD-U'], data, updateData)}
      {radioGroup('diseaseDuration', 'Disease Duration', ['< 1 year', '1-5 years', '5-10 years', '> 10 years'], data, updateData)}
      {textInput('montrealClass', 'Montreal Classification (UC: E1/E2/E3 | CD: L1-4, B1-3)', 'text', data, updateData)}
      {checkboxGroup('previousSurgeries', 'Previous IBD Surgeries', ['None', 'Partial Colectomy', 'Total Colectomy', 'Ileo Caecal resection', 'Perianal surgery', 'Stricturoplasty', 'Ostomy', 'Segmental resection'], data, updateData)}
    </div>
  );
}

export function Step3({ data, updateData }: StepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Disease Activity & Symptoms</h2>
      {radioGroup('currentDiseaseActivity', 'Current Disease Activity Level', ['Remission', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('stoolFrequency', 'Frequency of Stools (per day)', ['1-3', '4-6', '>6'], data, updateData)}
      {radioGroup('bloodInStool', 'Blood in Stool', ['None', 'Trace', 'Obvious'], data, updateData)}
      {radioGroup('abdominalPain', 'Abdominal Pain', ['None', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('impactOnQoL', 'Impact on Quality of Life', ['None', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('weightLoss', 'Weight Loss', ['Yes', 'No'], data, updateData)}
    </div>
  );
}

export function Step4({ data, updateData }: StepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Laboratory & Investigations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {textInput('dateMostRecentLabs', 'Date of Most Recent Labs', 'date', data, updateData)}
        {textInput('dateMostRecentColono', 'Date of Most Recent Colonoscopy', 'date', data, updateData)}
      </div>
      {textArea('recentLabValues', 'Recent Lab Values (Hb, TLC, Platelets, CRP, Albumin)', data, updateData)}
      {textArea('colonoscopyFindings', 'Colonoscopy Findings (Mayo Score)', data, updateData)}
      {textArea('recentImaging', 'Recent Imaging (MRE, CT, MRI)', data, updateData)}
      {textInput('mostRecentDexa', 'Most Recent DEXA Scan', 'text', data, updateData)}
    </div>
  );
}

export function Step5({ data, updateData }: StepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Treatment History</h2>
      {textArea('currentIbdMedications', 'Current IBD Medications with Duration', data, updateData)}
      {textArea('failedTreatments', 'Details of Failed Treatments', data, updateData)}
      {textArea('tdmResults', 'Therapeutic Drug Monitoring Results', data, updateData)}
      {textArea('currentSupplements', 'Current Vitamin D / Calcium Supplementation', data, updateData)}
      {radioGroup('responseToTreatment', 'Response to Current Treatment', ['Good', 'Partial', 'None'], data, updateData)}
      {radioGroup('steroidUse', 'Current or Recent Steroid Use', ['Yes', 'No'], data, updateData)}
      {checkboxGroup('previousTreatmentsTried', 'Previous IBD Treatments Tried', ['Corticosteroids', 'Infliximab', 'Ustekinumab', 'Vedolizumab', 'Adalimumab', 'Tofacitinib', 'Other'], data, updateData)}
    </div>
  );
}

export function Step6({ data, updateData }: StepProps) {
  const statusOptions = ['Negative', 'Positive', 'Not Tested'];
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Infection Screening & Vaccines</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {radioGroup('tbScreening', 'TB Screening Status', statusOptions, data, updateData)}
        {radioGroup('hepBSurfaceAg', 'Hep B Surface Antigen', statusOptions, data, updateData)}
        {radioGroup('hepBSurfaceAb', 'Hep B Surface Antibody', statusOptions, data, updateData)}
        {radioGroup('hepBCoreAb', 'Hep B Core Antibody', statusOptions, data, updateData)}
        {radioGroup('antiHcv', 'Anti HCV', statusOptions, data, updateData)}
        {radioGroup('antiHiv', 'Anti HIV', statusOptions, data, updateData)}
      </div>
      <h3 className="text-lg mt-6 mb-2">Vaccination Dates / Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {textInput('influenza', 'Influenza', 'text', data, updateData)}
        {textInput('covid19', 'COVID-19', 'text', data, updateData)}
        {textInput('pneumococcal', 'Pneumococcal', 'text', data, updateData)}
        {textInput('hepatitisB', 'Hepatitis B', 'text', data, updateData)}
        {textInput('hepatitisA', 'Hepatitis A', 'text', data, updateData)}
        {textInput('hepatitisE', 'Hepatitis E', 'text', data, updateData)}
        {textInput('zoster', 'Zoster', 'text', data, updateData)}
        {textInput('mmrVaricella', 'MMR / Varicella', 'text', data, updateData)}
        {textInput('tetanusTdap', 'Tetanus / Tdap', 'text', data, updateData)}
      </div>
    </div>
  );
}

export function Step7({ data, updateData }: StepProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl mb-4">Comorbidities & Final Details</h2>
      {checkboxGroup('comorbidities', 'Comorbidities', ['None', 'Type 2 Diabetes', 'Hypertension', 'Heart disease', 'CKD', 'Liver disease', 'Osteoporosis', 'Depression/Anxiety'], data, updateData)}
      {radioGroup('extraintestinalManif', 'Extraintestinal Manifestations', ['None', 'Joints', 'Skin', 'Eyes', 'Other'], data, updateData)}
      {radioGroup('pregnancyPlanning', 'Pregnancy / Family Planning Status', ['Not applicable', 'Planning', 'Currently pregnant', 'Post-partum'], data, updateData)}
      {radioGroup('preferredLanguage', "Patient's Preferred Language for Care Plan", ['English', 'Spanish', 'French', 'Other'], data, updateData)}
      {textInput('occupation', 'Occupation', 'text', data, updateData)}
      {textArea('specialConsiderations', 'Special Considerations (Travel, Dietary, etc.)', data, updateData)}
    </div>
  );
}
