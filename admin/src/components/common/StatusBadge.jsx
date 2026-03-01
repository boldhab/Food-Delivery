import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTruck,
  FiPackage,
  FiHome,
  FiRefreshCw,
  FiStar,
  FiThumbsUp,
  FiThumbsDown,
  FiMinusCircle,
  FiPlusCircle,
  FiInfo
} from "react-icons/fi";
const StatusBadge = ({
  status,
  type = "order",
  variant = "default",
  size = "md",
  showIcon = true,
  showLabel = true,
  animated = false,
  pulsating = false,
  clickable = false,
  onClick,
  onHover,
  tooltip,
  className = "",
  customConfig,
  withDescription = false,
  withActions = false,
  interactive = false
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const getOrderStatusConfig = (value) => {
    const config2 = {
      pending: {
        color: "yellow",
        label: "Pending",
        icon: <FiClock className="w-3 h-3" />,
        description: "Your order is waiting to be confirmed",
        actions: [
          { label: "Cancel", onClick: () => {
          }, variant: "danger" }
        ]
      },
      confirmed: {
        color: "blue",
        label: "Confirmed",
        icon: <FiCheckCircle className="w-3 h-3" />,
        description: "Restaurant has confirmed your order"
      },
      preparing: {
        color: "orange",
        label: "Preparing",
        icon: <FiPackage className="w-3 h-3" />,
        description: "Your food is being prepared"
      },
      out_for_delivery: {
        color: "purple",
        label: "Out for Delivery",
        icon: <FiTruck className="w-3 h-3" />,
        description: "Your order is on the way"
      },
      delivered: {
        color: "green",
        label: "Delivered",
        icon: <FiHome className="w-3 h-3" />,
        description: "Order has been delivered",
        actions: [
          { label: "Reorder", onClick: () => {
          }, variant: "primary" },
          { label: "Review", onClick: () => {
          }, variant: "secondary" }
        ]
      },
      cancelled: {
        color: "red",
        label: "Cancelled",
        icon: <FiXCircle className="w-3 h-3" />,
        description: "This order has been cancelled"
      },
      rejected: {
        color: "red",
        label: "Rejected",
        icon: <FiXCircle className="w-3 h-3" />,
        description: "Restaurant could not fulfill this order"
      }
    };
    return config2[value] || { color: "gray", label: value || "Unknown", icon: <FiInfo className="w-3 h-3" /> };
  };
  const getPaymentStatusConfig = (value) => {
    const config2 = {
      pending: {
        color: "yellow",
        label: "Pending",
        icon: <FiClock className="w-3 h-3" />,
        description: "Payment is being processed"
      },
      paid: {
        color: "green",
        label: "Paid",
        icon: <FiCheckCircle className="w-3 h-3" />,
        description: "Payment completed successfully"
      },
      failed: {
        color: "red",
        label: "Failed",
        icon: <FiXCircle className="w-3 h-3" />,
        description: "Payment failed. Please try again",
        actions: [
          { label: "Retry", onClick: () => {
          }, variant: "primary" }
        ]
      },
      refunded: {
        color: "purple",
        label: "Refunded",
        icon: <FiRefreshCw className="w-3 h-3" />,
        description: "Payment has been refunded"
      },
      authorized: {
        color: "blue",
        label: "Authorized",
        icon: <FiCheckCircle className="w-3 h-3" />,
        description: "Payment authorized"
      }
    };
    return config2[value] || { color: "gray", label: value || "Unknown", icon: <FiInfo className="w-3 h-3" /> };
  };
  const getFoodStatusConfig = (value) => {
    return value ? { color: "green", label: "Available", icon: <FiCheckCircle className="w-3 h-3" /> } : { color: "red", label: "Unavailable", icon: <FiXCircle className="w-3 h-3" /> };
  };
  const getUserStatusConfig = (value) => {
    const config2 = {
      active: {
        color: "green",
        label: "Active",
        icon: <FiCheckCircle className="w-3 h-3" />,
        description: "User account is active"
      },
      inactive: {
        color: "gray",
        label: "Inactive",
        icon: <FiMinusCircle className="w-3 h-3" />,
        description: "User account is inactive"
      },
      suspended: {
        color: "red",
        label: "Suspended",
        icon: <FiXCircle className="w-3 h-3" />,
        description: "Account has been suspended"
      },
      verified: {
        color: "blue",
        label: "Verified",
        icon: <FiCheckCircle className="w-3 h-3" />,
        description: "Email verified"
      },
      premium: {
        color: "purple",
        label: "Premium",
        icon: <FiStar className="w-3 h-3" />,
        description: "Premium member"
      }
    };
    return config2[value] || { color: "gray", label: value || "Unknown", icon: <FiInfo className="w-3 h-3" /> };
  };
  const getDeliveryStatusConfig = (value) => {
    const config2 = {
      assigned: {
        color: "blue",
        label: "Driver Assigned",
        icon: <FiTruck className="w-3 h-3" />,
        description: "A driver has been assigned"
      },
      picked_up: {
        color: "purple",
        label: "Picked Up",
        icon: <FiPackage className="w-3 h-3" />,
        description: "Order picked up from restaurant"
      },
      on_route: {
        color: "orange",
        label: "On Route",
        icon: <FiTruck className="w-3 h-3" />,
        description: "Driver is on the way"
      },
      arrived: {
        color: "green",
        label: "Arrived",
        icon: <FiHome className="w-3 h-3" />,
        description: "Driver has arrived"
      },
      delayed: {
        color: "red",
        label: "Delayed",
        icon: <FiAlertCircle className="w-3 h-3" />,
        description: "Delivery is delayed"
      }
    };
    return config2[value] || { color: "gray", label: value || "Unknown", icon: <FiInfo className="w-3 h-3" /> };
  };
  const getReviewStatusConfig = (value) => {
    const config2 = {
      pending: {
        color: "yellow",
        label: "Pending Review",
        icon: <FiClock className="w-3 h-3" />
      },
      approved: {
        color: "green",
        label: "Approved",
        icon: <FiThumbsUp className="w-3 h-3" />
      },
      rejected: {
        color: "red",
        label: "Rejected",
        icon: <FiThumbsDown className="w-3 h-3" />
      },
      featured: {
        color: "purple",
        label: "Featured",
        icon: <FiStar className="w-3 h-3" />
      }
    };
    return config2[value] || { color: "gray", label: value || "Unknown", icon: <FiInfo className="w-3 h-3" /> };
  };
  const getConfig = () => {
    if (customConfig && typeof status === "string" && customConfig[status]) {
      return customConfig[status];
    }
    switch (type) {
      case "order":
        return getOrderStatusConfig(status);
      case "payment":
        return getPaymentStatusConfig(status);
      case "food":
        return getFoodStatusConfig(status);
      case "user":
        return getUserStatusConfig(status);
      case "delivery":
        return getDeliveryStatusConfig(status);
      case "review":
        return getReviewStatusConfig(status);
      default:
        return { color: "gray", label: String(status), icon: <FiInfo className="w-3 h-3" /> };
    }
  };
  const config = getConfig();
  const colorClasses = {
    gray: {
      default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      outline: "border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600",
      ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
      dot: "bg-gray-500",
      pill: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    },
    red: {
      default: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      outline: "border-red-300 text-red-700 dark:text-red-400 dark:border-red-700",
      ghost: "text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30",
      dot: "bg-red-500",
      pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    },
    orange: {
      default: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      outline: "border-orange-300 text-orange-700 dark:text-orange-400 dark:border-orange-700",
      ghost: "text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30",
      dot: "bg-orange-500",
      pill: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
    },
    yellow: {
      default: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      outline: "border-yellow-300 text-yellow-700 dark:text-yellow-400 dark:border-yellow-700",
      ghost: "text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30",
      dot: "bg-yellow-500",
      pill: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    },
    green: {
      default: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      outline: "border-green-300 text-green-700 dark:text-green-400 dark:border-green-700",
      ghost: "text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30",
      dot: "bg-green-500",
      pill: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    },
    blue: {
      default: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      outline: "border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-700",
      ghost: "text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30",
      dot: "bg-blue-500",
      pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    },
    purple: {
      default: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      outline: "border-purple-300 text-purple-700 dark:text-purple-400 dark:border-purple-700",
      ghost: "text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30",
      dot: "bg-purple-500",
      pill: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    }
  };
  const sizeClasses = {
    sm: {
      container: "px-2 py-0.5 text-xs",
      icon: "w-3 h-3",
      dot: "w-2 h-2",
      pill: "px-2 py-0.5 text-xs"
    },
    md: {
      container: "px-2.5 py-1 text-sm",
      icon: "w-3.5 h-3.5",
      dot: "w-2.5 h-2.5",
      pill: "px-3 py-1 text-sm"
    },
    lg: {
      container: "px-3 py-1.5 text-base",
      icon: "w-4 h-4",
      dot: "w-3 h-3",
      pill: "px-4 py-1.5 text-base"
    }
  };
  const getVariantClasses = () => {
    const color = config.color;
    switch (variant) {
      case "outline":
        return `border ${colorClasses[color]?.outline || colorClasses.gray.outline}`;
      case "ghost":
        return colorClasses[color]?.ghost || colorClasses.gray.ghost;
      case "dot":
        return "";
      case "pill":
        return `rounded-full ${colorClasses[color]?.pill || colorClasses.gray.pill}`;
      default:
        return `${colorClasses[color]?.default || colorClasses.gray.default} border`;
    }
  };
  if (variant === "dot") {
    return <div className="flex items-center gap-1.5">
                <motion.span
      className={`block rounded-full ${sizeClasses[size].dot} ${colorClasses[config.color]?.dot}`}
      animate={pulsating ? {
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
                {showLabel && <span className="text-sm text-slate-600 dark:text-slate-400">
                        {config.label}
                    </span>}
            </div>;
  }
  return <div className="relative inline-block">
            <motion.span
    className={`
                    inline-flex items-center gap-1.5 rounded-lg font-medium
                    transition-all duration-200
                    ${sizeClasses[size].container}
                    ${getVariantClasses()}
                    ${clickable ? "cursor-pointer hover:scale-105 active:scale-95" : ""}
                    ${className}
                `}
    animate={animated ? {
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, repeat: Infinity }
    } : {}}
    whileHover={interactive ? { scale: 1.05 } : {}}
    whileTap={interactive ? { scale: 0.95 } : {}}
    onClick={onClick}
    onMouseEnter={() => {
      setIsHovered(true);
      onHover?.(true);
      if (tooltip) setShowTooltip(true);
    }}
    onMouseLeave={() => {
      setIsHovered(false);
      onHover?.(false);
      setShowTooltip(false);
    }}
  >
                {
    /* Pulsing effect overlay */
  }
                {pulsating && <motion.span
    className="absolute inset-0 rounded-lg"
    animate={{
      boxShadow: [
        "0 0 0 0 rgba(249,115,22,0.4)",
        "0 0 0 8px rgba(249,115,22,0)",
        "0 0 0 0 rgba(249,115,22,0)"
      ]
    }}
    transition={{ duration: 1.5, repeat: Infinity }}
  />}

                {
    /* Icon */
  }
                {showIcon && config.icon && <span className={sizeClasses[size].icon}>
                        {config.icon}
                    </span>}

                {
    /* Label */
  }
                {showLabel && config.label}

                {
    /* Actions button (if interactive) */
  }
                {interactive && config.actions && config.actions.length > 0 && <motion.button
    className="ml-1 p-0.5 rounded-full hover:bg-white/20"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
                        <FiPlusCircle className="w-3 h-3" />
                    </motion.button>}
            </motion.span>

            {
    /* Tooltip */
  }
            <AnimatePresence>
                {showTooltip && tooltip && <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 5 }}
    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
                                 px-2 py-1 bg-slate-900 text-white text-xs rounded
                                 whitespace-nowrap"
  >
                        {tooltip}
                        <div className="absolute top-full left-1/2 -translate-x-1/2
                                      border-4 border-transparent border-t-slate-900" />
                    </motion.div>}
            </AnimatePresence>

            {
    /* Description tooltip on hover */
  }
            <AnimatePresence>
                {withDescription && isHovered && config.description && <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 5 }}
    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
                                 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700
                                 dark:text-slate-300 text-sm rounded-lg shadow-xl
                                 border border-slate-200 dark:border-slate-700
                                 min-w-[200px] whitespace-normal"
  >
                        {config.description}
                        <div className="absolute top-full left-1/2 -translate-x-1/2
                                      border-4 border-transparent border-t-white
                                      dark:border-t-slate-800" />
                    </motion.div>}
            </AnimatePresence>
        </div>;
};
var stdin_default = StatusBadge;
export {
  stdin_default as default
};
