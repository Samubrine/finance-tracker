'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertSeverity } from '../types';
import { Bell, X, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [showAll]);

  const fetchAlerts = async () => {
    try {
      const url = showAll ? '/api/alerts' : '/api/alerts?unreadOnly=true';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertIds: string[]) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds }),
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error marking alerts as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
        };
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      budget_warning: 'Budget Warning',
      goal_milestone: 'Goal Milestone',
      unusual_spending: 'Unusual Spending',
      recurring_reminder: 'Recurring Transaction',
    };
    return labels[type] || type;
  };

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Alerts & Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {showAll ? 'Show Unread' : 'Show All'}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <CheckCircle size={16} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Bell className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 text-lg">
              {showAll ? 'No alerts' : 'No unread alerts'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {showAll
                ? "You're all caught up!"
                : 'Check back later for new notifications'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 ${
                  !alert.isRead ? 'shadow-md' : 'shadow-sm opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${config.iconColor} mt-1`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${config.textColor}`}>
                            {alert.title}
                          </h3>
                          {!alert.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <span className="text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded">
                          {getAlertTypeLabel(alert.type)}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        title="Dismiss"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p className={`text-sm ${config.textColor} mb-2`}>
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>
                        {new Date(alert.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead([alert.id])}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Alert Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              <p className="text-sm text-gray-600">Unread</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter((a) => a.severity === 'warning').length}
              </p>
              <p className="text-sm text-gray-600">Warnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {alerts.filter((a) => a.isRead).length}
              </p>
              <p className="text-sm text-gray-600">Read</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
