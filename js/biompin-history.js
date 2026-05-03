/**
 * BiomPIN Local History SDK
 * Browser-local storage helper for recent BiomPINs.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.BiomPinHistory = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DEFAULT_STORAGE_KEY = 'biompin_history';
    const DEFAULT_MAX_ENTRIES = 50;

    function parseEntries(raw) {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return [];
        }
    }

    function normalizeString(value) {
        return value == null ? '' : String(value);
    }

    function cloneEntry(entry) {
        return {
            biompin: entry.biompin,
            patient_name: entry.patient_name,
            patient_id: entry.patient_id,
            expires_at: entry.expires_at,
            db_id: entry.db_id,
            added_at: entry.added_at,
        };
    }

    function create(options = {}) {
        const storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
        const storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
        const maxEntries = Number.isFinite(options.maxEntries) && options.maxEntries > 0
            ? Math.floor(options.maxEntries)
            : DEFAULT_MAX_ENTRIES;

        if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
            throw new Error('BiomPinHistory requires a localStorage-compatible storage object.');
        }

        function readEntries() {
            return parseEntries(storage.getItem(storageKey));
        }

        function writeEntries(entries) {
            storage.setItem(storageKey, JSON.stringify(entries.map(cloneEntry)));
        }

        function resolveEntry(entryOrBiomPin) {
            if (entryOrBiomPin && typeof entryOrBiomPin === 'object') return entryOrBiomPin;
            const biomPin = normalizeString(entryOrBiomPin);
            return readEntries().find(entry => entry.biompin === biomPin) || null;
        }

        function list() {
            return readEntries().map(cloneEntry);
        }

        function search(query) {
            const q = normalizeString(query).trim().toLowerCase();
            if (!q) return list();

            return readEntries()
                .filter(entry =>
                    normalizeString(entry.patient_name).toLowerCase().includes(q) ||
                    normalizeString(entry.patient_id).toLowerCase().includes(q)
                )
                .map(cloneEntry);
        }

        function add({ dbId, biomPin, patientName, patientId, expiresAt }) {
            const biompin = normalizeString(biomPin).trim();
            if (!biompin) {
                throw new Error('BiomPinHistory.add requires a biomPin.');
            }
            if (dbId == null || dbId === '') {
                throw new Error('BiomPinHistory.add requires a dbId.');
            }
            if (expiresAt == null || expiresAt === '') {
                throw new Error('BiomPinHistory.add requires an expiresAt.');
            }

            const entry = {
                biompin,
                patient_name: normalizeString(patientName),
                patient_id: normalizeString(patientId),
                expires_at: String(expiresAt),
                db_id: String(dbId),
                added_at: Date.now(),
            };

            const entries = readEntries()
                .filter(existing => existing.db_id === entry.db_id)
                .filter(existing => existing.biompin !== biompin);
            entries.unshift(entry);
            writeEntries(entries.slice(0, maxEntries));
            return cloneEntry(entry);
        }

        function isExpired(entryOrBiomPin) {
            const entry = resolveEntry(entryOrBiomPin);
            if (!entry || !entry.expires_at) return false;

            const expiry = new Date(entry.expires_at).getTime();
            return Number.isFinite(expiry) && expiry <= Date.now();
        }

        function hasDbIdMismatch(entryOrBiomPin, currentDbId) {
            const entry = resolveEntry(entryOrBiomPin);
            if (!entry || currentDbId == null || currentDbId === '') return false;
            return entry.db_id !== String(currentDbId);
        }

        function pruneExpired() {
            const entries = readEntries();
            const kept = entries.filter(entry => !isExpired(entry));
            if (kept.length !== entries.length) writeEntries(kept);
            return kept.map(cloneEntry);
        }

        function pruneDbIdMismatch(currentDbId) {
            const entries = readEntries();
            const kept = entries.filter(entry => !hasDbIdMismatch(entry, currentDbId));
            if (kept.length !== entries.length) writeEntries(kept);
            return kept.map(cloneEntry);
        }

        function clearOne(biomPin) {
            const biompin = normalizeString(biomPin);
            const entries = readEntries();
            const kept = entries.filter(entry => entry.biompin !== biompin);
            if (kept.length !== entries.length) writeEntries(kept);
            return kept.map(cloneEntry);
        }

        function clearAll() {
            writeEntries([]);
            return [];
        }

        return {
            add,
            list,
            search,
            isExpired,
            hasDbIdMismatch,
            pruneExpired,
            pruneDbIdMismatch,
            clearOne,
            clearAll,
        };
    }

    return {
        create,
        defaults: {
            storageKey: DEFAULT_STORAGE_KEY,
            maxEntries: DEFAULT_MAX_ENTRIES,
        },
    };
}));
