import { PlusIcon, RotateIcon } from '@/components/icons';
import type { AdminAction } from './types';

export const ADMIN_ACTIONS: AdminAction[] = [
  {
    id: 'create-event',
    title: 'Create new event',
    description:
      'Add a show with title, schedule, optional cover image, and seat sections with per-zone pricing.',
    to: '/admin/shows/new',
    ctaLabel: 'Start',
    tags: ['Schedule', 'Artwork', 'Seating'],
    icon: <PlusIcon className="h-7 w-7" />,
  },
  {
    id: 'update-event',
    title: 'Update existing event',
    description:
      'Find an existing show and update title, schedule, venue details, and cover artwork while keeping seating and pricing unchanged.',
    to: '/admin/shows',
    ctaLabel: 'Manage',
    tags: ['Catalog', 'Edits', 'Safe fields'],
    icon: <RotateIcon className="h-7 w-7" />,
  },
  {
    id: 'metrics',
    title: 'Metrics dashboard',
    description:
      'Track order trends, conversion mix, check-in throughput, and top-performing events in one operational view.',
    to: '/admin/metrics',
    ctaLabel: 'View',
    tags: ['Analytics', 'Revenue', 'Operations'],
    icon: <RotateIcon className="h-7 w-7" />,
  },
  {
    id: 'manage-scanners',
    title: 'Manage scanner accounts',
    description:
      'Create scanner-only users, disable access instantly, and reset scanner passwords for gate operations.',
    to: '/admin/scanners',
    ctaLabel: 'Open',
    tags: ['Check-in', 'Access control', 'Security'],
    icon: <RotateIcon className="h-7 w-7" />,
  },
];
