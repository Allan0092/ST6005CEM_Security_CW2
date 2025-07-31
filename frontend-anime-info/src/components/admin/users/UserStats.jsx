import {
  FaUserCheck,
  FaUserClock,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

const UserStats = ({ stats, isLoading }) => {
  const statCards = [
    {
      title: "Total Users",
      value: stats?.users?.total || 0,
      icon: FaUsers,
      color: "blue",
      description: "All registered users",
    },
    {
      title: "Verified Users",
      value: stats?.users?.verified || 0,
      icon: FaUserCheck,
      color: "green",
      description: "Email verified accounts",
    },
    {
      title: "Pending Verification",
      value: stats?.users?.pending || 0,
      icon: FaUserClock,
      color: "yellow",
      description: "Awaiting verification",
    },
    {
      title: "Admin Users",
      value: stats?.users?.admins || 0,
      icon: FaUserShield,
      color: "purple",
      description: "Administrator accounts",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "text-blue-400",
      green: "text-green-400",
      yellow: "text-yellow-400",
      purple: "text-purple-400",
      red: "text-red-400",
    };
    return colors[color] || "text-slate-400";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            {stat.value.toLocaleString()}
          </div>

          <div className="text-xs text-slate-400">{stat.title}</div>

          <div className="text-xs text-slate-500 mt-1">{stat.description}</div>
        </div>
      ))}
    </div>
  );
};

export default UserStats;
