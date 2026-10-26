import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_PREFIX = 'data-table-columns:v2:';

/**
 * Hook for managing and persisting column visibility preferences.
 * Uses a versioned, table-specific key: `data-table-columns:v2:<storageKey>`
 * Validates saved preferences against current column definitions to safely handle
 * removed, renamed, or newly added columns without hydration mismatch.
 */
export function useTablePreferences(storageKey, columns = []) {
  // Helper to extract default visibility map from column definitions
  const getDefaultVisibility = useCallback(() => {
    const visibility = {};
    columns.forEach((col) => {
      const colId = col.key || col.id;
      if (!colId) return;
      // If column is locked/not hideable, it must always be visible
      if (col.hideable === false) {
        visibility[colId] = true;
      } else {
        visibility[colId] = col.defaultVisible !== false;
      }
    });
    return visibility;
  }, [columns]);

  const [columnVisibility, setColumnVisibilityState] = useState(() => {
    if (!storageKey || typeof window === 'undefined') {
      return getDefaultVisibility();
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
      if (!raw) return getDefaultVisibility();

      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        return getDefaultVisibility();
      }

      // Reconcile saved preferences with current column definitions
      const reconciled = {};
      columns.forEach((col) => {
        const colId = col.key || col.id;
        if (!colId) return;
        if (col.hideable === false) {
          reconciled[colId] = true;
        } else if (Object.prototype.hasOwnProperty.call(parsed, colId)) {
          reconciled[colId] = Boolean(parsed[colId]);
        } else {
          // New column not in saved preferences gets its default
          reconciled[colId] = col.defaultVisible !== false;
        }
      });
      return reconciled;
    } catch (err) {
      console.warn(`Failed to parse table preferences for "${storageKey}":`, err);
      return getDefaultVisibility();
    }
  });

  // Re-sync when columns change (e.g. dynamic columns added)
  useEffect(() => {
    setColumnVisibilityState((prev) => {
      const updated = { ...prev };
      let changed = false;

      columns.forEach((col) => {
        const colId = col.key || col.id;
        if (!colId) return;

        if (col.hideable === false && updated[colId] !== true) {
          updated[colId] = true;
          changed = true;
        } else if (!Object.prototype.hasOwnProperty.call(updated, colId)) {
          updated[colId] = col.defaultVisible !== false;
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [columns]);

  // Persist to localStorage when visibility changes
  const setColumnVisibility = useCallback(
    (updater) => {
      setColumnVisibilityState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;

        // Ensure non-hideable columns remain true
        columns.forEach((col) => {
          const colId = col.key || col.id;
          if (colId && col.hideable === false) {
            next[colId] = true;
          }
        });

        if (storageKey && typeof window !== 'undefined') {
          try {
            localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(next));
          } catch (err) {
            console.warn(`Failed to save table preferences for "${storageKey}":`, err);
          }
        }

        return next;
      });
    },
    [columns, storageKey]
  );

  const toggleColumnVisibility = useCallback(
    (colId) => {
      const targetCol = columns.find((c) => (c.key || c.id) === colId);
      if (targetCol && targetCol.hideable === false) return; // Cannot hide locked column

      setColumnVisibility((prev) => ({
        ...prev,
        [colId]: !prev[colId]
      }));
    },
    [columns, setColumnVisibility]
  );

  const resetColumnVisibility = useCallback(() => {
    const defaults = getDefaultVisibility();
    setColumnVisibility(defaults);
    if (storageKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
      } catch (err) {
        console.warn(`Failed to remove table preferences for "${storageKey}":`, err);
      }
    }
  }, [getDefaultVisibility, setColumnVisibility, storageKey]);

  // Visible columns array
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      const colId = col.key || col.id;
      return columnVisibility[colId] !== false;
    });
  }, [columns, columnVisibility]);

  return {
    columnVisibility,
    visibleColumns,
    setColumnVisibility,
    toggleColumnVisibility,
    resetColumnVisibility
  };
}

export default useTablePreferences;
