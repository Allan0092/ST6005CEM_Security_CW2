import {
  FaServer,
  FaUsers,
  FaExclamationTriangle,
  FaClock,
  FaEye,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

const LogStats = ({ stats, isLoading }) => {
  const overview = stats?.overview || {};
  const logTypeDistribution = stats?.logTypeDistribution || [];
  const statusCodeDistribution = stats?.statusCodeDistribution || [];
  const topEndpoints = stats?.topEndpoints || [];

  const statCards = [
    {
      title: "Total Requests",
      value: overview.totalRequests || 0,
      icon: FaServer,
      color: "blue",
      description: `Last ${stats?.timeframe || 24} hours`,
    },
    {
      title: "Unique Users",
      value: overview.uniqueUsers || 0,
      icon: FaUsers,
      color: "green",
      description: "Active users",
    },
    {
      title: "Errors",
      value: overview.errors || 0,
      icon: FaExclamationTriangle,
      color: "red",
      description: `${overview.errorRate || 0}% error rate`,
    },
    {
      title: "Avg Response",
      value: `${overview.averageResponseTime || 0}ms`,
      icon: FaClock,
      color: "yellow",
      description: "Response time",
    },
    {
      title: "Unique IPs",
      value: overview.uniqueIPs || 0,
      icon: FaEye,
      color: "purple",
      description: "Different locations",
    },
    {
      title: "Suspicious Activity",
      value: overview.suspiciousActivity || 0,
      icon: FaShieldAlt,
      color: "orange",
      description: "Security alerts",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "text-blue-400",
      green: "text-green-400",
      red: "text-red-400",
      yellow: "text-yellow-400",
      purple: "text-purple-400",
      orange: "text-orange-400",
    };
    return colors[color] || "text-slate-400";
  };

  const getStatusColor = (status) => {
    if (status.includes("2xx")) return "text-green-400";
    if (status.includes("3xx")) return "text-blue-400";
    if (status.includes("4xx")) return "text-yellow-400";
    if (status.includes("5xx")) return "text-red-400";
    return "text-slate-400";
  };

  const getLogTypeColor = (type) => {
    const colors = {
      request: "text-blue-400",
      auth: "text-green-400",
      admin: "text-purple-400",
      error: "text-red-400",
      security: "text-orange-400",
    };
    return colors[type] || "text-slate-400";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stat Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl animate-pulse"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <div className="h-4 bg-slate-600 rounded mb-3"></div>
              <div className="h-6 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>

        {/* Charts Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-xl animate-pulse"
              style={{
                backgroundColor: "rgba(71, 85, 105, 0.15)",
                border: "1px solid rgba(148, 163, 184, 0.25)",
              }}
            >
              <div className="h-4 bg-slate-600 rounded mb-4 w-1/3"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="h-3 bg-slate-700 rounded w-20"></div>
                    <div className="h-3 bg-slate-600 rounded flex-1"></div>
                    <div className="h-3 bg-slate-700 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border hover:shadow-lg transition-all duration-300"
            style={{
              backgroundColor: "rgba(71, 85, 105, 0.15)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`text-xl ${getColorClasses(stat.color)}`} />
            </div>

            <div className="text-2xl font-bold text-white mb-1">
              {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
            </div>

            <div className="text-xs text-slate-400">{stat.title}</div>

            <div className="text-xs text-slate-500 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Type Distribution */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-400" />
            Log Type Distribution
          </h3>

          <div className="space-y-3">
            {logTypeDistribution.map((item) => {
              const total = logTypeDistribution.reduce((sum, i) => sum + i.count, 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getLogTypeColor(item._id).replace('text-', 'bg-')}`}
                    />
                    <span className="text-white font-medium capitalize">{item._id}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getLogTypeColor(item._id).replace('text-', 'bg-')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-sm w-12 text-right">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {logTypeDistribution.length === 0 && (
            <p className="text-slate-400 text-center py-4">No data available</p>
          )}
        </div>

        {/* Status Code Distribution */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaServer className="mr-2 text-green-400" />
            Status Code Distribution
          </h3>

          <div className="space-y-3">
            {statusCodeDistribution.map((item) => {
              const total = statusCodeDistribution.reduce((sum, i) => sum + i.count, 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;

              return (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(item._id).replace('text-', 'bg-')}`}
                    />
                    <span className="text-white font-medium">{item._id}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(item._id).replace('text-', 'bg-')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-400 text-sm w-12 text-right">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {statusCodeDistribution.length === 0 && (
            <p className="text-slate-400 text-center py-4">No data available</p>
          )}
        </div>
      </div>

      {/* Top Endpoints */}
      {topEndpoints.length > 0 && (
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: "rgba(71, 85, 105, 0.15)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaEye className="mr-2 text-purple-400" />
            Top Endpoints
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left text-slate-400 pb-2">Endpoint</th>
                  <th className="text-left text-slate-400 pb-2">Method</th>
                  <th className="text-center text-slate-400 pb-2">Requests</th>
                  <th className="text-center text-slate-400 pb-2">Avg Time</th>
                  <th className="text-center text-slate-400 pb-2">Errors</th>
                  <th className="text-center text-slate-400 pb-2">Error Rate</th>
                </tr>
              </thead>
              <tbody>
                {topEndpoints.map((endpoint, index) => (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-2 text-white font-mono text-xs">
                      {endpoint.endpoint}
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="py-2 text-center text-white">
                      {endpoint.requests.toLocaleString()}
                    </td>
                    <td className="py-2 text-center text-slate-300">
                      {endpoint.averageResponseTime}ms
                    </td>
                    <td className="py-2 text-center text-red-300">
                      {endpoint.errors}
                    </td>
                    <td className="py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          endpoint.errorRate > 10
                            ? "bg-red-500/20 text-red-300"
                            : endpoint.errorRate > 5
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/20 text-green-300"
                        }`}
                      >
                        {endpoint.errorRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogStats;