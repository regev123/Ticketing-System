import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ShowFilterTabId } from '@/config/showFilterTabs';
import type { ShowBrowseFilterState } from '@/utils/showBrowseFilters';
import {
  buildRefineSummaryChips,
  countRefineGroupsActive,
  getRefineTabActiveFlags,
} from '@/utils/showFiltersRefine';

/**
 * UI state for the collapsible Refine block: tab selection, open/close, Escape to close.
 */
export function useShowFiltersRefine(browse: ShowBrowseFilterState) {
  const [activeTab, setActiveTab] = useState<ShowFilterTabId>('datetime');
  const [refineOpen, setRefineOpen] = useState(false);

  useEffect(() => {
    if (!refineOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRefineOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [refineOpen]);

  const openRefine = useCallback((tab?: ShowFilterTabId) => {
    setRefineOpen(true);
    if (tab) setActiveTab(tab);
  }, []);

  const refineGroups = useMemo(() => countRefineGroupsActive(browse), [browse]);
  const summaryChips = useMemo(() => buildRefineSummaryChips(browse), [browse]);
  const tabActiveFlags = useMemo(() => getRefineTabActiveFlags(browse), [browse]);

  const tabHasFilters = useCallback(
    (id: ShowFilterTabId) => tabActiveFlags[id],
    [tabActiveFlags]
  );

  return {
    activeTab,
    setActiveTab,
    refineOpen,
    setRefineOpen,
    refineGroups,
    summaryChips,
    openRefine,
    tabHasFilters,
  };
}
