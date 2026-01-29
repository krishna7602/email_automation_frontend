export const EMAIL_STATUS = {
  PENDING: 'pending',
  PARSING: 'parsing',
  PARSED: 'parsed',
  PROCESSING_ATTACHMENTS: 'processing_attachments',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const PRIORITY_LEVELS = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  parsing: 'bg-blue-100 text-blue-800',
  parsed: 'bg-cyan-100 text-cyan-800',
  processing_attachments: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  normal: 'bg-gray-100 text-gray-800',
  low: 'bg-blue-100 text-blue-800',
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB