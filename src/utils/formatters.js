export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    parsing: 'Parsing',
    parsed: 'Parsed',
    processing_attachments: 'Processing Attachments',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status] || status;
};

export const getPriorityLabel = (priority) => {
  const labels = {
    high: 'High Priority',
    normal: 'Normal',
    low: 'Low Priority',
  };
  return labels[priority] || priority;
};