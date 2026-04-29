/**
 * CYL UI Module
 * Contains state management, DOM cache, and UI functions
 */

// ==========================================
// STATE VARIABLES
// ==========================================
export const state = {
    isMeasuredVisible: false,
    selectedEye: null,
    cachedBiomData: null,
    rawApiResponse: null,
    isLoadingBiomPin: false,
    activeTab: 'fileupload',
    selectedFile: null,
    isUploadingFile: false,
    currentBiomPin: null,
    jsonViewMode: false
};

// ==========================================
// DOM ELEMENTS CACHE
// ==========================================
export const els = {
    // Anterior Keratometry Inputs
    kFlat: document.getElementById('kFlat'),
    kSteep: document.getElementById('kSteep'),
    axisFlat: document.getElementById('axisFlat'),
    axisSteep: document.getElementById('axisSteep'),

    // Posterior Keratometry Inputs
    pkFlat: document.getElementById('pkFlat'),
    pkSteep: document.getElementById('pkSteep'),
    pAxisFlat: document.getElementById('pAxisFlat'),
    pAxisSteep: document.getElementById('pAxisSteep'),

    // Anterior Output Display
    dispK1: document.getElementById('dispK1'),
    dispK1Axis: document.getElementById('dispK1Axis'),
    dispK2: document.getElementById('dispK2'),
    dispK2Axis: document.getElementById('dispK2Axis'),
    resMeasMag: document.getElementById('resMeasMag'),
    resMeasAxis: document.getElementById('resMeasAxis'),

    // AK Regression Output
    resAkMag: document.getElementById('resAkMag'),
    resAkAxis: document.getElementById('resAkAxis'),

    // SO (Savini Optimized) Output
    resSoMag: document.getElementById('resSoMag'),
    resSoAxis: document.getElementById('resSoAxis'),

    // Posterior Output Display
    pkValuesRow: document.getElementById('pkValuesRow'),
    dispPk1: document.getElementById('dispPk1'),
    dispPk1Axis: document.getElementById('dispPk1Axis'),
    dispPk2: document.getElementById('dispPk2'),
    dispPk2Axis: document.getElementById('dispPk2Axis'),

    // Total Keratometry Output
    tkValuesRow: document.getElementById('tkValuesRow'),
    resTk1: document.getElementById('resTk1'),
    resTk1Axis: document.getElementById('resTk1Axis'),
    resTk2: document.getElementById('resTk2'),
    resTk2Axis: document.getElementById('resTk2Axis'),
    deltaTkLabel: document.getElementById('deltaTkLabel'),
    resTkNetMag: document.getElementById('resTkNetMag'),
    resTkNetAxis: document.getElementById('resTkNetAxis'),
    deltaTkSpacer: document.getElementById('deltaTkSpacer'),
    deltaTkLegend: document.getElementById('deltaTkLegend'),

    // UI Elements
    posteriorInputs: document.getElementById('posteriorInputs'),
    addMeasuredContainer: document.getElementById('addMeasuredContainer'),
    axisTypeBadge: document.getElementById('axisTypeBadge'),
    analysisSection: document.getElementById('analysisSection'),
    analysisHr: document.getElementById('analysisHr'),

    // Patient Data Elements
    patientName: document.getElementById('patientName'),
    patientId: document.getElementById('patientId'),
    eyeRight: document.getElementById('eyeRight'),
    eyeLeft: document.getElementById('eyeLeft'),

    // BiomPIN Elements
    biomPinInput: document.getElementById('biomPinInput'),
    loadBiomPinBtn: document.getElementById('loadBiomPinBtn'),
    loadBtnText: document.getElementById('loadBtnText'),
    loadBtnSpinner: document.getElementById('loadBtnSpinner'),
    biomPinMessage: document.getElementById('biomPinMessage'),

    // Tab elements
    tabBiomPin: document.getElementById('tabBiomPin'),
    tabFileUpload: document.getElementById('tabFileUpload'),
    panelBiomPin: document.getElementById('panelBiomPin'),
    panelFileUpload: document.getElementById('panelFileUpload'),

    // File upload elements
    biometryFileInput: document.getElementById('biometryFileInput'),
    filePickerLabel: document.getElementById('filePickerLabel'),
    filePickerBox: document.getElementById('filePickerBox'),
    filePickerSpinner: document.getElementById('filePickerSpinner'),
    filePickerText: document.getElementById('filePickerText'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),

    // BiomAPI link elements
    biomApiLinkContainer: document.getElementById('biomApiLinkContainer'),
    biomApiLink: document.getElementById('biomApiLink'),

    // History elements
    historySection: document.getElementById('historySection'),
    historySearch: document.getElementById('historySearch'),
    historyList: document.getElementById('historyList'),

    // Print Elements
    printHeader: document.getElementById('printHeader'),
    printPatientName: document.getElementById('printPatientName'),
    printPatientId: document.getElementById('printPatientId'),
    printSelectedEye: document.getElementById('printSelectedEye'),
    printEyeContainer: document.getElementById('printEyeContainer'),
    printDate: document.getElementById('printDate'),
    printButtonContainer: document.getElementById('printButtonContainer'),

    // JSON View Elements
    jsonViewSection: document.getElementById('jsonViewSection'),
    jsonViewPre: document.getElementById('jsonViewPre'),
    jsonViewToggle: document.getElementById('jsonViewToggle'),
    jsonCopyBtn: document.getElementById('jsonCopyBtn'),
    jsonCopyBtnText: document.getElementById('jsonCopyBtnText')
};

