import { BackgroundEngine } from './bg-engine.js';
import { medicalStore, SYNTHETIC_REPORTS, DOCTORS_DIRECTORY, DEFAULT_PATIENT_PROFILES } from './store.js';

class ReportSaathiApp {
  constructor() {
    this.currentLens = 'patient';
    this.currentModule = 'all';
    this.store = medicalStore;

    // Listen for cross-page and state change events
    window.addEventListener('report-saathi-state-change', () => {
      this.syncUIWithState();
    });

    this.initBackgroundEngine();
    this.initGlobalPatientSwitcher();
    this.initCriticalAlertBanner();
    this.initFilterTabs();
    this.initLensToggle();
    this.initDropzone();
    this.initHUD();
    this.initAssistantChat();
    this.initTrackerInteractions();
    this.initTelehealth();
    this.initQuestionsChecklist();
    this.initProcessingPipeline();
    this.initHumanReviewModal();
    this.initDoctorBooking();
    this.initPrescriptionVerification();
    this.initProfilePage();
    this.initLoginPage();
    this.initUploadPage();
    this.initLegalModals();
    this.syncNavbarPatientProfile();

    this.syncUIWithState();
  }

  initLegalModals() {
    const modal = document.getElementById('legal-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('legal-modal-close');
    const footerCloseBtn = document.getElementById('legal-modal-footer-close');
    const views = modal.querySelectorAll('.legal-modal-view');
    const modalTabs = modal.querySelectorAll('.legal-modal-tab');

    const switchLegalTab = (key) => {
      const target = (key === 'terms' || key === 'terms-conditions') ? 'terms'
        : (key === 'privacy' || key === 'privacy-policy') ? 'privacy'
        : 'about';

      views.forEach((view) => {
        const isMatch = view.getAttribute('data-legal-view') === target;
        view.hidden = !isMatch;
        if (isMatch) {
          view.scrollTop = 0;
        }
      });

      modalTabs.forEach((tab) => {
        const tabTarget = tab.getAttribute('data-legal-target');
        const isActive = tabTarget === target;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      modal.setAttribute('aria-labelledby', `legal-title-${target}`);
      const scrollBody = modal.querySelector('.legal-modal-body');
      if (scrollBody) scrollBody.scrollTop = 0;
    };

    const openLegal = (key) => {
      switchLegalTab(key);
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('open'));
      document.body.style.overflow = 'hidden';
    };

    const closeLegal = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!modal.classList.contains('open')) modal.hidden = true;
      }, 250);
    };

    document.querySelectorAll('.legal-open-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const key = btn.getAttribute('data-legal') || 'about';
        openLegal(key);
      });
    });

    modalTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.getAttribute('data-legal-target');
        switchLegalTab(target);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLegal);
    if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeLegal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('legal-modal-backdrop')) {
        closeLegal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeLegal();
    });

    // Support URL hash trigger if present
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('about')) {
        openLegal('about');
      } else if (hash.includes('term')) {
        openLegal('terms');
      } else if (hash.includes('privac')) {
        openLegal('privacy');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
  }

  initBackgroundEngine() {
    const frameCanvas = document.getElementById('bg-frame-canvas');
    const helixCanvas = document.getElementById('bg-helix-canvas');
    const container = document.getElementById('bg-canvas-container');

    const hudFrameDisplay = document.getElementById('hud-frame-display');
    const hudFpsDisplay = document.getElementById('hud-fps-display');
    const loadProgressEl = document.getElementById('canvas-load-progress');

    this.engine = new BackgroundEngine({
      frameCanvas,
      helixCanvas,
      container,
      onProgress: (loaded, total) => {
        if (loadProgressEl) {
          const pct = Math.round((loaded / total) * 100);
          loadProgressEl.textContent = `${pct}% DNA Loaded (${loaded}/${total})`;
          if (loaded >= total) {
            setTimeout(() => {
              const badgeWrap = document.getElementById('loading-badge-wrap');
              if (badgeWrap) {
                badgeWrap.style.opacity = '0';
                setTimeout(() => badgeWrap.remove(), 400);
              }
            }, 800);
          }
        }
      },
      onFrameUpdate: (frame, total, fps) => {
        const hudPanel = document.getElementById('hud-panel');
        if (hudPanel && hudPanel.classList.contains('open')) {
          if (hudFrameDisplay) {
            hudFrameDisplay.textContent = `${String(frame).padStart(3, '0')} / ${total}`;
          }
          if (hudFpsDisplay) {
            hudFpsDisplay.textContent = `${fps} FPS`;
          }
        }
      }
    });
  }

  showToast(message, duration = 3500) {
    let toast = document.getElementById('report-saathi-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'report-saathi-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '28px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.background = '#1D4E89';
      toast.style.color = '#FFFFFF';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '9999px';
      toast.style.fontSize = '0.88rem';
      toast.style.fontWeight = '600';
      toast.style.boxShadow = '0 10px 30px rgba(15, 36, 62, 0.3)';
      toast.style.zIndex = '999999';
      toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      toast.style.pointerEvents = 'none';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
  }

  // 1. Critical Value Alert Banner (Hard-Coded Rule, In India Call 112)
  initCriticalAlertBanner() {
    let banner = document.getElementById('global-critical-alert');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'global-critical-alert';
      banner.className = 'critical-alert-banner';
      
      const header = document.querySelector('.site-header');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(banner, header.nextSibling);
      } else {
        document.body.prepend(banner);
      }
    }
    this.updateCriticalAlert();
  }

  updateCriticalAlert() {
    const banner = document.getElementById('global-critical-alert');
    if (!banner) return;

    const report = this.store.getActiveReport();
    if (report && report.hasCritical) {
      banner.classList.add('active');
      banner.innerHTML = `
        <div class="container-xl critical-alert-content">
          <div class="critical-alert-text-group">
            <div class="critical-alert-icon">
              <span class="material-symbols-outlined" style="font-size: 20px;">emergency</span>
            </div>
            <div class="critical-alert-msg">
              <strong>CRITICAL LAB VALUE DETECTED:</strong> ${report.criticalMsg || report.criticalParam + ' is critically out of range.'}
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <a href="/telehealth.html" class="critical-alert-cta-btn">
              <span class="material-symbols-outlined" style="font-size: 16px;">video_call</span>
              <span>Consult On-Duty Doctor Now</span>
            </a>
          </div>
        </div>
      `;
    } else {
      banner.classList.remove('active');
      banner.innerHTML = '';
    }
  }

  // 2. Global Active Patient Switcher (Removed per user request)
  initGlobalPatientSwitcher() {
    const strip = document.getElementById('global-patient-switcher');
    if (strip) strip.remove();
  }

  renderPatientSwitcherStrip() {
    const strip = document.getElementById('global-patient-switcher');
    if (strip) strip.remove();
  }

  // Sync all parts of current page when store changes
  syncUIWithState() {
    this.updateCriticalAlert();
    this.syncNavbarPatientProfile();
    this.renderBiomarkers();
    this.updateOverviewDossier();
    this.updateAssistantContext();
    this.updateTelehealthContext();
    this.updateTrackerData();
    if (document.getElementById('patient-profile-form')) {
      this.populateProfileForm();
    }
  }

  // Update Overview Page Dossier & Metrics
  updateOverviewDossier() {
    const report = this.store.getActiveReport();
    if (!report) return;

    // Update patient name & age on overview if present
    const nameEl = document.getElementById('overview-patient-name');
    if (nameEl) nameEl.textContent = `${report.patientName}, ${report.patientAge}`;

    const mrnEl = document.getElementById('overview-patient-mrn');
    if (mrnEl) mrnEl.textContent = `MRN: ${report.mrn} • Specimen: ${report.labName}`;

    // Update In-Range Counter
    const inRangeEl = document.getElementById('overview-in-range-count');
    if (inRangeEl) inRangeEl.textContent = `${report.inRangeCount} of ${report.totalParameters}`;

    const inRangeNote = document.getElementById('overview-in-range-note');
    if (inRangeNote) {
      inRangeNote.textContent = report.flaggedCount > 0 
        ? `${report.flaggedCount} parameter${report.flaggedCount > 1 ? 's' : ''} outside physiological reference range` 
        : 'All 18 parameters strictly within optimal clinical reference';
    }

    // Update Overview summary text
    const summaryEl = document.getElementById('overview-report-summary');
    if (summaryEl) {
      summaryEl.textContent = report.summary;
    }
  }

  // Update Assistant Page Context & Questions
  updateAssistantContext() {
    const report = this.store.getActiveReport();
    if (!report) return;

    // Update AI welcome message in chat if container exists
    const container = document.getElementById('chat-messages-container');
    if (container && !container.dataset.customChat) {
      container.innerHTML = `
        <div class="chat-msg-assistant">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-weight: 700; color: var(--primary); font-size: 0.8rem;">
            <span class="material-symbols-outlined" style="font-size: 16px;">verified</span>
            <span>Report Saathi Diagnostic AI</span>
          </div>
          <p style="margin: 0 0 8px 0;">
            Hello ${report.patientName.split(' ')[0]}. I've reviewed your verified laboratory specimen (<code>${report.mrn}</code>).
          </p>
          <p style="margin: 0 0 8px 0;">
            <strong>${report.inRangeCount} of ${report.totalParameters} parameters</strong> are in normal physiological range.
            ${report.summary}
          </p>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 8px; border-top: 1px solid var(--border-light); padding-top: 6px;">
            <em>This summary is AI-generated from your report values. It does not replace advice from your doctor.</em>
          </div>
        </div>
      `;
    }

    // Update question chips
    const chipsRow = document.querySelector('.chat-prompt-chips-row');
    if (chipsRow && report.parameters) {
      const topQuestions = report.parameters.slice(0, 4).map(p => p.prompt);
      chipsRow.innerHTML = topQuestions.map(q => `<button class="chat-prompt-chip">"${q}"</button>`).join('');
      
      chipsRow.querySelectorAll('.chat-prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.textContent.trim().replace(/^["']|["']$/g, '');
          const input = document.getElementById('chat-user-input');
          if (input) input.value = query;
          const sendBtn = document.getElementById('chat-send-btn');
          if (sendBtn) sendBtn.click();
        });
      });
    }

    // Update Questions Checklist Card
    const checklistWrap = document.querySelector('.questions-checklist-card .question-row-item');
    if (checklistWrap) {
      const parentList = checklistWrap.parentElement;
      if (parentList) {
        parentList.innerHTML = report.questionsForDoctor.map((q, idx) => `
          <div class="question-row-item">
            <div class="q-badge-num">${idx + 1}</div>
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 0.72rem; font-weight: 700; color: var(--primary); text-transform: uppercase; font-family: var(--font-mono);">
                  Clinical Question ${idx + 1}
                </span>
                <input type="checkbox" class="question-checkbox" title="Mark question as asked">
              </div>
              <p style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.5; margin: 0; font-weight: 500;">
                "${q}"
              </p>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Update Telehealth Page Patient Context & Prescribing Pad
  updateTelehealthContext() {
    const report = this.store.getActiveReport();
    if (!report) return;

    const patientNameDisplay = document.getElementById('rx-patient-name-display');
    if (patientNameDisplay) {
      patientNameDisplay.textContent = `${report.patientName} (${report.patientAge}) • MRN: ${report.mrn}`;
    }

    const scribeTranscript = document.getElementById('scribe-transcript-text');
    if (scribeTranscript) {
      scribeTranscript.textContent = `"${report.summary}"`;
    }

    const hudPlt = document.getElementById('hud-patient-plt');
    if (hudPlt) {
      if (report.hasCritical) {
        hudPlt.textContent = `${report.criticalParam}: ${report.criticalValue} (CRITICAL)`;
        hudPlt.style.color = '#C8324A';
      } else {
        hudPlt.textContent = `${report.inRangeCount}/${report.totalParameters} In-Range (${report.status})`;
        hudPlt.style.color = '#1F7A47';
      }
    }
  }

  // Update Tracker Page with Active Patient
  updateTrackerData() {
    const report = this.store.getActiveReport();
    if (!report) return;

    const activePeriodLabel = document.getElementById('tracker-active-period-label');
    if (activePeriodLabel) {
      activePeriodLabel.textContent = `Active Specimen: ${report.patientName} • ${report.collectionDate} (${report.category})`;
    }
  }

  // 3. Render Biomarkers on Intelligence Page dynamically from Store
  renderBiomarkers() {
    const container = document.getElementById('biomarkers-stream-container');
    if (!container) return;

    const report = this.store.getActiveReport();
    const params = report.parameters || [];

    const filtered = params.filter(m => {
      if (this.currentModule !== 'all' && m.category !== this.currentModule) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; background: #FFFFFF; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <span class="material-symbols-outlined" style="font-size: 36px; color: var(--text-muted); margin-bottom: 0.5rem;">science</span>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin: 0;">No parameters in selected category for ${report.patientName}.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(m => {
      let badgeClass = 'pill-optimal';
      let icon = 'check_circle';
      let statusLabel = 'IN RANGE';

      if (m.status === 'critical') {
        badgeClass = 'pill-elevated';
        icon = 'crisis_alert';
        statusLabel = 'CRITICAL OUT OF RANGE';
      } else if (m.status === 'warning') {
        badgeClass = 'pill-borderline';
        icon = 'warning';
        statusLabel = 'BORDERLINE / MONITOR';
      }

      // Compute range bar relative percentage
      const low = m.refLow;
      const high = m.refHigh;
      const range = high - low;
      let posPct = 50;
      if (range > 0) {
        posPct = Math.min(Math.max(((m.value - low) / range) * 50 + 25, 5), 95);
      }

      return `
        <div class="biomarker-spec-card" id="card-${m.id}">
          <div class="card-top-row">
            <div class="card-identity-group">
              <div class="card-icon-circle">
                <span class="material-symbols-outlined" style="font-size: 20px;">${icon}</span>
              </div>
              <div class="card-title-stack">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="analyte-name">${m.name}</span>
                  ${m.isCorrected ? '<span style="font-size: 0.65rem; background: #EBF3FC; color: #1D4E89; padding: 1px 6px; border-radius: 4px; font-weight: 700;">USER VERIFIED</span>' : ''}
                </div>
                <span class="panel-tag">${m.category.toUpperCase()} PANEL • REF: ${m.refLow} – ${m.refHigh} ${m.unit}</span>
              </div>
            </div>

            <div class="status-pill-badge ${badgeClass}">
              <span class="material-symbols-outlined" style="font-size: 14px;">${icon}</span>
              <span>${statusLabel}</span>
            </div>
          </div>

          <div class="card-reading-cluster">
            <div class="reading-big-num">
              ${m.value} <span class="reading-unit">${m.unit}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn-edit-param" data-id="${m.id}" data-val="${m.value}" data-name="${m.name}" style="padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-color); background: #FFFFFF; font-size: 0.72rem; cursor: pointer; color: var(--primary);">
                ✏️ Edit Value
              </button>
            </div>
          </div>

          <!-- Dynamic Visual Range Track -->
          <div class="range-meter-track-wrap">
            <div class="range-meter-track">
              <div class="range-optimal-zone" style="left: 25%; width: 50%;" title="Normal Physiological Zone: ${m.refLow} – ${m.refHigh}"></div>
              <div class="range-current-pin" style="left: ${posPct}%; background: ${m.status === 'critical' ? '#C8324A' : (m.status === 'warning' ? '#8A6200' : '#1F7A47')};" title="Current Reading: ${m.value}"></div>
            </div>
            <div class="range-endpoints-legend">
              <span>${m.refLow} ${m.unit} (Min)</span>
              <span>Reference Band (${m.refLow} – ${m.refHigh})</span>
              <span>${m.refHigh} ${m.unit} (Max)</span>
            </div>
          </div>

          <!-- Dual-Lens Clinical Explanations -->
          <div class="dual-lens-content-block">
            <div class="lens-col-patient" style="display: ${this.currentLens === 'patient' ? 'block' : 'none'};">
              <span class="lens-label">PATIENT SUMMARY (PLAIN ENGLISH)</span>
              <p class="lens-text">${m.meaning} ${m.reason}</p>
            </div>

            <div class="lens-col-clinical" style="display: ${this.currentLens === 'clinical' ? 'block' : 'none'};">
              <span class="lens-label">PATHOLOGIST / CLINICAL MD RATIONALE</span>
              <p class="lens-text">Reference range: ${m.refLow}–${m.refHigh} ${m.unit}. Physiological reason: ${m.reason}. Deterministic rule verified by LabSense Engine v4.2.</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--border-light); font-size: 0.78rem;">
            <a href="/assistant.html" class="link-ask-doctor" style="color: var(--primary); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <span class="material-symbols-outlined" style="font-size: 16px;">chat</span>
              Ask AI about ${m.name.split(' ')[0]} →
            </a>
            <a href="/telehealth.html" style="color: var(--primary); font-weight: 600; text-decoration: none;">Discuss with Doctor →</a>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listener to "Edit Value" buttons for human review (FR-108)
    container.querySelectorAll('.btn-edit-param').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        const val = btn.getAttribute('data-val');
        this.openParamEditModal(report.id, id, name, val);
      });
    });
  }

  // 4. Processing Pipeline Stepper Modal (Section 5.1 & Section 13)
  initProcessingPipeline() {
    let modal = document.getElementById('stepper-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'stepper-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card">
          <button class="modal-close-btn" id="stepper-modal-close">✕</button>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 22px;">biotech</span>
            </div>
            <div>
              <h3 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--primary); margin: 0;">Report Ingestion &amp; OCR Engine</h3>
              <span style="font-size: 0.8rem; color: var(--text-muted);">PaddleOCR + Deterministic Rule Engine Pipeline</span>
            </div>
          </div>

          <div class="stepper-pipeline-list" id="pipeline-steps-container">
            <!-- Dynamically populated -->
          </div>

          <div id="pipeline-footer-action" style="display: none; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button id="btn-open-human-review" class="btn-primary" style="flex: 1; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 18px;">fact_check</span>
                <span>Open OCR Verification</span>
              </button>
              <a href="/intelligence.html" class="btn-primary" style="flex: 1; justify-content: center; background: #1E7E4E; text-decoration: none;">
                <span class="material-symbols-outlined" style="font-size: 18px;">analytics</span>
                <span>View Analyzed Report</span>
              </a>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#stepper-modal-close').addEventListener('click', () => {
        modal.classList.remove('open');
      });

      modal.querySelector('#btn-open-human-review').addEventListener('click', () => {
        modal.classList.remove('open');
        this.openHumanReviewModal();
      });
    }
  }

  startProcessingPipeline(fileName = 'sample-blood-report.pdf') {
    const modal = document.getElementById('stepper-modal');
    const container = document.getElementById('pipeline-steps-container');
    const footerAction = document.getElementById('pipeline-footer-action');
    if (!modal || !container) return;

    modal.classList.add('open');
    footerAction.style.display = 'none';

    const steps = [
      { id: 1, name: 'UPLOADED', desc: `File received (${fileName}), SHA-256 hash verified, MIME validation passed.` },
      { id: 2, name: 'QUEUED', desc: 'Job published to Spring @Async execution queue with signed S3 token.' },
      { id: 3, name: 'OCR_RUNNING', desc: 'PaddleOCR running table detection, coordinate mapping & bounding box capture.' },
      { id: 4, name: 'EXTRACTED', desc: 'Synonym normalization & deterministic rule engine checking reference ranges.' },
      { id: 5, name: 'AI_ANALYZED', desc: 'Guardrails checking schema, blocking diagnostic language, verifying 0 hallucinated numbers.' },
      { id: 6, name: 'READY', desc: 'Human review stage ready. Side-by-side verification enabled.' }
    ];

    container.innerHTML = steps.map(s => `
      <div class="stepper-step-item" id="step-${s.id}">
        <div class="step-indicator-circle">${s.id}</div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <strong style="font-size: 0.88rem; color: var(--primary); font-family: var(--font-mono);">${s.name}</strong>
          <span style="font-size: 0.78rem; color: var(--text-secondary);">${s.desc}</span>
        </div>
      </div>
    `).join('');

    let currentStep = 1;
    const interval = setInterval(() => {
      const prevEl = document.getElementById(`step-${currentStep}`);
      if (prevEl) {
        prevEl.classList.remove('active');
        prevEl.classList.add('complete');
      }

      currentStep++;
      const nextEl = document.getElementById(`step-${currentStep}`);
      if (nextEl) {
        nextEl.classList.add('active');
      } else {
        clearInterval(interval);
        footerAction.style.display = 'block';
        this.showToast('✓ OCR Extraction Complete! Ready for Human Review.');
      }
    }, 450);
  }

  // 5. Human Review / Side-by-Side OCR Bounding Box Modal (FR-108)
  initHumanReviewModal() {
    let modal = document.getElementById('human-review-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'human-review-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 900px;">
          <button class="modal-close-btn" id="human-review-close">✕</button>
          <div>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--accent-action); text-transform: uppercase;">FR-108 Human Review Mode</span>
            <h3 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--primary); margin: 2px 0;">Verify &amp; Correct Extracted Lab Values</h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">
              The original document is shown with OCR bounding boxes. You can click any extracted value to correct OCR errors before saving.
            </p>
          </div>

          <div class="ocr-review-split">
            <!-- Left: Scanned PDF simulated document with bounding boxes -->
            <div class="ocr-document-preview-box">
              <img id="ocr-doc-img" src="" alt="Scanned Lab Document" style="width: 100%; height: 100%; object-fit: contain; filter: contrast(1.1);">
              <!-- Interactive Bounding Boxes Overlay -->
              <div class="ocr-bounding-box" style="top: 25%; left: 35%; width: 30%; height: 8%;" title="OCR Bounding Box: Platelets [Confidence: 99.2%]"></div>
              <div class="ocr-bounding-box" style="top: 38%; left: 35%; width: 30%; height: 8%;" title="OCR Bounding Box: Hemoglobin [Confidence: 99.8%]"></div>
              <div class="ocr-bounding-box" style="top: 51%; left: 35%; width: 30%; height: 8%;" title="OCR Bounding Box: hs-CRP [Confidence: 98.6%]"></div>
            </div>

            <!-- Right: Editable Parameter List -->
            <div style="display: flex; flex-direction: column; max-height: 400px; overflow-y: auto; padding-right: 6px;" id="ocr-editable-params-list">
              <!-- Dynamically populated -->
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <button id="btn-save-human-review" class="btn-primary">
              <span class="material-symbols-outlined" style="font-size: 18px;">verified</span>
              <span>Confirm &amp; Recalculate Ranges</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#human-review-close').addEventListener('click', () => {
        modal.classList.remove('open');
      });

      modal.querySelector('#btn-save-human-review').addEventListener('click', () => {
        // Collect edits and save
        modal.querySelectorAll('.ocr-edit-input').forEach(input => {
          const paramId = input.getAttribute('data-param-id');
          const reportId = input.getAttribute('data-report-id');
          const val = input.value;
          this.store.updateParameterValue(reportId, paramId, val);
        });

        modal.classList.remove('open');
        this.showToast('✓ Human review saved! Recalculated deterministic status.');
      });
    }
  }

  openHumanReviewModal() {
    const modal = document.getElementById('human-review-modal');
    const container = document.getElementById('ocr-editable-params-list');
    const imgEl = document.getElementById('ocr-doc-img');
    if (!modal || !container) return;

    const report = this.store.getActiveReport();
    if (imgEl) {
      imgEl.src = report.ocrImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpPoCmQ_no7-jrwbTWe8ZBPeO7xnvZJSURRExz5Q1_pqYMgFrtwLBp0zF0ncR9Niq80d6B1fHnCQPsy35KMHIXN6s9l-JXbZDgswPyJBGySuaNA_DRcSOnIl4-yWxGeX7o1ieIaP3THXn1Ud6Y1UV4MBXuCaSjzBBN0BLTyGXbnS_rGleqgAmWMjST6I8xVLX8m9glY3rUUYq83SYbOqFJUEBVH8bCoPS607dpZER25l2nLEBpT5m2';
    }

    container.innerHTML = report.parameters.map(p => `
      <div class="ocr-edit-param-row">
        <div>
          <strong style="font-size: 0.88rem; color: var(--primary);">${p.name}</strong>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
            Ref: ${p.refLow} – ${p.refHigh} ${p.unit}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <input type="text" class="ocr-edit-input" data-param-id="${p.id}" data-report-id="${report.id}" value="${p.value}">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${p.unit}</span>
        </div>
      </div>
    `).join('');

    modal.classList.add('open');
  }

  openParamEditModal(reportId, paramId, paramName, currentValue) {
    const newVal = prompt(`Edit value for ${paramName}:`, currentValue);
    if (newVal !== null && newVal.trim() !== '') {
      this.store.updateParameterValue(reportId, paramId, newVal.trim());
      this.showToast(`✓ Updated ${paramName} to ${newVal.trim()}`);
    }
  }

  // 6. Doctor Discovery & Multi-Step Booking Modal (FR-114, FR-115)
  initDoctorBooking() {
    let modal = document.getElementById('booking-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'booking-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card">
          <button class="modal-close-btn" id="booking-modal-close">✕</button>
          <div>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">Telehealth Booking</span>
            <h3 style="font-family: var(--font-serif); font-size: 1.45rem; color: var(--primary); margin: 2px 0;">Schedule Virtual Doctor Consultation</h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">
              Connect with a board-certified hematologist or physician. Your active report will be pre-loaded into the doctor's context panel.
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="rx-form-group">
              <label class="rx-form-label">Select Verified Physician</label>
              <select id="booking-doc-select" class="rx-form-select">
                ${DOCTORS_DIRECTORY.map(d => `<option value="${d.id}">${d.name} (${d.specialty}) — ${d.fee}</option>`).join('')}
              </select>
            </div>

            <div class="rx-form-group">
              <label class="rx-form-label">Available Slot (User Timezone: EDT)</label>
              <select id="booking-slot-select" class="rx-form-select">
                <option>Today, 3:30 PM EDT (Next Earliest)</option>
                <option>Today, 5:15 PM EDT</option>
                <option>Tomorrow, 10:00 AM EDT</option>
                <option>Tomorrow, 2:30 PM EDT</option>
              </select>
            </div>

            <div class="rx-form-group">
              <label class="rx-form-label">Reason for Visit</label>
              <input type="text" id="booking-reason-input" class="rx-form-input" value="Review out-of-range biomarkers & discuss prevention plan">
            </div>

            <div style="padding: 0.85rem; background: var(--bg-card-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" checked id="booking-attach-report-cb">
                <span>Attach current active blood report to doctor's clinical chart</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" checked id="booking-consent-cb">
                <span>Consent to telemedicine consultation under DPDP 2023 &amp; NMC Practice Guidelines</span>
              </label>
            </div>

            <button id="btn-confirm-checkout" class="btn-primary" style="width: 100%; justify-content: center; height: 44px;">
              <span class="material-symbols-outlined" style="font-size: 20px;">lock</span>
              <span>Confirm &amp; Pay (Test Mode — $39)</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#booking-modal-close').addEventListener('click', () => {
        modal.classList.remove('open');
      });

      modal.querySelector('#btn-confirm-checkout').addEventListener('click', () => {
        const docSelect = modal.querySelector('#booking-doc-select');
        const slotSelect = modal.querySelector('#booking-slot-select');
        const reasonInput = modal.querySelector('#booking-reason-input');

        const docName = docSelect.options[docSelect.selectedIndex].text.split('(')[0].trim();
        const slot = slotSelect.value;
        const reason = reasonInput.value;

        this.store.addAppointment({
          id: `apt-${Date.now().toString().slice(-4)}`,
          doctorName: docName,
          date: slot,
          status: 'CONFIRMED',
          reason: reason,
          reportId: this.store.getActiveReport().id
        });

        modal.classList.remove('open');
        this.showToast(`✓ Appointment confirmed with ${docName} for ${slot}!`);
      });
    }

    // Attach to any booking triggers on page
    document.querySelectorAll('.btn-open-booking-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('open');
      });
    });
  }

  // 7. Prescription Verification & QR Code Modal (FR-118, FR-119)
  initPrescriptionVerification() {
    let modal = document.getElementById('rx-verify-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rx-verify-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 540px;">
          <button class="modal-close-btn" id="rx-verify-close">✕</button>
          <div class="prescription-doc-card">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--primary); padding-bottom: 0.85rem;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="material-symbols-outlined" style="color: var(--primary); font-size: 26px;">prescriptions</span>
                <div>
                  <h3 style="font-family: var(--font-serif); font-size: 1.25rem; color: var(--primary); margin: 0;">Verified e-Prescription</h3>
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">NMC Registry #48192-A • Verifiable Token</span>
                </div>
              </div>
              <span style="padding: 2px 8px; border-radius: 4px; background: rgba(31,122,71,0.1); color: #1F7A47; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;">
                AUTHENTIC
              </span>
            </div>

            <div style="display: flex; gap: 1.25rem; align-items: center;">
              <!-- Real SVG QR Code Pattern -->
              <div class="prescription-qr-wrap">
                <svg viewBox="0 0 100 100" class="rx-qr-svg">
                  <rect width="100" height="100" fill="#FFFFFF"/>
                  <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M19,19 h7 v7 h-7 z" fill="#1D4E89"/>
                  <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M74,19 h7 v7 h-7 z" fill="#1D4E89"/>
                  <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M19,74 h7 v7 h-7 z" fill="#1D4E89"/>
                  <rect x="42" y="15" width="8" height="8" fill="#1D4E89"/>
                  <rect x="52" y="25" width="6" height="6" fill="#1D4E89"/>
                  <rect x="42" y="45" width="16" height="16" fill="#E4572E"/>
                  <rect x="65" y="65" width="10" height="10" fill="#1D4E89"/>
                  <rect x="80" y="75" width="8" height="8" fill="#1D4E89"/>
                </svg>
                <span style="font-family: var(--font-mono); font-size: 0.6rem; color: var(--text-muted); margin-top: 4px;">SCAN TO VERIFY</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem;">
                <div><strong>Physician:</strong> Dr. Anita Sharma, MD</div>
                <div><strong>Specialty:</strong> Hematology &amp; Molecular Genetics</div>
                <div><strong>Prescription ID:</strong> <code>RX-HEM-8841-B</code></div>
                <div><strong>Issued Date:</strong> 18 Oct 2026 • Valid x 30 Days</div>
                <div><strong>Digital Signature:</strong> Verified HL7 / FHIR Key</div>
              </div>
            </div>

            <div style="padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-card-subtle); border: 1px solid var(--border-color); font-size: 0.82rem;">
              <strong>Prescribed Regimen:</strong> Dexamethasone 40mg Oral once daily x 4 consecutive days. Repeat Citrate Tube CBC on Day 5.
            </div>

            <button class="btn-primary" style="justify-content: center;" onclick="window.print()">
              <span class="material-symbols-outlined" style="font-size: 18px;">print</span>
              <span>Download Signed Prescription PDF</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#rx-verify-close').addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    const verifyTrigger = document.getElementById('btn-verify-rx-qr');
    if (verifyTrigger) {
      verifyTrigger.addEventListener('click', () => {
        modal.classList.add('open');
      });
    }
  }

  // Filter tabs for categories (CBC, Lipid, CMP, Renal, etc.)
  initFilterTabs() {
    const moduleBtns = document.querySelectorAll('.chip-filter-btn');
    moduleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moduleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentModule = btn.getAttribute('data-module') || 'all';
        this.renderBiomarkers();
      });
    });
  }

  initLensToggle() {
    const btnPatient = document.getElementById('btn-lens-patient');
    const btnClinical = document.getElementById('btn-lens-clinical');

    if (btnPatient && btnClinical) {
      btnPatient.addEventListener('click', () => {
        this.currentLens = 'patient';
        btnPatient.classList.add('active');
        btnClinical.classList.remove('active');
        this.updateLensDisplay();
      });

      btnClinical.addEventListener('click', () => {
        this.currentLens = 'clinical';
        btnClinical.classList.add('active');
        btnPatient.classList.remove('active');
        this.updateLensDisplay();
      });
    }
  }

  updateLensDisplay() {
    document.querySelectorAll('.lens-col-patient').forEach(el => {
      el.style.display = (this.currentLens === 'patient') ? 'block' : 'none';
    });
    document.querySelectorAll('.lens-col-clinical').forEach(el => {
      el.style.display = (this.currentLens === 'clinical') ? 'block' : 'none';
    });
  }

  initDropzone() {
    const dropzoneBoxes = document.querySelectorAll('.dropzone-border-box, .hero-fast-dropzone, .dropzone-inner-click, .upload-primary-dropzone');
    dropzoneBoxes.forEach(box => {
      box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('dragover');
      });

      box.addEventListener('dragleave', () => {
        box.classList.remove('dragover');
      });

      box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
          this.startProcessingPipeline(file.name);
        }
      });

      box.addEventListener('click', (e) => {
        // If clicking on an internal anchor link or button, allow normal action
        if (e.target.closest('a') || e.target.closest('button')) return;
        const fileInput = box.querySelector('input[type="file"]') || document.getElementById('upload-main-file-input') || document.getElementById('hero-file-input');
        if (fileInput) fileInput.click();
      });
    });

    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.startProcessingPipeline(file.name);
        }
      });
    });

    const heroBrowseBtn = document.getElementById('hero-btn-browse-file');
    if (heroBrowseBtn && heroBrowseBtn.tagName === 'BUTTON') {
      heroBrowseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileInput = document.getElementById('hero-file-input');
        if (fileInput) fileInput.click();
      });
    }
  }

  initUploadPage() {
    // Browse button on upload page
    const browseBtn = document.getElementById('btn-browse-file-main');
    const mainFileInput = document.getElementById('upload-main-file-input');
    if (browseBtn && mainFileInput) {
      browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mainFileInput.click();
      });
    }

    // Camera button on upload page
    const cameraBtn = document.getElementById('btn-camera-upload-main');
    const cameraFileInput = document.getElementById('upload-camera-file-input');
    if (cameraBtn && cameraFileInput) {
      cameraBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cameraFileInput.click();
      });
    }

    // One-click Sample patient cards on upload page
    const sampleCards = document.querySelectorAll('.sample-patient-card');
    sampleCards.forEach(card => {
      card.addEventListener('click', () => {
        const patientKey = card.getAttribute('data-patient-key');
        if (patientKey) {
          this.store.setActiveReportKey(patientKey);
          const report = this.store.getActiveReport();
          this.showToast(`✓ Specimen loaded for ${report.patientName} (${report.category})`);
          this.startProcessingPipeline(`${patientKey}-clinical-panel.pdf`);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  initAssistantChat() {
    const chatInput = document.getElementById('chat-user-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessagesContainer = document.getElementById('chat-messages-container');

    if (!chatInput || !chatSendBtn || !chatMessagesContainer) return;

    const appendMessage = (sender, text) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = sender === 'user' ? 'chat-msg-user' : 'chat-msg-assistant';
      msgDiv.innerHTML = text;
      chatMessagesContainer.appendChild(msgDiv);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    };

    const handleUserQuery = (query) => {
      if (!query.trim()) return;
      chatMessagesContainer.dataset.customChat = 'true';
      appendMessage('user', query);
      chatInput.value = '';

      setTimeout(() => {
        const report = this.store.getActiveReport();
        const qLower = query.toLowerCase();
        let answer = '';

        // Guardrail compliance: No diagnosis, only explain report values
        if (qLower.includes('platelet') || qLower.includes('clot') || qLower.includes('bleeding')) {
          const plt = report.parameters.find(p => p.id === 'plt');
          answer = `Your <strong>Platelet count is ${plt ? plt.value : '48'} ×10³/µL</strong>, which is below the normal physiological reference range of 150–450 ×10³/µL. Several factors can cause reduced platelets, including immune clearance (ITP) or laboratory tube artifact (EDTA clumping). Your doctor can verify this using a sodium citrate repeat tube.`;
        } else if (qLower.includes('crp') || qLower.includes('inflammation')) {
          const crp = report.parameters.find(p => p.id === 'hscrp' || p.id === 'crp');
          answer = `Your <strong>hs-CRP reading is ${crp ? crp.value : '3.8'} mg/L</strong>, which exceeds the desirable < 1.0 mg/L threshold. This marker indicates low-grade vascular or systemic inflammation. Lifestyle measures like anti-inflammatory nutrition and aerobic exercise can help reduce it.`;
        } else if (qLower.includes('hemoglobin') || qLower.includes('hb') || qLower.includes('anaemia')) {
          const hb = report.parameters.find(p => p.id === 'hb');
          answer = `Your <strong>Hemoglobin is ${hb ? hb.value : '14.2'} g/dL</strong> (reference: ${hb ? hb.refLow + '–' + hb.refHigh : '13.5–17.5'} g/dL). This measures the oxygen-carrying capacity of your red blood cells.`;
        } else if (qLower.includes('sugar') || qLower.includes('glucose') || qLower.includes('diabetes')) {
          const fpg = report.parameters.find(p => p.id === 'fpg' || p.id === 'glucose');
          answer = `Your <strong>Fasting Blood Sugar is ${fpg ? fpg.value : '96'} mg/dL</strong> (reference: 70–99 mg/dL). Keeping post-meal physical activity consistent helps maintain stable glycemic control.`;
        } else {
          answer = `Based on your verified lab panel (Specimen <strong>${report.mrn}</strong>), you have <strong>${report.inRangeCount} of ${report.totalParameters} parameters in normal range</strong>. ${report.summary}`;
        }

        answer += `<div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 8px; border-top: 1px solid var(--border-light); padding-top: 6px;"><em>This summary is AI-generated from your report values. It does not replace advice from your doctor.</em></div>`;
        appendMessage('assistant', answer);
      }, 500);
    };

    chatSendBtn.addEventListener('click', () => handleUserQuery(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserQuery(chatInput.value);
    });
  }

  initTrackerInteractions() {
    const timepointBtns = document.querySelectorAll('.tracker-timepoint-btn');
    timepointBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timepointBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period');
        const statusEl = document.getElementById('tracker-active-period-label');
        if (statusEl) {
          statusEl.textContent = `Viewing Historical Snapshot: ${period}`;
        }
      });
    });

    const toggleTableBtn = document.getElementById('btn-toggle-accessible-table');
    const tableWrap = document.getElementById('accessible-data-table-wrap');
    if (toggleTableBtn && tableWrap) {
      toggleTableBtn.addEventListener('click', () => {
        const isHidden = tableWrap.style.display === 'none';
        tableWrap.style.display = isHidden ? 'block' : 'none';
        toggleTableBtn.textContent = isHidden ? '📊 Hide Accessible Data Table' : '📊 Show Accessible Data Table (WCAG AA)';
      });
    }
  }

  initTelehealth() {
    const micBtn = document.getElementById('telehealth-mic-btn');
    const camBtn = document.getElementById('telehealth-cam-btn');
    const hangupBtn = document.getElementById('telehealth-hangup-btn');
    const joinBtn = document.getElementById('telehealth-join-btn');

    if (micBtn) {
      let micActive = true;
      micBtn.addEventListener('click', () => {
        micActive = !micActive;
        micBtn.style.color = micActive ? '#E6EDF3' : '#C8324A';
        this.showToast(micActive ? 'Microphone unmuted' : 'Microphone muted');
      });
    }

    if (camBtn) {
      let camActive = true;
      camBtn.addEventListener('click', () => {
        camActive = !camActive;
        camBtn.style.color = camActive ? '#E6EDF3' : '#C8324A';
        this.showToast(camActive ? 'Clinical HD Camera enabled' : 'Clinical HD Camera disabled');
      });
    }

    if (hangupBtn) {
      hangupBtn.addEventListener('click', () => {
        this.showToast('Consultation session ended. Recording saved to encrypted HL7 vault.');
      });
    }

    if (joinBtn) {
      joinBtn.addEventListener('click', () => {
        this.showToast('Connecting to Secure Video Room 04 (Dr. Anita Sharma)...');
      });
    }

    const adoptBtn = document.getElementById('btn-adopt-protocol');
    if (adoptBtn) {
      adoptBtn.addEventListener('click', () => {
        this.showToast('✓ ASH 2024 Care Protocol adopted and logged in patient chart.');
      });
    }

    const sendRxBtn = document.getElementById('btn-transmit-rx');
    if (sendRxBtn) {
      sendRxBtn.addEventListener('click', () => {
        const rxModal = document.getElementById('rx-verify-modal');
        if (rxModal) {
          rxModal.classList.add('open');
        }
        this.showToast('✓ e-Prescription & Requisition transmitted! Scannable QR code generated.');
      });
    }
  }

  initQuestionsChecklist() {
    const copyBtn = document.getElementById('btn-copy-questions');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const report = this.store.getActiveReport();
        const questions = report.questionsForDoctor || [];

        navigator.clipboard.writeText(questions.join('\n\n')).then(() => {
          this.showToast(`✓ ${questions.length} Consultation Questions copied to clipboard! Ready to share with your doctor.`);
        }).catch(() => {
          this.showToast(`✓ ${questions.length} Questions prepared for doctor consult!`);
        });
      });
    }
  }

  initHUD() {
    const trigger = document.getElementById('hud-trigger-btn');
    const panel = document.getElementById('hud-panel');
    const speedSlider = document.getElementById('hud-speed-slider');
    const scrollSlider = document.getElementById('hud-scroll-slider');
    const pauseBtn = document.getElementById('hud-pause-btn');

    if (trigger && panel) {
      trigger.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
    }

    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.engine.setSpeed(val);
        const disp = document.getElementById('hud-speed-val');
        if (disp) disp.textContent = `${val.toFixed(2)}x`;
      });
    }

    if (scrollSlider) {
      scrollSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.engine.setScrollSensitivity(val);
        const disp = document.getElementById('hud-scroll-val');
        if (disp) disp.textContent = `${val.toFixed(2)}`;
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        const isPaused = this.engine.togglePause();
        pauseBtn.textContent = isPaused ? '▶ Resume Rotation' : '⏸ Pause Rotation';
      });
    }
  }

  // ==========================================================================
  // PATIENT PROFILE & AUTHENTICATION PORTAL INTEGRATION
  // ==========================================================================

  // Synchronize Navbar with current active patient profile and auth state
  syncNavbarPatientProfile() {
    const profile = this.store.getPatientProfile();
    if (!profile) return;

    const navLink = document.getElementById('nav-patient-profile-link');
    const avatarBox = document.getElementById('nav-patient-avatar-box');
    const nameDisplay = document.getElementById('nav-patient-name-display');
    const authText = document.getElementById('nav-auth-text');

    if (avatarBox) {
      const parts = (profile.name || 'Alex Morgan').trim().split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      avatarBox.textContent = initials;
    }

    if (nameDisplay) {
      nameDisplay.textContent = profile.name || 'Alex Morgan';
    }

    if (authText) {
      authText.textContent = (this.store.authUser && this.store.authUser.isLoggedIn) ? 'Switch' : 'Sign In';
    }
  }

  // Patient Profile & Health Dossier Workspace Logic
  initProfilePage() {
    const profileForm = document.getElementById('patient-profile-form');
    if (!profileForm) return;

    // 1. Tab Navigation
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.profile-panel-block').forEach(panel => {
          panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(`tab-panel-${targetTab}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });

    // 2. Live Interactive BMI Calculator
    const heightInput = document.getElementById('input-vital-height');
    const weightInput = document.getElementById('input-vital-weight');

    const updateLiveBMI = () => {
      const hCm = parseFloat(heightInput ? heightInput.value : 0);
      const wKg = parseFloat(weightInput ? weightInput.value : 0);

      const bmiValEl = document.getElementById('calc-bmi-val');
      const bmiStatusEl = document.getElementById('calc-bmi-status');
      const healthyRangeEl = document.getElementById('calc-healthy-weight');

      if (hCm > 50 && wKg > 10 && bmiValEl) {
        const hM = hCm / 100;
        const bmi = (wKg / (hM * hM)).toFixed(1);
        bmiValEl.textContent = bmi;

        if (bmiStatusEl) {
          bmiStatusEl.className = 'bmi-badge-pill';
          if (bmi < 18.5) {
            bmiStatusEl.textContent = 'Underweight';
            bmiStatusEl.classList.add('bmi-overweight');
          } else if (bmi <= 24.9) {
            bmiStatusEl.textContent = 'Optimal / Normal';
            bmiStatusEl.classList.add('bmi-optimal');
          } else if (bmi <= 29.9) {
            bmiStatusEl.textContent = 'Overweight';
            bmiStatusEl.classList.add('bmi-overweight');
          } else {
            bmiStatusEl.textContent = 'Obesity Class';
            bmiStatusEl.classList.add('bmi-obese');
          }
        }

        if (healthyRangeEl) {
          const minW = (18.5 * hM * hM).toFixed(1);
          const maxW = (24.9 * hM * hM).toFixed(1);
          healthyRangeEl.textContent = `${minW} – ${maxW}`;
        }
      }
    };

    if (heightInput) heightInput.addEventListener('input', updateLiveBMI);
    if (weightInput) weightInput.addEventListener('input', updateLiveBMI);

    // 3. Add Custom Condition Chip
    const addCondBtn = document.getElementById('btn-add-condition');
    const condInput = document.getElementById('input-custom-condition');
    if (addCondBtn && condInput) {
      addCondBtn.addEventListener('click', () => {
        const val = condInput.value.trim();
        if (val) {
          if (!this.workingConditions) this.workingConditions = new Set();
          this.workingConditions.add(val);
          condInput.value = '';
          this.renderConditionsCloud();
          this.showToast(`✓ Added diagnosis: ${val}`);
        }
      });
      condInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addCondBtn.click();
        }
      });
    }

    // 4. Dynamic Row Adders (Surgeries, Allergies, Medications, Supplements)
    const addSurgBtn = document.getElementById('btn-add-surgery-row');
    if (addSurgBtn) {
      addSurgBtn.addEventListener('click', () => this.addSurgery());
    }

    const addAlgBtn = document.getElementById('btn-add-allergy-row');
    if (addAlgBtn) {
      addAlgBtn.addEventListener('click', () => this.addAllergy());
    }

    const addMedBtn = document.getElementById('btn-add-med-row');
    if (addMedBtn) {
      addMedBtn.addEventListener('click', () => this.addMedication());
    }

    const addSuppBtn = document.getElementById('btn-add-supp-row');
    if (addSuppBtn) {
      addSuppBtn.addEventListener('click', () => this.addSupplement());
    }

    // 5. Form Submission & Save
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfileFromForm();
    });

    const heroSaveBtn = document.getElementById('hero-save-btn');
    if (heroSaveBtn) {
      heroSaveBtn.addEventListener('click', () => {
        this.saveProfileFromForm();
      });
    }

    // 6. Reset to Baseline Defaults
    const resetBtn = document.getElementById('btn-reset-defaults');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all fields for this patient to clinical baseline defaults?')) {
          const activeKey = this.store.activeReportKey || 'alex';
          const defaultProfile = DEFAULT_PATIENT_PROFILES[activeKey] || DEFAULT_PATIENT_PROFILES['alex'];
          this.store.savePatientProfile(defaultProfile, activeKey);
          this.populateProfileForm();
          this.showToast('✓ Patient profile reset to baseline defaults.');
        }
      });
    }

    // 7. Export Health Dossier as JSON
    const exportBtn = document.getElementById('hero-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportDossierJSON());
    }

    // Populate initially
    this.populateProfileForm();
  }

  populateProfileForm() {
    const profile = this.store.getPatientProfile();
    if (!profile) return;

    // Working copies of dynamic lists
    this.workingSurgeries = JSON.parse(JSON.stringify(profile.surgeries || []));
    this.workingAllergies = JSON.parse(JSON.stringify(profile.allergies || []));
    this.workingMedications = JSON.parse(JSON.stringify(profile.medications || []));
    this.workingSupplements = JSON.parse(JSON.stringify(profile.supplements || []));
    this.workingConditions = new Set(profile.medicalConditions || []);

    // Update Hero Card Elements
    const heroName = document.getElementById('hero-display-name');
    if (heroName) heroName.textContent = profile.name || 'Alex Morgan';

    const heroAvatarInitials = document.getElementById('profile-avatar-initials');
    if (heroAvatarInitials) {
      const parts = (profile.name || 'Alex Morgan').trim().split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      heroAvatarInitials.textContent = initials;
    }

    const heroBlood = document.getElementById('hero-blood-group');
    if (heroBlood) heroBlood.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">bloodtype</span><span>Blood: ${profile.bloodGroup || 'O+'}</span>`;

    const heroAbha = document.getElementById('hero-abha-id');
    if (heroAbha) heroAbha.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">badge</span><span>ABHA: ${profile.abhaId || '91-8842-1092-4410'}</span>`;

    const heroMrn = document.getElementById('hero-mrn-id');
    if (heroMrn) heroMrn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">medical_information</span><span>MRN: ${profile.id || '#892-4410-X'}</span>`;

    const heroAgeGender = document.getElementById('hero-age-gender');
    if (heroAgeGender) heroAgeGender.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">person</span><span>${profile.age || 42} Yrs • ${profile.gender || 'Male'}</span>`;

    // Populate Diagnostic Dashboard Overview on Profile Page
    const activeReport = this.store.getActiveReport();
    if (activeReport) {
      const dashCategory = document.getElementById('prof-dash-category');
      if (dashCategory) dashCategory.textContent = activeReport.category || 'Diagnostic Blood Panel';

      const dashLab = document.getElementById('prof-dash-lab');
      if (dashLab) dashLab.textContent = `${activeReport.labName || 'Apollo / Quest Diagnostics'} • Specimen Date: ${activeReport.collectionDate || 'Recent'}`;

      const dashTotal = document.getElementById('prof-dash-total');
      if (dashTotal) dashTotal.textContent = activeReport.totalParameters || 18;

      const dashInRange = document.getElementById('prof-dash-in-range');
      if (dashInRange) dashInRange.textContent = activeReport.inRangeCount || 13;

      const dashPct = document.getElementById('prof-dash-pct');
      if (dashPct && activeReport.totalParameters) {
        const pct = Math.round((activeReport.inRangeCount / activeReport.totalParameters) * 100);
        dashPct.textContent = `${pct}% Optimal`;
      }

      const dashFlagged = document.getElementById('prof-dash-flagged');
      if (dashFlagged) dashFlagged.textContent = activeReport.flaggedCount || 0;

      const dashAlertTag = document.getElementById('prof-dash-alert-tag');
      if (dashAlertTag) {
        if (activeReport.hasCritical) {
          dashAlertTag.textContent = 'Critical Follow-up Required';
          dashAlertTag.className = 'kpi-tag kpi-flagged';
        } else if (activeReport.flaggedCount > 0) {
          dashAlertTag.textContent = 'Attention Advised';
          dashAlertTag.className = 'kpi-tag kpi-flagged';
        } else {
          dashAlertTag.textContent = 'Optimal Physiological Health';
          dashAlertTag.className = 'kpi-tag kpi-optimal';
        }
      }

      // Populate preview biomarker chips
      const strip = document.getElementById('prof-dash-biomarkers-strip');
      if (strip && activeReport.parameters) {
        const previewParams = activeReport.parameters.slice(0, 5);
        strip.innerHTML = previewParams.map(p => {
          let badgeColor = '#1E7E4E';
          let badgeBg = '#EAF6EE';
          if (p.status === 'critical') {
            badgeColor = '#C4360F';
            badgeBg = '#FCF1EC';
          } else if (p.status === 'warning') {
            badgeColor = '#B7811A';
            badgeBg = '#FCF6E8';
          }
          return `
            <div class="dash-biomarker-chip">
              <span style="color: var(--text-secondary); font-weight: 600;">${p.name.split(' ')[0]}</span>
              <strong>${p.value} ${p.unit}</strong>
              <span style="font-size: 0.68rem; font-weight: 700; padding: 1px 6px; border-radius: 9999px; background: ${badgeBg}; color: ${badgeColor};">
                ${p.status.toUpperCase()}
              </span>
            </div>
          `;
        }).join('');
      }
    }

    // Populate Tab 1: Personal & Contact
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.value = val;
    };

    setVal('input-full-name', profile.name);
    setVal('input-dob', profile.dob);
    setVal('input-age', profile.age);
    setVal('select-gender', profile.gender || 'Male');
    setVal('select-blood-group', profile.bloodGroup || 'O+');
    setVal('input-abha-id', profile.abhaId);
    setVal('input-phone', profile.phone);
    setVal('input-email', profile.email);
    setVal('input-address', profile.address);
    setVal('input-city', profile.city);
    setVal('input-state', profile.state);
    setVal('input-pincode', profile.pincode);
    setVal('input-emergency-name', profile.emergencyContactName);
    setVal('input-emergency-relation', profile.emergencyContactRelation);
    setVal('input-emergency-phone', profile.emergencyContactPhone);
    setVal('input-insurance-provider', profile.insuranceProvider);
    setVal('input-insurance-policy', profile.insurancePolicyNo);
    setVal('input-primary-physician', profile.primaryPhysician);

    // Populate Tab 2: Clinical
    this.renderConditionsCloud();
    this.renderSurgeriesList();
    this.renderAllergiesList();
    setVal('textarea-family-history', (profile.familyHistory || []).join('\n'));

    // Populate Tab 3: Medications
    this.renderMedicationsList();
    this.renderSupplementsList();

    // Populate Tab 4: Vitals
    const vitals = profile.vitals || {};
    setVal('input-vital-height', vitals.heightCm || 178);
    setVal('input-vital-weight', vitals.weightKg || 77);
    setVal('input-bp-systolic', vitals.bpSystolic || 120);
    setVal('input-bp-diastolic', vitals.bpDiastolic || 80);
    setVal('input-heart-rate', vitals.heartRate || 72);
    setVal('input-spo2', vitals.spo2 || 99);
    setVal('input-fasting-glucose', vitals.fastingGlucose || 96);

    // Calculate BMI immediately
    const heightEl = document.getElementById('input-vital-height');
    if (heightEl) heightEl.dispatchEvent(new Event('input'));

    // Populate Tab 5: Lifestyle
    const lifestyle = profile.lifestyle || {};
    setVal('select-smoking', lifestyle.smoking || 'Non-smoker (Never)');
    setVal('select-alcohol', lifestyle.alcohol || 'Occasional social (1-2 units/week)');
    setVal('select-exercise', lifestyle.exercise || 'Moderate 3-4 sessions/week (Cardio + weights)');
    setVal('select-diet', lifestyle.diet || 'Balanced Mediterranean / low refined carbs');
    setVal('select-sleep', lifestyle.sleepHours || '7.5 hours/night');
    setVal('textarea-clinical-notes', profile.notes || '');

    // Footer timestamp
    const tsEl = document.getElementById('save-status-timestamp');
    if (tsEl) {
      const dateStr = profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:45 AM';
      tsEl.textContent = `Last saved: Today at ${dateStr}`;
    }
  }

  renderConditionsCloud() {
    const cloud = document.getElementById('conditions-tag-cloud');
    if (!cloud) return;

    const standardConditions = [
      'Cardiovascular Risk (Elevated hs-CRP)',
      'Dyslipidemia / Elevated Chol:HDL Ratio',
      'Borderline Fasting Glycemia',
      'Vitamin D Insufficiency',
      'Hypertension',
      'Type 2 Diabetes',
      'Microcytic RBC Indices (MCV 72 fL)',
      'Severe Isolated Thrombocytopenia (PLT 48k)',
      'Suspected Immune Thrombocytopenic Purpura (ITP)',
      'Early Depleted Iron Stores',
      'Iron Deficiency Anemia',
      'Asthma / Bronchial Hyperactivity',
      'Fatty Liver (Elevated ALT)',
      'Hashimoto Thyroiditis'
    ];

    const allConditions = Array.from(new Set([...standardConditions, ...(this.workingConditions || [])]));
    cloud.innerHTML = '';

    allConditions.forEach(cond => {
      const isSelected = this.workingConditions && this.workingConditions.has(cond);
      const chip = document.createElement('div');
      chip.className = `interactive-tag-chip ${isSelected ? 'selected' : ''}`;
      chip.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 15px;">${isSelected ? 'check_circle' : 'add_circle'}</span>
        <span>${cond}</span>
      `;
      chip.addEventListener('click', () => {
        if (!this.workingConditions) this.workingConditions = new Set();
        if (this.workingConditions.has(cond)) {
          this.workingConditions.delete(cond);
          chip.classList.remove('selected');
          chip.querySelector('.material-symbols-outlined').textContent = 'add_circle';
        } else {
          this.workingConditions.add(cond);
          chip.classList.add('selected');
          chip.querySelector('.material-symbols-outlined').textContent = 'check_circle';
        }
      });
      cloud.appendChild(chip);
    });
  }

  renderSurgeriesList() {
    const container = document.getElementById('surgeries-list-container');
    if (!container) return;

    if (!this.workingSurgeries || this.workingSurgeries.length === 0) {
      container.innerHTML = `<div style="padding: 1.25rem; color: var(--text-muted); font-size: 0.88rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">No surgeries or major hospitalizations recorded. Click "Add Surgery" to log past procedures.</div>`;
      return;
    }

    container.innerHTML = this.workingSurgeries.map((surg, idx) => `
      <div class="dynamic-item-row">
        <div class="dynamic-item-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong class="dynamic-item-title">${surg.name}</strong>
            <span class="meta-pill-chip" style="background: rgba(29, 78, 137, 0.08); color: var(--primary); font-size: 0.72rem; padding: 2px 8px;">Year: ${surg.year || 'N/A'}</span>
          </div>
          <span class="dynamic-item-sub">${surg.hospital || 'Hospital unspecified'}${surg.notes ? ' • ' + surg.notes : ''}</span>
        </div>
        <button type="button" class="btn-remove-item" title="Remove surgery entry" data-surgery-idx="${idx}">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-surgery-idx'));
        this.removeSurgery(idx);
      });
    });
  }

  addSurgery() {
    const name = prompt('Enter surgery / hospitalization procedure name:', 'Diagnostic Endoscopy');
    if (!name || !name.trim()) return;

    const year = prompt('Year of procedure:', '2023') || '2023';
    const hospital = prompt('Hospital / Medical Center:', 'Max Super Speciality Hospital') || 'General Hospital';
    const notes = prompt('Recovery notes or outcomes:', 'Uncomplicated recovery, normal findings') || '';

    if (!this.workingSurgeries) this.workingSurgeries = [];
    this.workingSurgeries.push({ name: name.trim(), year: year.trim(), hospital: hospital.trim(), notes: notes.trim() });
    this.renderSurgeriesList();
    this.showToast(`✓ Surgery logged: ${name}`);
  }

  removeSurgery(idx) {
    if (this.workingSurgeries && this.workingSurgeries[idx]) {
      const removed = this.workingSurgeries.splice(idx, 1);
      this.renderSurgeriesList();
      this.showToast(`Removed surgery: ${removed[0].name}`);
    }
  }

  renderAllergiesList() {
    const container = document.getElementById('allergies-list-container');
    if (!container) return;

    if (!this.workingAllergies || this.workingAllergies.length === 0) {
      container.innerHTML = `<div style="padding: 1.25rem; color: var(--text-muted); font-size: 0.88rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">No known allergies or adverse reactions on file. Click "Add Allergy" to document drug/food sensitivities.</div>`;
      return;
    }

    container.innerHTML = this.workingAllergies.map((alg, idx) => `
      <div class="dynamic-item-row">
        <div class="dynamic-item-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong class="dynamic-item-title">${alg.allergen}</strong>
            <span class="meta-pill-chip" style="background: rgba(196, 54, 15, 0.12); color: #C4360F; font-size: 0.72rem; padding: 2px 8px;">${alg.severity || 'Moderate'} Severity</span>
          </div>
          <span class="dynamic-item-sub">Reaction: ${alg.reaction || 'Adverse cutaneous or systemic response'}</span>
        </div>
        <button type="button" class="btn-remove-item" title="Remove allergy" data-allergy-idx="${idx}">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-allergy-idx'));
        this.removeAllergy(idx);
      });
    });
  }

  addAllergy() {
    const allergen = prompt('Enter allergen substance or medication name:', 'Penicillin / Amoxicillin');
    if (!allergen || !allergen.trim()) return;

    const severity = prompt('Severity rating (Mild, Moderate, Severe, Anaphylaxis):', 'Severe') || 'Moderate';
    const reaction = prompt('Clinical symptoms or reaction:', 'Acute rash, facial swelling, urticaria') || 'Adverse reaction';

    if (!this.workingAllergies) this.workingAllergies = [];
    this.workingAllergies.push({ allergen: allergen.trim(), severity: severity.trim(), reaction: reaction.trim() });
    this.renderAllergiesList();
    this.showToast(`✓ Allergy documented: ${allergen}`);
  }

  removeAllergy(idx) {
    if (this.workingAllergies && this.workingAllergies[idx]) {
      const removed = this.workingAllergies.splice(idx, 1);
      this.renderAllergiesList();
      this.showToast(`Removed allergy: ${removed[0].allergen}`);
    }
  }

  renderMedicationsList() {
    const container = document.getElementById('medications-list-container');
    if (!container) return;

    if (!this.workingMedications || this.workingMedications.length === 0) {
      container.innerHTML = `<div style="padding: 1.25rem; color: var(--text-muted); font-size: 0.88rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">No active prescription medications recorded. Click "Add Medication" to log current regimens.</div>`;
      return;
    }

    container.innerHTML = this.workingMedications.map((med, idx) => `
      <div class="dynamic-item-row">
        <div class="dynamic-item-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong class="dynamic-item-title">${med.name}</strong>
            <span class="meta-pill-chip meta-pill-abha" style="font-size: 0.72rem; padding: 2px 8px;">${med.dosage || 'Standard Dose'}</span>
          </div>
          <span class="dynamic-item-sub">Schedule: ${med.frequency || 'Once daily'} • Indication: ${med.reason || 'General health'}</span>
        </div>
        <button type="button" class="btn-remove-item" title="Remove medication" data-med-idx="${idx}">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-med-idx'));
        this.removeMedication(idx);
      });
    });
  }

  addMedication() {
    const name = prompt('Enter prescription drug name:', 'Atorvastatin');
    if (!name || !name.trim()) return;

    const dosage = prompt('Dosage strength (e.g. 10 mg or 500 mg):', '10 mg') || '10 mg';
    const frequency = prompt('Administration schedule:', 'Once daily at bedtime') || 'Once daily';
    const reason = prompt('Clinical reason / indication:', 'Lipid control / hs-CRP risk reduction') || 'Clinical indication';

    if (!this.workingMedications) this.workingMedications = [];
    this.workingMedications.push({ name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim(), reason: reason.trim() });
    this.renderMedicationsList();
    this.showToast(`✓ Prescribed medication added: ${name}`);
  }

  removeMedication(idx) {
    if (this.workingMedications && this.workingMedications[idx]) {
      const removed = this.workingMedications.splice(idx, 1);
      this.renderMedicationsList();
      this.showToast(`Removed medication: ${removed[0].name}`);
    }
  }

  renderSupplementsList() {
    const container = document.getElementById('supplements-list-container');
    if (!container) return;

    if (!this.workingSupplements || this.workingSupplements.length === 0) {
      container.innerHTML = `<div style="padding: 1.25rem; color: var(--text-muted); font-size: 0.88rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">No nutritional supplements recorded. Click "Add Supplement" to add vitamins, iron, or fish oil.</div>`;
      return;
    }

    container.innerHTML = this.workingSupplements.map((sup, idx) => `
      <div class="dynamic-item-row">
        <div class="dynamic-item-info">
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong class="dynamic-item-title">${sup.name}</strong>
            <span class="meta-pill-chip meta-pill-mrn" style="font-size: 0.72rem; padding: 2px 8px;">${sup.dosage || 'Daily Dose'}</span>
          </div>
          <span class="dynamic-item-sub">Schedule: ${sup.frequency || 'Daily with meal'}</span>
        </div>
        <button type="button" class="btn-remove-item" title="Remove supplement" data-supp-idx="${idx}">
          <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-supp-idx'));
        this.removeSupplement(idx);
      });
    });
  }

  addSupplement() {
    const name = prompt('Enter supplement or vitamin name:', 'Vitamin D3 (Cholecalciferol)');
    if (!name || !name.trim()) return;

    const dosage = prompt('Dosage strength (e.g. 2,000 IU or 1,000 mg):', '2,000 IU') || '2,000 IU';
    const frequency = prompt('Daily frequency:', 'Daily with meal') || 'Daily';

    if (!this.workingSupplements) this.workingSupplements = [];
    this.workingSupplements.push({ name: name.trim(), dosage: dosage.trim(), frequency: frequency.trim() });
    this.renderSupplementsList();
    this.showToast(`✓ Nutritional supplement logged: ${name}`);
  }

  removeSupplement(idx) {
    if (this.workingSupplements && this.workingSupplements[idx]) {
      const removed = this.workingSupplements.splice(idx, 1);
      this.renderSupplementsList();
      this.showToast(`Removed supplement: ${removed[0].name}`);
    }
  }

  saveProfileFromForm() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const name = getVal('input-full-name') || 'Alex Morgan';
    const dob = getVal('input-dob');
    const age = getVal('input-age') || '42';
    const gender = getVal('select-gender') || 'Male';
    const bloodGroup = getVal('select-blood-group') || 'O+';
    const abhaId = getVal('input-abha-id') || '91-8842-1092-4410';
    const phone = getVal('input-phone');
    const email = getVal('input-email');
    const address = getVal('input-address');
    const city = getVal('input-city');
    const state = getVal('input-state');
    const pincode = getVal('input-pincode');
    const emergencyContactName = getVal('input-emergency-name');
    const emergencyContactRelation = getVal('input-emergency-relation');
    const emergencyContactPhone = getVal('input-emergency-phone');
    const insuranceProvider = getVal('input-insurance-provider');
    const insurancePolicyNo = getVal('input-insurance-policy');
    const primaryPhysician = getVal('input-primary-physician');

    const familyHistory = (document.getElementById('textarea-family-history') ? document.getElementById('textarea-family-history').value : '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const heightCm = parseFloat(getVal('input-vital-height')) || 178;
    const weightKg = parseFloat(getVal('input-vital-weight')) || 77;
    const bmi = document.getElementById('calc-bmi-val') ? document.getElementById('calc-bmi-val').textContent : '24.3';
    const bpSystolic = parseInt(getVal('input-bp-systolic')) || 120;
    const bpDiastolic = parseInt(getVal('input-bp-diastolic')) || 80;
    const heartRate = parseInt(getVal('input-heart-rate')) || 72;
    const spo2 = parseInt(getVal('input-spo2')) || 99;
    const fastingGlucose = parseInt(getVal('input-fasting-glucose')) || 96;

    const smoking = getVal('select-smoking') || 'Non-smoker (Never)';
    const alcohol = getVal('select-alcohol') || 'Occasional social (1-2 units/week)';
    const exercise = getVal('select-exercise') || 'Moderate 3-4 sessions/week (Cardio + weights)';
    const diet = getVal('select-diet') || 'Balanced Mediterranean / low refined carbs';
    const sleepHours = getVal('select-sleep') || '7.5 hours/night';
    const notes = getVal('textarea-clinical-notes') || '';

    const payload = {
      name,
      dob,
      age,
      gender,
      bloodGroup,
      abhaId,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      emergencyContactName,
      emergencyContactRelation,
      emergencyContactPhone,
      insuranceProvider,
      insurancePolicyNo,
      primaryPhysician,
      medicalConditions: Array.from(this.workingConditions || []),
      surgeries: this.workingSurgeries || [],
      allergies: this.workingAllergies || [],
      medications: this.workingMedications || [],
      supplements: this.workingSupplements || [],
      familyHistory,
      vitals: {
        heightCm,
        weightKg,
        bmi,
        bpSystolic,
        bpDiastolic,
        heartRate,
        spo2,
        fastingGlucose
      },
      lifestyle: {
        smoking,
        alcohol,
        exercise,
        diet,
        sleepHours
      },
      notes
    };

    const updated = this.store.savePatientProfile(payload);

    // Update Hero Card & Display
    const heroName = document.getElementById('hero-display-name');
    if (heroName) heroName.textContent = updated.name;

    const heroBlood = document.getElementById('hero-blood-group');
    if (heroBlood) heroBlood.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">bloodtype</span><span>Blood: ${updated.bloodGroup}</span>`;

    const heroAbha = document.getElementById('hero-abha-id');
    if (heroAbha) heroAbha.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">badge</span><span>ABHA: ${updated.abhaId}</span>`;

    const heroAgeGender = document.getElementById('hero-age-gender');
    if (heroAgeGender) heroAgeGender.innerHTML = `<span class="material-symbols-outlined" style="font-size: 14px;">person</span><span>${updated.age} Yrs • ${updated.gender}</span>`;

    const tsEl = document.getElementById('save-status-timestamp');
    if (tsEl) {
      tsEl.textContent = `Last saved: Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    this.syncNavbarPatientProfile();
    this.showToast(`✓ Patient profile for ${updated.name} saved securely to Local Vault!`);
  }

  exportDossierJSON() {
    const profile = this.store.getPatientProfile();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName = (profile.name || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `report_saathi_health_dossier_${safeName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('✓ Health dossier exported as encrypted JSON format.');
  }

  // Patient Login & Authentication Portal
  initLoginPage() {
    const signinForm = document.getElementById('form-patient-signin');
    const registerForm = document.getElementById('form-patient-register');
    if (!signinForm && !registerForm) return;

    // 1. Tab Switcher
    const signinTab = document.getElementById('tab-btn-signin');
    const registerTab = document.getElementById('tab-btn-register');

    if (signinTab && registerTab) {
      signinTab.addEventListener('click', () => {
        signinTab.classList.add('active');
        registerTab.classList.remove('active');
        if (signinForm) signinForm.style.display = 'flex';
        if (registerForm) registerForm.style.display = 'none';
      });

      registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        signinTab.classList.remove('active');
        if (signinForm) signinForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'flex';
      });
    }

    // 2. Toggle Password Visibility
    const togglePassBtn = document.getElementById('btn-toggle-pass-visibility');
    const passInput = document.getElementById('input-signin-pass');
    const passIcon = document.getElementById('icon-pass-eye');
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        if (passIcon) passIcon.textContent = isPass ? 'visibility_off' : 'visibility';
      });
    }

    // 3. Sign In Submission
    if (signinForm) {
      signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = (document.getElementById('input-signin-id')?.value || '').trim().toLowerCase();
        const passVal = document.getElementById('input-signin-pass')?.value || '';

        // Match against known demo patients or custom patient keys
        let targetKey = 'alex';
        if (idVal.includes('sarah') || idVal.includes('4491')) {
          targetKey = 'sarah';
        } else if (idVal.includes('priya') || idVal.includes('2511')) {
          targetKey = 'priya';
        } else if (idVal.includes('ramesh') || idVal.includes('551')) {
          targetKey = 'ramesh';
        } else if (idVal.includes('david') || idVal.includes('710')) {
          targetKey = 'david';
        } else if (this.store.patientProfiles && this.store.patientProfiles[idVal]) {
          targetKey = idVal;
        }

        const authUser = this.store.loginUser(idVal, passVal, targetKey);
        this.showToast(`✓ Welcome back, ${authUser.name}! Accessing your Health Dossier...`);

        setTimeout(() => {
          window.location.href = '/profile.html';
        }, 500);
      });
    }

    // 4. Registration Submission
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('input-reg-name')?.value || '').trim();
        const email = (document.getElementById('input-reg-email')?.value || '').trim();
        const phone = (document.getElementById('input-reg-phone')?.value || '').trim();
        const dob = document.getElementById('input-reg-dob')?.value || '1995-01-01';
        const gender = document.getElementById('select-reg-gender')?.value || 'Other';
        const bloodGroup = document.getElementById('select-reg-blood')?.value || 'O+';

        // Calculate age from DOB
        const birthYear = new Date(dob).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = String(Math.max(1, currentYear - birthYear));

        const newProfile = this.store.registerUser({
          name,
          email,
          phone,
          dob,
          age,
          gender,
          bloodGroup
        });

        this.showToast(`✓ Patient Account created for ${newProfile.name}! Initializing health vault...`);

        setTimeout(() => {
          window.location.href = '/profile.html';
        }, 500);
      });
    }

    // 5. Demo Patient Quick 1-Click Login Chips
    const demoChips = document.querySelectorAll('.btn-demo-account-chip');
    demoChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const patientKey = chip.getAttribute('data-patient') || 'alex';
        const authUser = this.store.loginUser(null, null, patientKey);
        this.showToast(`✓ Loaded demo patient: ${authUser.name}`);

        setTimeout(() => {
          window.location.href = '/profile.html';
        }, 350);
      });
    });
  }
}

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ReportSaathiApp();
});
