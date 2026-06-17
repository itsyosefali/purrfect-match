<div wire:poll.3s="refreshQr" class="flex flex-col items-center gap-4 py-4">
    @if (filled($qrImage))
        <img
            src="data:image/png;base64,{{ $qrImage }}"
            alt="WhatsApp QR code"
            class="h-64 w-64 rounded-lg border border-gray-200 bg-white p-2"
        />
        <p class="text-sm text-gray-500">QR refreshes automatically. Scan with WhatsApp → Linked devices.</p>
    @else
        <p class="text-sm text-gray-500">No QR code available. Click Connect to start pairing.</p>
    @endif
</div>
