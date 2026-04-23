import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';

type DownloadTicketArgs = {
  orderId: string;
  seatId: string;
  filename?: string;
};

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useDownloadOrderTicket() {
  return useMutation({
    mutationFn: async ({ orderId, seatId }: DownloadTicketArgs) => {
      const blob = await ordersApi.downloadTicket(orderId, seatId);
      return { blob, orderId, seatId };
    },
    onSuccess: ({ blob, orderId, seatId }, variables) => {
      const fallback = `ticket-${orderId}-${seatId}.pdf`;
      saveBlob(blob, variables.filename ?? fallback);
    },
  });
}
