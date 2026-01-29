import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Paperclip, AlertCircle } from 'lucide-react';
import { formatDate, truncateText } from '../../utils/formatters';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

const EmailCard = ({ email }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/emails/${email.trackingId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {email.subject || 'No Subject'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">
            From: <span className="font-medium">{email.senderName}</span>
          </p>
          <p className="text-xs text-gray-500 mb-2">{email.from}</p>
          {email.body && (
            <p className="text-sm text-gray-700 mb-3">
              {truncateText(email.body, 150)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[email.processingStatus]
            }`}
          >
            {email.processingStatus}
          </span>
          {email.priority && email.priority !== 'normal' && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                PRIORITY_COLORS[email.priority]
              }`}
            >
              {email.priority}
            </span>
          )}
          {email.hasAttachments && (
            <span className="inline-flex items-center text-xs text-gray-500">
              <Paperclip className="h-3 w-3 mr-1" />
              {email.attachmentCount}
            </span>
          )}
          {email.errors && email.errors.length > 0 && (
            <span className="inline-flex items-center text-xs text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              {email.errors.length}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {formatDate(email.receivedAt)}
        </span>
      </div>
    </div>
  );
};

export default EmailCard;