import { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaEye,
  FaExclamationTriangle,
  FaServer,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";

const LogList = ({ logs, isLoading, currentPage, totalPages, onPageChange }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDetail, setShowLogDetail] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatResponseTime = (time) => {
    if (time < 1000) {
      return `${time}ms`;
    }
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getLogLevelColor = (level) => {
    const colors = {
      info: "text-blue-400",
      warn: "text-yellow-400", 
      error: "text-red-400",
      critical: "text-red-600",
    };
    return colors[level] || "text-slate-400";
  };

  const getLogLevelBg = (level) => {
    const colors = {
      info: "bg-blue-500/20",
      warn: "bg-yellow-500/20",
      error: "bg-red-500/20", 
      critical: "bg-red-600/30",
    };
    return colors[level] || "bg-slate-500/20";
  };

  const getStatusCodeColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "text-green-400";
    if (statusCode >= 300 && statusCode < 400) return "text-blue-400";
    if (statusCode >= 400 && statusCode < 500) return "text-yellow-400";
    if (statusCode >= 500) return "text-red-400";
    return "text-slate-400";
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: "text-green-400",
      POST: "text-blue-400",
      PUT: "text-yellow-400",
      DELETE: "text-red-400",
      PATCH: "text-purple-400",
    };
    return colors[method] || "text-slate-400";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-20"></div>
                <div className="h-4 bg-slate-700 rounded w-32"></div>
                <div className="h-4 bg-slate-600 rounded flex-1"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
                <div className="h-4 bg-slate-600 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-xl"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <FaServer className="text-4xl text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Logs Found</h3>
        <p className="text-slate-400">
          No logs match your current filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Log Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "rgba(71, 85, 105, 0.15)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/30 border-b border-slate-600">
              <tr>
                <th className="text-left text-slate-400 p-3 font-medium">Timestamp</th>
                <th className="text-left text-slate-400 p-3 font-medium">Level</th>
                <th className="text-left text-slate-400 p-3 font-medium">Method</th>
                <th className="text-left text-slate-400 p-3 font-medium">Endpoint</th>
                <th className="text-center text-slate-400 p-3 font-medium">Status</th>
                <th className="text-center text-slate-400 p-3 font-medium">Time</th>
                <th className="text-left text-slate-400 p-3 font-medium">User</th>
                <th className="text-left text-slate-400 p-3 font-medium">IP</th>
                <th className="text-center text-slate-400 p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer ${
                    log.isSuspicious ? "bg-orange-500/10" : ""
                  }`}
                  onClick={() => handleLogClick(log)}
                >
                  <td className="p-3 text-slate-300 font-mono text-xs">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelBg(
                        log.logLevel
                      )} ${getLogLevelColor(log.logLevel)}`}
                    >
                      {log.logLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-medium ${getMethodColor(log.method)}`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="p-3 text-white font-mono text-xs max-w-xs truncate">
                    {log.endpoint}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`font-medium ${getStatusCodeColor(
                        log.statusCode
                      )}`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-300">
                    {formatResponseTime(log.responseTime)}
                  </td>
                  <td className="p-3 text-slate-300">
                    {log.user ? (
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-blue-400" />
                        <span className="truncate max-w-24">
                          {log.user.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Guest</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-xs">
                    {log.ipAddress}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {log.isSuspicious && (
                        <FaShieldAlt className="text-orange-400" title="Suspicious Activity" />
                      )}
                      {log.errorMessage && (
                        <FaExclamationTriangle className="text-red-400" title="Has Error" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogClick(log);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft />
            </button>

            {generatePageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === "..." || page === currentPage}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-purple-600 text-white"
                    : page === "..."
                    ? "text-slate-400 cursor-default"
                    : "text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {showLogDetail && selectedLog && (
        <LogDetailModal
          log={selectedLog}
          isOpen={showLogDetail}
          onClose={() => {
            setShowLogDetail(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
};

// Log Detail Modal Component
const LogDetailModal = ({ log, isOpen, onClose }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className="max-w-4xl w-full max-h-[90vh] overflow-auto rounded-xl"
        style={{
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Log Details</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Log Content */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Timestamp
                </label>
                <div className="p-2 bg-slate-700/50 rounded text-white font-mono text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Request Summary
                </label>
                <div className="p-2 bg-slate-700/50 rounded text-white font-mono text-sm">
                  {log.requestSummary}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  IP Address
                </label>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-slate-700/50 rounded text-white font-mono text-sm flex-1">
                    {log.ipAddress}
                  </div>
                  <button
                    onClick={() => copyToClipboard(log.ipAddress)}
                    className="p-2 text-slate-400 hover:text-white"
                    title="Copy IP"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Response Time
                </label>
                <div className="p-2 bg-slate-700/50 rounded text-white font-mono text-sm">
                  {log.responseTime}ms
                </div>
              </div>
            </div>

            {/* User Info */}
            {log.user && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  User Information
                </label>
                <div className="p-4 bg-slate-700/50 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white ml-2">{log.user.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white ml-2">{log.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Role:</span>
                      <span className="text-white ml-2">{log.user.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">ID:</span>
                      <span className="text-white ml-2 font-mono text-sm">{log.user.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Info */}
            {log.errorMessage && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Error Message
                </label>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-300">
                  {log.errorMessage}
                </div>
              </div>
            )}

            {/* Metadata */}
            {log.metadata && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Request Metadata
                </label>
                <div className="p-4 bg-slate-700/50 rounded">
                  <pre className="text-sm text-slate-300 overflow-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Security Flags */}
            {(log.isSuspicious || log.isBlocked) && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Security Flags
                </label>
                <div className="flex space-x-2">
                  {log.isSuspicious && (
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded text-sm">
                      Suspicious Activity
                    </span>
                  )}
                  {log.isBlocked && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogList;