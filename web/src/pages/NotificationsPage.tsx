import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { LoadingState, ErrorState, EmptyState } from '../components/QueryStates';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  readAt?: string;
  createdAt: string;
}

export function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: Notification[] }>('/notifications').then((r) => r.data.notifications),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter((n: Notification) => !n.readAt).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="mt-1 text-sm text-gray-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
            className="text-sm text-indigo-600 hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : notifications.length === 0 ? (
        <EmptyState message="No notifications." />
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n: Notification) => (
            <div key={n.id}
              className={`rounded-xl border p-4 ${n.readAt ? 'border-gray-200 bg-white' : 'border-indigo-200 bg-indigo-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`font-medium ${n.readAt ? 'text-gray-700' : 'text-indigo-800'}`}>{n.title}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(n.createdAt)}</p>
                </div>
                {!n.readAt && (
                  <button onClick={() => markReadMutation.mutate(n.id)}
                    className="shrink-0 text-xs text-indigo-600 hover:underline">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