// ==========================================
// UI LOGIC FUNCTIONS
// ==========================================

// Import calculate from calculations.js - circular dependency handled by ES6 modules
import { calculate } from './calculations.js';

export function toggleMeasured() {
    state.isMeasuredVisible = true;
    els.posteriorInputs.classList.remove('hidden');
    els.addMeasuredContainer.classList.add('hidden');
    calculate();
}

export function resetAndHidePK() {
    state.isMeasuredVisible = false;
    els.pkFlat.value = "";
    els.pkSteep.value = "";
    els.pAxisFlat.value = "";
    els.pAxisSteep.value = "";

    els.posteriorInputs.classList.add('hidden');
    els.addMeasuredContainer.classList.remove('hidden');

    // Hide TK and PK display rows
    els.tkValuesRow.classList.add('hidden');
    els.pkValuesRow.classList.add('hidden');
    // Hide delta TK grid elements
    els.deltaTkLabel.classList.add('hidden');
    els.resTkNetMag.classList.add('hidden');
    els.resTkNetAxis.classList.add('hidden');
    els.deltaTkSpacer.classList.add('hidden');
    els.deltaTkLegend.classList.add('hidden');

    calculate();
}

// Note: selectEye calls populateEyeData from biompin.js
// This will be wired up in main.js to avoid circular dependencies
let populateEyeDataCallback = null;

export function setPopulateEyeDataCallback(callback) {
    populateEyeDataCallback = callback;
}

export function selectEye(eye) {
    state.selectedEye = eye;

    if (eye === 'right') {
        els.eyeRight.classList.add('eye-selected');
        els.eyeLeft.classList.remove('eye-selected');
    } else {
        els.eyeLeft.classList.add('eye-selected');
        els.eyeRight.classList.remove('eye-selected');
    }

    // Populate form with cached data if available
    if (state.cachedBiomData && populateEyeDataCallback) {
        populateEyeDataCallback(eye);
    }
}

// ==========================================
// TAB & FILE UPLOAD FUNCTIONS
// ==========================================

/**
 * Switches between BiomPIN and File Upload tabs
 * @param {string} tab - 'biompin' or 'fileupload'
 */
