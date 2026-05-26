import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const quickActions = [
    {
      id: 'new-booking',
      icon: 'CalendarPlus',
      title: 'New Booking',
      description: 'Create manual booking',
      link: '/admin/manual-booking',
      variant: 'default'
    },
    {
      id: 'fleet-check',
      icon: 'Car',
      title: 'Fleet Check',
      description: 'View fleet status',
      link: '/admin/fleet',
      variant: 'outline'
    },
    {
      id: 'customer-support',
      icon: 'MessageCircle',
      title: 'Customer Support',
      description: 'WhatsApp support line',
      link: 'https://wa.me/254724440293',
      variant: 'outline',
      external: true
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'Range Rover Sport booking request from Sarah Johnson',
      time: '5 minutes ago',
      priority: 'high',
      unread: true
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Maintenance Due',
      message: 'BMW X7 is due for scheduled maintenance',
      time: '1 hour ago',
      priority: 'medium',
      unread: true
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment confirmed for booking #SB-2024-001',
      time: '2 hours ago',
      priority: 'low',
      unread: false
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return 'Calendar';
      case 'maintenance': return 'Wrench';
      case 'payment': return 'DollarSign';
      case 'alert': return 'AlertTriangle';
      default: return 'Bell';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const markAsRead = (id) => {
    // This would typically update state/backend
    console.log('Marking notification as read:', id);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg premium-shadow border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-500 mt-1">Frequently used admin functions</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              action.external ? (
                <a
                  key={action.id}
                  href={action.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-cosmic-depth hover:bg-cosmic-silver/20 brand-transition group"
                >
                  <div className="w-12 h-12 bg-cosmic-depth rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 brand-transition">
                    <Icon name={action.icon} size={24} className="text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-500 text-center">{action.description}</p>
                </a>
              ) : (
                <Link
                  key={action.id}
                  to={action.link}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-cosmic-depth hover:bg-cosmic-silver/20 brand-transition group"
                >
                  <div className="w-12 h-12 bg-cosmic-depth rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 brand-transition">
                    <Icon name={action.icon} size={24} className="text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-500 text-center">{action.description}</p>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" iconName="Download" className="w-full">
              Export Data
            </Button>
            <Button variant="outline" size="sm" iconName="Settings" className="w-full">
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg premium-shadow border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 brand-transition cursor-pointer ${
                notification.unread ? 'bg-blue-50/30' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                  <Icon name={getNotificationIcon(notification.type)} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" iconName="Check">
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" iconName="ExternalLink">
              View All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;