/**
 * REPORT SAATHI (LabSense Engine) — Centralized Medical Store & Reactive State
 * 
 * Features from LabSense PRD, Architecture & Delivery Plan:
 * - 5 Synthetic Reports (Sarah Jenkins: Critical PLT; Alex Morgan: hs-CRP/Lipid; 
 *   Priya Sharma: Anaemia; Ramesh Patel: Diabetes; David Ross: Remission)
 * - Deterministic Rule Engine for critical flags and status calculation (ADR-03)
 * - In-range parameter count (14 of 18) instead of misleading health score (ADR-07)
 * - Human review / value correction store (FR-108)
 * - Doctor Directory & multi-step booking store (FR-114, FR-115)
 * - Telehealth consultation context & SOAP notes (FR-117, FR-118)
 * - Verifiable digital prescription with QR tokens (FR-118, FR-119)
 * - Audit log tracking (FR-123)
 * - Cross-page synchronization via localStorage
 */

export const SYNTHETIC_REPORTS = {
  'sarah': {
    id: 'rep-sarah-994',
    patientName: 'Sarah Jenkins',
    patientAge: '34F',
    mrn: '#994-0182',
    collectionDate: '18 Oct 2026',
    labName: 'Quest Diagnostics / Labcorp Reference',
    category: 'Critical Hematology / Thrombocytopenia',
    status: 'CRITICAL',
    hasCritical: true,
    criticalParam: 'Platelets (Thrombocytes)',
    criticalValue: '48 ×10³/µL',
    criticalRef: '150 – 450 ×10³/µL',
    criticalMsg: 'Platelet count is critically low (48 ×10³/µL). High risk of spontaneous microvascular bleeding. Immediate physician consultation required. In India, call 112 or visit nearest emergency facility.',
    totalParameters: 18,
    inRangeCount: 13,
    flaggedCount: 5,
    summary: 'Automated extraction completed from peripheral smear and automated CBC diff. Severe isolated thrombocytopenia detected (48 ×10³/µL) with elevated MPV (11.8 fL). Hemoglobin and leukocyte counts remain intact. Early microcytic indices (MCV 72 fL). Recommend urgent citrate tube verification to rule out EDTA pseudothrombocytopenia.',
    questionsForDoctor: [
      'Could my low platelet count (48k) be caused by an immune response (ITP) or medication interaction?',
      'Should we immediately re-test with a sodium citrate tube to exclude EDTA platelet clumping?',
      'Are systemic corticosteroids (e.g. Dexamethasone pulse) or IVIg recommended right now?',
      'What activity restrictions or bleeding precautions should I follow immediately?'
    ],
    parameters: [
      { id: 'plt', name: 'Platelets (Thrombocyte Count)', value: 48, unit: '×10³/µL', refLow: 150, refHigh: 450, status: 'critical', category: 'blood', meaning: 'Cell fragments essential for normal blood clotting and vessel repair.', reason: 'Immune destruction (ITP), viral marrow suppression, or EDTA artifact.', prompt: 'What causes platelets to suddenly drop to 48k?' },
      { id: 'hb', name: 'Hemoglobin (Hb)', value: 12.1, unit: 'g/dL', refLow: 12.0, refHigh: 16.0, status: 'optimal', category: 'blood', meaning: 'Oxygen-carrying protein in red blood cells.', reason: 'Baseline normal.', prompt: 'Is my hemoglobin stable despite low platelets?' },
      { id: 'mcv', name: 'Mean Corpuscular Volume (MCV)', value: 72.0, unit: 'fL', refLow: 80.0, refHigh: 100.0, status: 'warning', category: 'blood', meaning: 'Average size of red blood cells.', reason: 'Iron deficiency or microcytic trait.', prompt: 'What does low MCV (72 fL) mean?' },
      { id: 'mpv', name: 'Mean Platelet Volume (MPV)', value: 11.8, unit: 'fL', refLow: 7.5, refHigh: 10.5, status: 'warning', category: 'blood', meaning: 'Average size of platelets in circulation; indicates marrow production rate.', reason: 'Compensatory bone marrow megakaryocytic response.', prompt: 'Why is my MPV high when platelets are low?' },
      { id: 'wbc', name: 'White Blood Cell Count (WBC)', value: 6.8, unit: '×10³/µL', refLow: 4.0, refHigh: 11.0, status: 'optimal', category: 'blood', meaning: 'Immune cells defending against infection.', reason: 'Baseline normal.', prompt: 'Is my immune cell count healthy?' },
      { id: 'ferritin', name: 'Serum Ferritin', value: 18.0, unit: 'ng/mL', refLow: 15.0, refHigh: 150.0, status: 'warning', category: 'blood', meaning: 'Primary iron storage protein in tissues.', reason: 'Low iron reserves developing alongside microcytosis.', prompt: 'Should I take iron supplements for low ferritin?' },
      { id: 'crp', name: 'hs-CRP (High Sensitivity)', value: 1.2, unit: 'mg/L', refLow: 0.0, refHigh: 1.0, status: 'warning', category: 'lipid', meaning: 'Systemic vascular inflammation marker.', reason: 'Mild low-grade inflammatory stress.', prompt: 'Is hs-CRP 1.2 related to platelet drop?' },
      { id: 'chol_ratio', name: 'Total Cholesterol / HDL Ratio', value: 3.4, unit: 'Ratio', refLow: 0.0, refHigh: 3.5, status: 'optimal', category: 'lipid', meaning: 'Balance between total and protective high-density cholesterol.', reason: 'Optimal atherogenic profile.', prompt: 'Is my lipid ratio favorable?' },
      { id: 'glucose', name: 'Fasting Plasma Glucose', value: 88, unit: 'mg/dL', refLow: 70, refHigh: 99, status: 'optimal', category: 'diabetes', meaning: 'Blood sugar level after overnight fast.', reason: 'Normal glucose metabolism.', prompt: 'Is my blood sugar normal?' },
      { id: 'creatinine', name: 'Serum Creatinine', value: 0.82, unit: 'mg/dL', refLow: 0.6, refHigh: 1.2, status: 'optimal', category: 'renal', meaning: 'Waste product filtered by kidney glomeruli.', reason: 'Normal renal filtration.', prompt: 'Are my kidneys functioning normally?' },
      { id: 'egfr', name: 'eGFR (Filtration Rate)', value: 110, unit: 'mL/min', refLow: 90, refHigh: 140, status: 'optimal', category: 'renal', meaning: 'Calculated efficiency of kidney blood filtration.', reason: 'Excellent baseline kidney clearance.', prompt: 'What does eGFR 110 indicate?' },
      { id: 'alt', name: 'ALT (Alanine Aminotransferase)', value: 24, unit: 'U/L', refLow: 7, refHigh: 45, status: 'optimal', category: 'hepatic', meaning: 'Liver enzyme indicating hepatic cellular integrity.', reason: 'Normal liver function.', prompt: 'Is my liver healthy?' },
      { id: 'tsh', name: 'TSH (Thyroid Stimulating Hormone)', value: 2.1, unit: 'µIU/mL', refLow: 0.4, refHigh: 4.2, status: 'optimal', category: 'thyroid', meaning: 'Pituitary signal regulating thyroid hormone output.', reason: 'Euthyroid normal axis.', prompt: 'Is my thyroid functioning properly?' },
      { id: 'vitd', name: 'Vitamin D-25 Hydroxy', value: 36.0, unit: 'ng/mL', refLow: 30.0, refHigh: 100.0, status: 'optimal', category: 'blood', meaning: 'Essential pro-hormone for calcium absorption and immunity.', reason: 'Adequate vitamin D stores.', prompt: 'Do I need extra vitamin D?' }
    ],
    ocrImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpPoCmQ_no7-jrwbTWe8ZBPeO7xnvZJSURRExz5Q1_pqYMgFrtwLBp0zF0ncR9Niq80d6B1fHnCQPsy35KMHIXN6s9l-JXbZDgswPyJBGySuaNA_DRcSOnIl4-yWxGeX7o1ieIaP3THXn1Ud6Y1UV4MBXuCaSjzBBN0BLTyGXbnS_rGleqgAmWMjST6I8xVLX8m9glY3rUUYq83SYbOqFJUEBVH8bCoPS607dpZER25l2nLEBpT5m2'
  },
  'alex': {
    id: 'rep-alex-904',
    patientName: 'Alex Morgan',
    patientAge: '42M',
    mrn: '#HEMA-9042-DX',
    collectionDate: '15 Oct 2026',
    labName: 'Apollo Clinical Diagnostic Labs',
    category: 'Cardiovascular & Metabolic Risk',
    status: 'ATTENTION_ADVISED',
    hasCritical: false,
    criticalParam: null,
    criticalValue: null,
    totalParameters: 18,
    inRangeCount: 14,
    flaggedCount: 4,
    summary: 'Analyzed multi-panel diagnostic profile. Cardiovascular inflammatory marker hs-CRP is elevated at 3.8 mg/L alongside an atherogenic Total Chol/HDL ratio of 5.4. Fasting glucose is borderline (96 mg/dL) with insufficient Vitamin D (28.0 ng/mL). Complete blood counts and kidney filtration rate (eGFR 106) remain fully optimal.',
    questionsForDoctor: [
      'What could be driving my elevated hs-CRP (3.8 mg/L), and does it indicate vascular inflammation?',
      'With a Chol/HDL ratio of 5.4, should we consider an advanced ApoB particle test or a CAC coronary scan?',
      'My Vitamin D is at 28.0 ng/mL — what daily supplement dose (e.g. 2,000 IU vs 5,000 IU) is best?',
      'Given my fasting glucose is 96 mg/dL, should we monitor HbA1c to prevent pre-diabetic progression?'
    ],
    parameters: [
      { id: 'hscrp', name: 'High-Sensitivity C-Reactive Protein (hs-CRP)', value: 3.8, unit: 'mg/L', refLow: 0.0, refHigh: 1.0, status: 'critical', category: 'lipid', meaning: 'Marker of arterial endothelial and vascular inflammation.', reason: 'Atherogenic stress, lifestyle strain, or subclinical inflammation.', prompt: 'Why is hs-CRP 3.8 concerning for heart health?' },
      { id: 'chol_ratio', name: 'Total Cholesterol / HDL Ratio', value: 5.4, unit: 'Ratio', refLow: 0.0, refHigh: 3.5, status: 'critical', category: 'lipid', meaning: 'Atherogenic particle balance in circulating lipids.', reason: 'High non-HDL lipid fraction with lower protective HDL.', prompt: 'What dietary changes can improve my Chol/HDL ratio?' },
      { id: 'vitd', name: 'Vitamin D-25 Hydroxy', value: 28.0, unit: 'ng/mL', refLow: 30.0, refHigh: 100.0, status: 'warning', category: 'blood', meaning: 'Fat-soluble vitamin vital for immune function and bone density.', reason: 'Insufficient sunlight exposure and dietary intake.', prompt: 'How quickly can I correct Vitamin D at 28 ng/mL?' },
      { id: 'fpg', name: 'Fasting Plasma Glucose', value: 96, unit: 'mg/dL', refLow: 70, refHigh: 99, status: 'warning', category: 'diabetes', meaning: 'Morning basal blood sugar level.', reason: 'Upper-normal baseline approaching pre-diabetic threshold.', prompt: 'Does fasting glucose 96 require medication?' },
      { id: 'hb', name: 'Hemoglobin (Hb)', value: 14.2, unit: 'g/dL', refLow: 13.5, refHigh: 17.5, status: 'optimal', category: 'blood', meaning: 'Oxygen delivery capacity of circulating red blood cells.', reason: 'Robust normal erythropoiesis.', prompt: 'Is my hemoglobin optimal?' },
      { id: 'wbc', name: 'White Blood Cell Count (WBC)', value: 7.1, unit: '×10³/µL', refLow: 4.0, refHigh: 11.0, status: 'optimal', category: 'blood', meaning: 'Total circulating leukocyte defense count.', reason: 'Normal immune baseline.', prompt: 'Are my white blood cells normal?' },
      { id: 'plt', name: 'Platelets (Thrombocytes)', value: 245, unit: '×10³/µL', refLow: 150, refHigh: 450, status: 'optimal', category: 'blood', meaning: 'Coagulation cell fragments.', reason: 'Healthy clotting baseline.', prompt: 'Are platelets normal?' },
      { id: 'egfr', name: 'eGFR (Renal Filtration)', value: 106, unit: 'mL/min', refLow: 90, refHigh: 140, status: 'optimal', category: 'renal', meaning: 'Glomerular blood filtration rate.', reason: 'Optimal Stage 1 renal function.', prompt: 'Is kidney function normal?' },
      { id: 'alt', name: 'ALT (Liver Enzyme)', value: 22, unit: 'U/L', refLow: 7, refHigh: 45, status: 'optimal', category: 'hepatic', meaning: 'Specific intracellular liver transaminase.', reason: 'Healthy hepatocytes without fatty infiltration.', prompt: 'Is liver function normal?' },
      { id: 'tsh', name: 'TSH (Thyroid Stimulating)', value: 1.85, unit: 'µIU/mL', refLow: 0.4, refHigh: 4.2, status: 'optimal', category: 'thyroid', meaning: 'Thyroid metabolic regulating hormone.', reason: 'Normal metabolic axis.', prompt: 'Is thyroid activity balanced?' }
    ]
  },
  'priya': {
    id: 'rep-priya-821',
    patientName: 'Priya Sharma',
    patientAge: '28F',
    mrn: '#920-3341',
    collectionDate: '12 Oct 2026',
    labName: 'Thyrocare Technologies',
    category: 'Microcytic Hypochromic Anaemia',
    status: 'ATTENTION_ADVISED',
    hasCritical: false,
    totalParameters: 18,
    inRangeCount: 13,
    flaggedCount: 5,
    summary: 'Clear microcytic hypochromic pattern identified. Hemoglobin is reduced at 9.8 g/dL with depleted Serum Ferritin (11.0 ng/mL) and low MCV (71 fL). RDW-CV is elevated at 17.4%, strongly confirming iron-deficiency erythropoiesis rather than thalassemia trait. Renal and liver profiles are completely normal.',
    questionsForDoctor: [
      'Is oral elemental iron (e.g. Ferrous Bisglycinate with Vitamin C) sufficient, or is IV iron faster for Hb 9.8?',
      'Could menstrual losses or dietary absorption be the primary factor in my low ferritin (11 ng/mL)?',
      'When should we repeat the CBC to confirm reticulocyte response and hemoglobin recovery?',
      'Are there specific foods I should avoid pairing with iron supplements (e.g. coffee, calcium)?'
    ],
    parameters: [
      { id: 'hb', name: 'Hemoglobin (Hb)', value: 9.8, unit: 'g/dL', refLow: 12.0, refHigh: 16.0, status: 'critical', category: 'blood', meaning: 'Oxygen-carrying pigment in erythrocytes.', reason: 'Iron-deficiency anemia.', prompt: 'How serious is hemoglobin 9.8?' },
      { id: 'ferritin', name: 'Serum Ferritin', value: 11.0, unit: 'ng/mL', refLow: 15.0, refHigh: 150.0, status: 'critical', category: 'blood', meaning: 'Total bodily iron reserve indicator.', reason: 'Severely depleted iron stores.', prompt: 'Why is ferritin 11 causing fatigue?' },
      { id: 'mcv', name: 'MCV (Red Cell Size)', value: 71.0, unit: 'fL', refLow: 80.0, refHigh: 100.0, status: 'warning', category: 'blood', meaning: 'Mean volume of red blood cells.', reason: 'Microcytosis due to impaired heme synthesis.', prompt: 'What causes small red blood cells?' },
      { id: 'rdw', name: 'RDW-CV (Red Cell Distribution)', value: 17.4, unit: '%', refLow: 11.5, refHigh: 14.5, status: 'warning', category: 'blood', meaning: 'Variation in red blood cell sizes (anisocytosis).', reason: 'Active mixture of small new cells and older cells in iron deficiency.', prompt: 'What does high RDW mean in anemia?' },
      { id: 'plt', name: 'Platelets (Thrombocytes)', value: 385, unit: '×10³/µL', refLow: 150, refHigh: 450, status: 'optimal', category: 'blood', meaning: 'Clotting cell fragments.', reason: 'Reactive thrombocytosis mild, within normal upper limits.', prompt: 'Are platelets affected by low iron?' },
      { id: 'wbc', name: 'White Blood Cell Count', value: 5.9, unit: '×10³/µL', refLow: 4.0, refHigh: 11.0, status: 'optimal', category: 'blood', meaning: 'Infection-fighting cells.', reason: 'Normal immune count.', prompt: 'Is WBC normal?' }
    ]
  },
  'ramesh': {
    id: 'rep-ramesh-741',
    patientName: 'Ramesh Patel',
    patientAge: '52M',
    mrn: '#551-7892',
    collectionDate: '10 Oct 2026',
    labName: 'Redcliffe Diagnostic Labs',
    category: 'Type 2 Diabetes & Glycemic Creep',
    status: 'ATTENTION_ADVISED',
    hasCritical: false,
    totalParameters: 18,
    inRangeCount: 12,
    flaggedCount: 6,
    summary: 'Metabolic decompensation pattern noted. Fasting blood sugar is 156 mg/dL with HbA1c at 7.4%, diagnostic of suboptimal glycemic control. Triglycerides are elevated at 220 mg/dL with mildly increased liver enzyme ALT (48 U/L), suggestive of early metabolic-associated steatotic liver changes.',
    questionsForDoctor: [
      'With an HbA1c of 7.4%, should my current metformin dosage be adjusted or combined with an SGLT2 inhibitor?',
      'Do my elevated triglycerides (220 mg/dL) and ALT (48 U/L) indicate fatty liver involvement?',
      'How frequently should I monitor post-prandial blood sugar spikes at home?',
      'Should we screen for early diabetic kidney changes using an annual urine microalbumin/creatinine ratio?'
    ],
    parameters: [
      { id: 'fpg', name: 'Fasting Blood Sugar', value: 156, unit: 'mg/dL', refLow: 70, refHigh: 99, status: 'critical', category: 'diabetes', meaning: 'Basal glycemic level after 10 hours fast.', reason: 'Insulin resistance and hepatic glucose output.', prompt: 'How can I lower fasting blood sugar from 156?' },
      { id: 'hba1c', name: 'Glycated Hemoglobin (HbA1c)', value: 7.4, unit: '%', refLow: 4.0, refHigh: 5.6, status: 'critical', category: 'diabetes', meaning: '3-month average circulating blood glucose level.', reason: 'Chronic glycemic elevation.', prompt: 'What target HbA1c should I aim for?' },
      { id: 'trig', name: 'Serum Triglycerides', value: 220, unit: 'mg/dL', refLow: 0, refHigh: 150, status: 'warning', category: 'lipid', meaning: 'Circulating storage fats in plasma.', reason: 'Carbohydrate-induced hypertriglyceridemia.', prompt: 'How do triglycerides link with diabetes?' },
      { id: 'alt', name: 'ALT (Liver Transaminase)', value: 48, unit: 'U/L', refLow: 7, refHigh: 45, status: 'warning', category: 'hepatic', meaning: 'Liver intracellular enzyme.', reason: 'Early steatotic hepatic strain.', prompt: 'Is ALT 48 linked to fatty liver?' },
      { id: 'creatinine', name: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', refLow: 0.7, refHigh: 1.3, status: 'optimal', category: 'renal', meaning: 'Waste product filtered by kidneys.', reason: 'Kidney clearance preserved.', prompt: 'Are kidneys handling diabetes well?' }
    ]
  },
  'david': {
    id: 'rep-david-449',
    patientName: 'David Ross',
    patientAge: '58M',
    mrn: '#710-4491',
    collectionDate: '08 Oct 2026',
    labName: 'Stanford Comprehensive Cancer Center',
    category: 'Post-Chemo Remission Surveillance',
    status: 'OPTIMAL_REMISSION',
    hasCritical: false,
    totalParameters: 18,
    inRangeCount: 18,
    flaggedCount: 0,
    summary: 'Annual post-chemotherapy hematologic surveillance panel. All 18 cellular, renal, hepatic, and metabolic markers are within strictly defined reference intervals. Absolute Neutrophil Count (ANC 3.4), Hemoglobin (14.8 g/dL), and Platelets (210 ×10³/µL) demonstrate full long-term marrow recovery. Sustained clinical remission.',
    questionsForDoctor: [
      'Given that all 18 markers are in optimal range, can we continue with standard annual surveillance intervals?',
      'Are there any secondary cardiovascular or bone density markers we should monitor post-chemotherapy?',
      'Do my robust white cell and neutrophil counts confirm my immune system has fully recovered?'
    ],
    parameters: [
      { id: 'wbc', name: 'White Blood Cell Count', value: 6.2, unit: '×10³/µL', refLow: 4.0, refHigh: 11.0, status: 'optimal', category: 'blood', meaning: 'Total immune defense cell count.', reason: 'Full bone marrow recovery.', prompt: 'Is my immune system fully recovered?' },
      { id: 'hb', name: 'Hemoglobin (Hb)', value: 14.8, unit: 'g/dL', refLow: 13.5, refHigh: 17.5, status: 'optimal', category: 'blood', meaning: 'Oxygen-carrying red blood cell protein.', reason: 'Optimal erythropoiesis.', prompt: 'Is my hemoglobin normal?' },
      { id: 'plt', name: 'Platelets (Thrombocytes)', value: 210, unit: '×10³/µL', refLow: 150, refHigh: 450, status: 'optimal', category: 'blood', meaning: 'Coagulation cell fragments.', reason: 'Normal megakaryocytic marrow production.', prompt: 'Are platelets healthy?' },
      { id: 'anc', name: 'Absolute Neutrophil Count (ANC)', value: 3.4, unit: '×10³/µL', refLow: 1.5, refHigh: 8.0, status: 'optimal', category: 'blood', meaning: 'Primary bacterial defense white cells.', reason: 'Zero neutropenia; normal host defenses.', prompt: 'What does normal ANC mean post-chemo?' }
    ]
  }
};

export const DOCTORS_DIRECTORY = [
  {
    id: 'dr-anita-sharma',
    name: 'Dr. Anita Sharma, MD',
    specialty: 'Hematology & Molecular Genetics',
    councilNo: 'NMC Reg #48192-A • ASH Fellow \'24',
    experience: '14 years experience',
    institution: 'Stanford Clinical Genomics Collaborative',
    rating: 4.98,
    reviewsCount: 312,
    fee: '$39',
    languages: ['English', 'Hindi', 'Punjabi'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCtMAohwqr1tjjDQyxb7fZNDNB6faXkIOJd0vr4JXAjG4TD7IgrOLiZFnK0OcAk5v13E93lfuALxVanAXcfrkQbTFSKg6RYMIC-DOq6WxfaJS_arOe8jbBPt9md3IaVqNUUdhK4pIxSxCL5ixvNO8MwUPr_HJg3qjCMdC47QsjTKPovVxCPTd4j9dW2FcFmzWUukaDQFP9yyjQAeDlOwT8cP1GEyv0oBG2OapBhqM-1aezLY3Yb2r8',
    availableSlots: ['Today, 3:30 PM EDT', 'Today, 5:15 PM EDT', 'Tomorrow, 10:00 AM EDT'],
    bio: 'Specializing in complex blood dyscrasias, thrombotic microangiopathies, ITP, and unexplained biomarker drift. Dual-certified in clinical pathology and molecular diagnostics.'
  },
  {
    id: 'dr-rajesh-verma',
    name: 'Dr. Rajesh Verma, MD, DM',
    specialty: 'Endocrinology & Diabetology',
    councilNo: 'NMC Reg #62910-B • AIIMS New Delhi',
    experience: '18 years experience',
    institution: 'AIIMS & Medanta Institute',
    rating: 4.95,
    reviewsCount: 428,
    fee: '$35',
    languages: ['English', 'Hindi'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
    availableSlots: ['Today, 4:00 PM EDT', 'Tomorrow, 11:30 AM EDT', 'Tomorrow, 2:00 PM EDT'],
    bio: 'Expertise in early insulin resistance reversal, cardiometabolic risk stratification, thyroid disorders, and lipid subfractionation.'
  },
  {
    id: 'dr-meera-nair',
    name: 'Dr. Meera Nair, MBBS, MD',
    specialty: 'General Medicine & Preventative Health',
    councilNo: 'NMC Reg #77301-C • CMC Vellore',
    experience: '11 years experience',
    institution: 'Apollo TeleHealth Specialists',
    rating: 4.92,
    reviewsCount: 265,
    fee: '$29',
    languages: ['English', 'Malayalam', 'Tamil'],
    avatar: 'https://images.unsplash.com/photo-1594824813589-a9a7a9cb5799?auto=format&fit=crop&w=256&q=80',
    availableSlots: ['Today, 6:00 PM EDT', 'Tomorrow, 9:00 AM EDT'],
    bio: 'Comprehensive primary care, routine annual health audit evaluations, micronutrient deficiency correction, and patient education.'
  }
];

export const DEFAULT_PATIENT_PROFILES = {
  'alex': {
    id: 'pat-alex-904',
    name: 'Alex Morgan',
    dob: '1984-06-14',
    age: '42',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    email: 'alex.morgan@health.in',
    address: 'Flat 402, Green Glen Layout, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    emergencyContactName: 'Rachel Morgan',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 98765 43211',
    abhaId: '91-8842-1092-4410',
    insuranceProvider: 'Star Health Premier Gold',
    insurancePolicyNo: 'POL-SH-99210-DX',
    primaryPhysician: 'Dr. Anita Sharma, MD',
    medicalConditions: [
      'Cardiovascular Risk (Elevated hs-CRP)',
      'Dyslipidemia / Elevated Chol:HDL Ratio',
      'Borderline Fasting Glycemia',
      'Vitamin D Insufficiency'
    ],
    surgeries: [
      { name: 'Arthroscopic Right Knee Meniscectomy', year: '2019', hospital: 'Manipal Hospital, Bengaluru', notes: 'Uncomplicated recovery, full mobility restored' }
    ],
    allergies: [
      { allergen: 'Penicillin / Amoxicillin', severity: 'Moderate', reaction: 'Diffuse cutaneous rash, pruritus' },
      { allergen: 'Sulfa Antibiotics', severity: 'Mild', reaction: 'Localized urticaria' }
    ],
    familyHistory: [
      'Father: Premature Coronary Artery Disease (CAD at age 52)',
      'Mother: Essential Hypertension and Osteopenia',
      'Paternal Uncle: Type 2 Diabetes'
    ],
    medications: [
      { name: 'Atorvastatin', dosage: '10 mg', frequency: 'Once daily at bedtime', reason: 'Lipid control / hs-CRP risk reduction' },
      { name: 'Aspirin (Cardio)', dosage: '81 mg', frequency: 'Once daily morning', reason: 'Cardiovascular prophylaxis' }
    ],
    supplements: [
      { name: 'Vitamin D3 (Cholecalciferol)', dosage: '2,000 IU', frequency: 'Daily with meal' },
      { name: 'Omega-3 Marine Triglycerides', dosage: '1,000 mg', frequency: 'Once daily' }
    ],
    vitals: {
      heightCm: 178,
      weightKg: 77,
      bmi: '24.3',
      bpSystolic: 126,
      bpDiastolic: 82,
      heartRate: 72,
      spo2: 99,
      fastingGlucose: 96
    },
    lifestyle: {
      smoking: 'Non-smoker (Never)',
      alcohol: 'Occasional social (1-2 units/week)',
      exercise: 'Moderate 3-4 sessions/week (Cardio + weights)',
      diet: 'Balanced Mediterranean / low refined carbs',
      sleepHours: '7.5 hours/night'
    },
    notes: 'Patient motivated to reverse atherogenic drift before progression. Fasting labs completed with Quest / Apollo diagnostics.'
  },
  'sarah': {
    id: 'pat-sarah-994',
    name: 'Sarah Jenkins',
    dob: '1992-03-22',
    age: '34',
    gender: 'Female',
    bloodGroup: 'A-',
    phone: '+91 97112 34567',
    email: 'sarah.jenkins@medmail.com',
    address: 'B-12, Defence Colony',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110024',
    emergencyContactName: 'Mark Jenkins',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 97112 34568',
    abhaId: '91-4491-0182-9940',
    insuranceProvider: 'HDFC ERGO Optima Secure',
    insurancePolicyNo: 'POL-HE-44912-CR',
    primaryPhysician: 'Dr. Anita Sharma, MD',
    medicalConditions: [
      'Severe Isolated Thrombocytopenia (PLT 48k)',
      'Suspected Immune Thrombocytopenic Purpura (ITP)',
      'Microcytic RBC Indices (MCV 72 fL)',
      'Early Depleted Iron Stores'
    ],
    surgeries: [
      { name: 'Diagnostic Endoscopy', year: '2022', hospital: 'Max Super Speciality, Saket', notes: 'Normal gastric mucosa; ruled out occult GI bleeding' }
    ],
    allergies: [
      { allergen: 'NSAIDs (Ibuprofen / Naproxen)', severity: 'Severe', reaction: 'Acute gastric irritation & exacerbates bleeding' },
      { allergen: 'Latex', severity: 'Moderate', reaction: 'Contact dermatitis' }
    ],
    familyHistory: [
      'Maternal Aunt: Hashimoto Thyroiditis',
      'Mother: Iron Deficiency Anemia'
    ],
    medications: [
      { name: 'Dexamethasone', dosage: '4 mg', frequency: 'Short course under hematology protocol', reason: 'ITP platelet rescue' },
      { name: 'Ferrous Ascorbate', dosage: '100 mg', frequency: 'Once daily with citrus juice', reason: 'Microcytic iron repletion' }
    ],
    supplements: [
      { name: 'Folic Acid', dosage: '5 mg', frequency: 'Daily' }
    ],
    vitals: {
      heightCm: 165,
      weightKg: 58,
      bmi: '21.3',
      bpSystolic: 118,
      bpDiastolic: 76,
      heartRate: 78,
      spo2: 99,
      fastingGlucose: 88
    },
    lifestyle: {
      smoking: 'Non-smoker',
      alcohol: 'None',
      exercise: 'Light walking (Contact sports strictly restricted due to low platelets)',
      diet: 'High leafy greens, iron-rich Mediterranean vegetarian',
      sleepHours: '8 hours/night'
    },
    notes: 'Urgent citrate re-draw tube pending to rule out EDTA agglutination. Active bleeding precautions advised.'
  },
  'priya': {
    id: 'pat-priya-821',
    name: 'Priya Sharma',
    dob: '1998-08-11',
    age: '28',
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98200 98200',
    email: 'priya.sharma@domain.in',
    address: 'Flat 101, Powai Heights',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400076',
    emergencyContactName: 'Sanjay Sharma',
    emergencyContactRelation: 'Brother',
    emergencyContactPhone: '+91 98200 98201',
    abhaId: '91-3341-9201-8210',
    insuranceProvider: 'Care Health Insurance',
    insurancePolicyNo: 'POL-CH-82190-AN',
    primaryPhysician: 'Dr. Meera Nair, MBBS, MD',
    medicalConditions: [
      'Microcytic Hypochromic Anaemia (Hb 9.8 g/dL)',
      'Severe Iron Deficiency (Ferritin 11 ng/mL)',
      'Chronic Daytime Fatigue'
    ],
    surgeries: [],
    allergies: [
      { allergen: 'Sulfa Antibiotics', severity: 'Mild', reaction: 'Mild maculopapular rash' }
    ],
    familyHistory: [
      'Sister: Iron deficiency anemia during pregnancy',
      'Mother: Hypothyroidism'
    ],
    medications: [
      { name: 'Ferrous Bisglycinate + Vit C', dosage: '100 mg', frequency: 'Twice daily on empty stomach', reason: 'Iron store recovery' }
    ],
    supplements: [
      { name: 'Vitamin B-Complex + B12', dosage: '1 tab', frequency: 'Daily morning' }
    ],
    vitals: {
      heightCm: 160,
      weightKg: 52,
      bmi: '20.3',
      bpSystolic: 112,
      bpDiastolic: 72,
      heartRate: 82,
      spo2: 98,
      fastingGlucose: 84
    },
    lifestyle: {
      smoking: 'Never',
      alcohol: 'None',
      exercise: 'Yoga 4x/week',
      diet: 'Lacto-vegetarian',
      sleepHours: '7 hours/night'
    },
    notes: 'Follow-up CBC scheduled in 4 weeks to verify reticulocyte peak and Hb improvement.'
  },
  'ramesh': {
    id: 'pat-ramesh-741',
    name: 'Ramesh Patel',
    dob: '1974-11-05',
    age: '52',
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 99090 99090',
    email: 'ramesh.patel@gujarathealth.in',
    address: '42, Shanti Sadan Society, Navrangpura',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380009',
    emergencyContactName: 'Daksha Patel',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 99090 99091',
    abhaId: '91-7892-5510-7410',
    insuranceProvider: 'Star Health Senior Red Carpet',
    insurancePolicyNo: 'POL-SH-74102-DB',
    primaryPhysician: 'Dr. Rajesh Verma, MD, DM',
    medicalConditions: [
      'Type 2 Diabetes Mellitus (HbA1c 7.4%, Fasting 156 mg/dL)',
      'Hypertriglyceridemia (220 mg/dL)',
      'Metabolic-Associated Steatotic Liver (ALT 48 U/L)',
      'Borderline Hypertension'
    ],
    surgeries: [
      { name: 'Laparoscopic Cholecystectomy', year: '2016', hospital: 'Sterling Hospital, Ahmedabad', notes: 'Gallstones removed; smooth post-op course' }
    ],
    allergies: [],
    familyHistory: [
      'Father: Type 2 Diabetes, Diabetic Nephropathy',
      'Mother: Hypertension & Dyslipidemia'
    ],
    medications: [
      { name: 'Metformin Hydrochloride (ER)', dosage: '500 mg', frequency: 'Twice daily after meals', reason: 'Glycemic control' },
      { name: 'Fenofibrate', dosage: '145 mg', frequency: 'Once daily at dinner', reason: 'Triglyceride lowering' }
    ],
    supplements: [
      { name: 'Alpha Lipoic Acid', dosage: '300 mg', frequency: 'Once daily' }
    ],
    vitals: {
      heightCm: 172,
      weightKg: 84,
      bmi: '28.4',
      bpSystolic: 134,
      bpDiastolic: 86,
      heartRate: 76,
      spo2: 97,
      fastingGlucose: 156
    },
    lifestyle: {
      smoking: 'Former smoker (Quit 8 years ago)',
      alcohol: 'None',
      exercise: 'Brisk walking 30 mins daily',
      diet: 'Traditional Gujarati vegetarian (reducing sugar & refined wheat)',
      sleepHours: '6.5 hours/night'
    },
    notes: 'Consultation with endocrinologist scheduled to evaluate adding SGLT2 inhibitor for dual glycemic & renal protection.'
  },
  'david': {
    id: 'pat-david-449',
    name: 'David Ross',
    dob: '1968-02-19',
    age: '58',
    gender: 'Male',
    bloodGroup: 'O-',
    phone: '+91 98450 12345',
    email: 'david.ross@stanfordalumni.org',
    address: '14/3, Richmond Town',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560025',
    emergencyContactName: 'Clara Ross',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+91 98450 12346',
    abhaId: '91-4491-7102-4490',
    insuranceProvider: 'Bupa International Global Health',
    insurancePolicyNo: 'POL-BUPA-99014-DX',
    primaryPhysician: 'Dr. Anita Sharma, MD',
    medicalConditions: [
      'Diffuse Large B-Cell Lymphoma in Sustained Complete Remission (Year 4)',
      'Post-Chemotherapy Surveillance',
      'Mild Osteopenia'
    ],
    surgeries: [
      { name: 'Port-a-Cath Placement & Subsequent Removal', year: '2022', hospital: 'Stanford Comprehensive Cancer Center', notes: 'Port successfully explanted post-chemo completion' }
    ],
    allergies: [
      { allergen: 'Intravenous Iodinated CT Contrast', severity: 'Moderate', reaction: 'Bronchospasm & flushing; requires steroid premedication' }
    ],
    familyHistory: [
      'Father: Colorectal Polyps at age 65',
      'Mother: Osteoarthritis'
    ],
    medications: [
      { name: 'Calcium Carbonate + Vit D3', dosage: '500 mg', frequency: 'Twice daily with meals', reason: 'Bone mineral density support' }
    ],
    supplements: [
      { name: 'CoQ10 (Ubiquinol)', dosage: '100 mg', frequency: 'Daily morning' }
    ],
    vitals: {
      heightCm: 180,
      weightKg: 75,
      bmi: '23.1',
      bpSystolic: 120,
      bpDiastolic: 78,
      heartRate: 68,
      spo2: 99,
      fastingGlucose: 86
    },
    lifestyle: {
      smoking: 'Never',
      alcohol: 'Occasional red wine',
      exercise: 'Swimming & cycling 4x/week',
      diet: 'High antioxidant anti-inflammatory Mediterranean diet',
      sleepHours: '8 hours/night'
    },
    notes: 'Full cellular marrow recovery confirmed with ANC 3.4 and Platelets 210k. Annual surveillance visits on track.'
  }
};

class MedicalStore {
  constructor() {
    this.STORAGE_KEY = 'report_saathi_state_v1';
    this.PROFILE_STORAGE_KEY = 'report_saathi_patient_profile';
    this.AUTH_STORAGE_KEY = 'report_saathi_auth_user';
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.activeReportKey = parsed.activeReportKey || 'alex';
        this.customEdits = parsed.customEdits || {};
        this.bookedAppointments = parsed.bookedAppointments || [];
        this.prescriptions = parsed.prescriptions || [];
        this.auditLogs = parsed.auditLogs || [];
        this.patientProfiles = parsed.patientProfiles || {};
        this.authUser = parsed.authUser || {
          isLoggedIn: true,
          email: 'alex.morgan@health.in',
          name: 'Alex Morgan',
          patientKey: 'alex'
        };
      } else {
        this.resetDefaults();
      }
    } catch (e) {
      this.resetDefaults();
    }
  }

  resetDefaults() {
    this.activeReportKey = 'alex';
    this.customEdits = {};
    this.patientProfiles = JSON.parse(JSON.stringify(DEFAULT_PATIENT_PROFILES));
    this.authUser = {
      isLoggedIn: true,
      email: 'alex.morgan@health.in',
      name: 'Alex Morgan',
      patientKey: 'alex'
    };
    this.bookedAppointments = [
      {
        id: 'apt-101',
        doctorName: 'Dr. Anita Sharma, MD',
        date: 'Today, 3:30 PM EDT',
        status: 'CONFIRMED',
        reason: 'Review Elevated hs-CRP (3.8 mg/L) & Chol/HDL Ratio',
        reportId: 'rep-alex-904'
      }
    ];
    this.prescriptions = [];
    this.auditLogs = [
      { timestamp: new Date().toISOString(), action: 'STATE_INITIALIZED', user: 'System', details: 'Report Saathi Store v1.0 Ready' }
    ];
    this.saveState();
  }

  saveState() {
    try {
      const payload = {
        activeReportKey: this.activeReportKey,
        customEdits: this.customEdits,
        bookedAppointments: this.bookedAppointments,
        prescriptions: this.prescriptions,
        patientProfiles: this.patientProfiles,
        authUser: this.authUser,
        auditLogs: this.auditLogs.slice(-50)
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(this.getPatientProfile()));
      localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(this.authUser));
      window.dispatchEvent(new CustomEvent('report-saathi-state-change', { detail: payload }));
    } catch (e) {
      console.warn('Failed to persist to localStorage', e);
    }
  }

  getPatientProfile(key = null) {
    const targetKey = key || this.activeReportKey || 'alex';
    if (this.patientProfiles && this.patientProfiles[targetKey]) {
      return this.patientProfiles[targetKey];
    }
    if (DEFAULT_PATIENT_PROFILES[targetKey]) {
      return JSON.parse(JSON.stringify(DEFAULT_PATIENT_PROFILES[targetKey]));
    }
    return JSON.parse(JSON.stringify(DEFAULT_PATIENT_PROFILES['alex']));
  }

  savePatientProfile(profileData, key = null) {
    const targetKey = key || this.activeReportKey || 'alex';
    if (!this.patientProfiles) this.patientProfiles = {};

    const existing = this.getPatientProfile(targetKey);
    const updated = {
      ...existing,
      ...profileData,
      lastUpdated: new Date().toISOString()
    };

    this.patientProfiles[targetKey] = updated;

    // Synchronize auth state and synthetic reports
    if (this.authUser && (this.authUser.patientKey === targetKey || !this.authUser.patientKey)) {
      this.authUser.name = updated.name || this.authUser.name;
      this.authUser.email = updated.email || this.authUser.email;
    }

    if (SYNTHETIC_REPORTS[targetKey]) {
      SYNTHETIC_REPORTS[targetKey].patientName = updated.name;
      if (updated.age) {
        const genderSuffix = updated.gender ? (updated.gender.startsWith('F') ? 'F' : 'M') : '';
        SYNTHETIC_REPORTS[targetKey].patientAge = `${updated.age}${genderSuffix}`;
      }
    }

    this.addAuditLog('PROFILE_UPDATED', `Updated personal info & history for ${updated.name}`);
    this.saveState();
    return updated;
  }

  loginUser(email, password, patientKey = 'alex') {
    const targetKey = patientKey || 'alex';
    this.activeReportKey = targetKey;
    const profile = this.getPatientProfile(targetKey);

    this.authUser = {
      isLoggedIn: true,
      email: email || profile.email,
      name: profile.name,
      patientKey: targetKey,
      loginTimestamp: new Date().toISOString()
    };

    this.addAuditLog('USER_LOGGED_IN', `Authenticated patient: ${profile.name} (${email || profile.email})`);
    this.saveState();
    return this.authUser;
  }

  registerUser(userData) {
    const newKey = 'custom_' + Date.now();
    const newProfile = {
      ...DEFAULT_PATIENT_PROFILES['alex'],
      id: 'pat-' + Date.now(),
      name: userData.name || 'New Patient',
      email: userData.email || '',
      phone: userData.phone || '',
      dob: userData.dob || '1990-01-01',
      age: userData.age || '36',
      gender: userData.gender || 'Other',
      bloodGroup: userData.bloodGroup || 'O+',
      medicalConditions: [],
      surgeries: [],
      allergies: [],
      medications: [],
      supplements: [],
      lastUpdated: new Date().toISOString()
    };

    if (!this.patientProfiles) this.patientProfiles = {};
    this.patientProfiles[newKey] = newProfile;
    this.activeReportKey = newKey;

    // Create synthetic baseline report for new patient
    SYNTHETIC_REPORTS[newKey] = {
      ...SYNTHETIC_REPORTS['alex'],
      id: 'rep-' + newKey,
      patientName: newProfile.name,
      patientAge: `${newProfile.age}${newProfile.gender ? newProfile.gender[0] : ''}`,
      mrn: `#PAT-${Math.floor(1000 + Math.random() * 9000)}-DX`,
      collectionDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    this.authUser = {
      isLoggedIn: true,
      email: newProfile.email,
      name: newProfile.name,
      patientKey: newKey,
      loginTimestamp: new Date().toISOString()
    };

    this.addAuditLog('USER_REGISTERED', `New patient registered: ${newProfile.name}`);
    this.saveState();
    return newProfile;
  }

  logoutUser() {
    this.authUser = {
      isLoggedIn: false,
      email: '',
      name: '',
      patientKey: null
    };
    this.addAuditLog('USER_LOGGED_OUT', 'Patient signed out');
    this.saveState();
    return true;
  }

  getActiveReport() {
    const base = SYNTHETIC_REPORTS[this.activeReportKey] || SYNTHETIC_REPORTS['alex'];
    const profile = this.getPatientProfile(this.activeReportKey);

    // Dynamic overlay from saved profile
    if (profile && profile.name) {
      base.patientName = profile.name;
      if (profile.age) {
        const genderSuffix = profile.gender ? (profile.gender.startsWith('F') ? 'F' : 'M') : '';
        base.patientAge = `${profile.age}${genderSuffix}`;
      }
    }

    // Merge custom human-review edits if any
    const editedParams = base.parameters.map(p => {
      const edit = this.customEdits[`${base.id}_${p.id}`];
      if (edit !== undefined) {
        return { ...p, value: edit, isCorrected: true };
      }
      return p;
    });

    return {
      ...base,
      parameters: editedParams
    };
  }

  setActiveReportKey(key) {
    if (SYNTHETIC_REPORTS[key] || DEFAULT_PATIENT_PROFILES[key]) {
      this.activeReportKey = key;
      const profile = this.getPatientProfile(key);
      if (this.authUser) {
        this.authUser.patientKey = key;
        this.authUser.name = profile.name;
        this.authUser.email = profile.email;
      }
      this.addAuditLog('REPORT_SWITCHED', `Active patient profile set to ${profile.name} (${key})`);
      this.saveState();
    }
  }

  updateParameterValue(reportId, paramId, newValue) {
    this.customEdits[`${reportId}_${paramId}`] = parseFloat(newValue) || newValue;
    this.addAuditLog('HUMAN_REVIEW_CORRECTION', `User corrected param ${paramId} to ${newValue}`);
    this.saveState();
  }

  addAppointment(apt) {
    this.bookedAppointments.unshift(apt);
    this.addAuditLog('APPOINTMENT_BOOKED', `Booked with ${apt.doctorName} for ${apt.date}`);
    this.saveState();
  }

  addPrescription(rx) {
    this.prescriptions.unshift(rx);
    this.addAuditLog('PRESCRIPTION_ISSUED', `Rx ${rx.id} issued by ${rx.doctorName}`);
    this.saveState();
  }

  addAuditLog(action, details) {
    this.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      details,
      ip: '127.0.0.1 (Local Verified)'
    });
  }
}

export const medicalStore = new MedicalStore();