export function switchTab(tab) {
    if (state.isLoadingBiomPin || state.isUploadingFile) return; // Prevent switching during loading

    state.activeTab = tab;

    const activeClasses = ['bg-white', 'shadow-sm', 'text-blue-700'];
    const inactiveClasses = ['bg-transparent', 'text-gray-500', 'hover:text-gray-700'];

    const setActive = (el) => {
        el?.classList.add(...activeClasses);
        el?.classList.remove(...inactiveClasses);
        el?.setAttribute('aria-selected', 'true');
    };
    const setInactive = (el) => {
        el?.classList.remove(...activeClasses);
        el?.classList.add(...inactiveClasses);
        el?.setAttribute('aria-selected', 'false');
    };

    if (tab === 'biompin') {
        els.panelBiomPin?.classList.remove('hidden');
        els.panelFileUpload?.classList.add('hidden');
        setActive(els.tabBiomPin);
        setInactive(els.tabFileUpload);
    } else {
        els.panelFileUpload?.classList.remove('hidden');
        els.panelBiomPin?.classList.add('hidden');
        setActive(els.tabFileUpload);
        setInactive(els.tabBiomPin);
    }
}

// ==========================================
// JSON VIEW MODE
// ==========================================

/**
 * Renders state.cachedBiomData as prettified JSON, or an empty-state message.
 */
export function renderJsonView() {
    if (!els.jsonViewPre) return;
    if (state.rawApiResponse) {
        els.jsonViewPre.textContent = JSON.stringify(state.rawApiResponse, null, 2);
        els.jsonViewPre.classList.remove('text-gray-400', 'italic');
        if (els.jsonCopyBtn) els.jsonCopyBtn.disabled = false;
    } else {
        els.jsonViewPre.textContent = 'No BiomAPI data loaded yet.';
        els.jsonViewPre.classList.add('text-gray-400', 'italic');
        if (els.jsonCopyBtn) els.jsonCopyBtn.disabled = true;
    }
}

/**
 * Turns JSON view mode on/off; syncs body class, URL (?view=json), and toggle label.
 * @param {boolean} on
 */
export function setJsonViewMode(on) {
    state.jsonViewMode = !!on;
    document.body.classList.toggle('json-mode', state.jsonViewMode);

    const url = new URL(window.location.href);
    if (state.jsonViewMode) {
        url.searchParams.set('view', 'json');
    } else {
        url.searchParams.delete('view');
    }
    const qs = url.searchParams.toString();
    window.history.replaceState({}, '', qs ? `${url.pathname}?${qs}` : url.pathname);

    if (els.jsonViewToggle) {
        els.jsonViewToggle.textContent = state.jsonViewMode ? '← Calculator' : '{ } JSON';
    }

    renderJsonView();
}

export function toggleJsonView() {
    setJsonViewMode(!state.jsonViewMode);
}

/**
 * Toggles loading state for file upload UI
 * @param {boolean} loading - Whether loading is in progress
 */
export function setFileUploadLoadingState(loading) {
    state.isUploadingFile = loading;

    if (loading) {
        // Show spinner, hide text
        els.filePickerSpinner?.classList.remove('hidden');
        els.filePickerText?.classList.add('hidden');
        els.fileNameDisplay?.classList.add('hidden');
        // Grey out and disable file picker
        els.filePickerBox?.classList.add('opacity-50', 'pointer-events-none');
        els.filePickerLabel?.classList.remove('cursor-pointer');
        els.filePickerLabel?.classList.add('cursor-not-allowed');
        els.biometryFileInput.disabled = true;
        els.tabBiomPin.disabled = true;
        els.tabFileUpload.disabled = true;
    } else {
        // Hide spinner, show default text
        els.filePickerSpinner?.classList.add('hidden');
        els.filePickerText?.classList.remove('hidden');
        els.fileNameDisplay?.classList.add('hidden');
        // Restore file picker styling
        els.filePickerBox?.classList.remove('opacity-50', 'pointer-events-none');
        els.filePickerLabel?.classList.add('cursor-pointer');
        els.filePickerLabel?.classList.remove('cursor-not-allowed');
        els.biometryFileInput.disabled = false;
        els.tabBiomPin.disabled = false;
        els.tabFileUpload.disabled = false;
        // Clear the selected file and reset input
        state.selectedFile = null;
        els.biometryFileInput.value = '';
    }
}
