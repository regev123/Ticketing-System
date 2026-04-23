import { ShowFiltersPanel } from '../components';
import type { Dispatch, SetStateAction } from 'react';
import type { ShowBrowseFilterState } from '@/utils/showBrowseFilters';

type Props = {
  totalCount: number;
  browse: ShowBrowseFilterState;
  setBrowse: Dispatch<SetStateAction<ShowBrowseFilterState>>;
};

export function HomeFiltersSection({ totalCount, browse, setBrowse }: Props) {
  if (totalCount <= 0) return null;
  return <ShowFiltersPanel browse={browse} setBrowse={setBrowse} />;
}
