import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  opportunity_id: string | null;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const unsubscribe = subscribeToNotifications();
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching notifications for user:', user.id);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to fetch notifications');
        return;
      }

      console.log('Fetched notifications:', data);
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return () => {};

    console.log('Setting up notification subscription for user:', user.id);
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'notifications'
        },
        async (payload) => {
          console.log('Received notification change:', payload);
          
          // Handle different event types
          switch (payload.eventType) {
            case 'INSERT':
              const newNotification = payload.new as Notification;
              // Only add if it's for the current user
              if (newNotification.user_id === user.id) {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(newNotification.message);
              }
              break;
            
            case 'UPDATE':
              const updatedNotification = payload.new as Notification;
              setNotifications(prev =>
                prev.map(n =>
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              );
              // Update unread count if read status changed
              if (payload.old.is_read !== updatedNotification.is_read) {
                setUnreadCount(prev => 
                  updatedNotification.is_read ? prev - 1 : prev + 1
                );
              }
              break;
            
            case 'DELETE':
              const deletedNotification = payload.old as Notification;
              setNotifications(prev =>
                prev.filter(n => n.id !== deletedNotification.id)
              );
              // Update unread count if deleted notification was unread
              if (!deletedNotification.is_read) {
                setUnreadCount(prev => prev - 1);
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      console.log('Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to mark notification as read');
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error in markAsRead:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      console.log('Marking all notifications as read');
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('Failed to mark all notifications as read');
        return;
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error in markAllAsRead:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        return '/messages';
      case 'application':
        return user?.role === 'organization' 
          ? '/dashboard/organization' 
          : `/opportunities/${notification.opportunity_id}`;
      case 'application_accepted':
      case 'application_rejected':
        return `/opportunities/${notification.opportunity_id}`;
      default:
        return notification.opportunity_id 
          ? `/opportunities/${notification.opportunity_id}`
          : null;
    }
  };

  if (error) {
    return (
      <Button variant="ghost" size="icon" className="relative" onClick={fetchNotifications}>
        <Bell className="h-5 w-5 text-destructive" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const link = getNotificationLink(notification);
                const NotificationContent = (
                  <>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </>
                );

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${
                      !notification.is_read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {link ? (
                      <Link to={link} className="block">
                        {NotificationContent}
                      </Link>
                    ) : (
                      NotificationContent
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 