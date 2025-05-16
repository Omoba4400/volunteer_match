
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOpportunity, Message } from "@/contexts/OpportunityContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
}

const Messages = () => {
  const { user } = useAuth();
  const { messages, sendMessage, markMessageAsRead, loading } = useOpportunity();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Fetch user names when messages change
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!messages.length) return;
      
      // Get unique user IDs from messages
      const userIds = Array.from(new Set([
        ...messages.map(msg => msg.senderId),
        ...messages.map(msg => msg.receiverId)
      ]));
      
      // Don't include current user
      const otherUserIds = user ? userIds.filter(id => id !== user.id) : userIds;
      
      if (otherUserIds.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role')
          .in('id', otherUserIds);
          
        if (error) throw error;
        
        if (data) {
          const names: Record<string, string> = {};
          data.forEach(profile => {
            names[profile.id] = profile.name || `${profile.role === 'volunteer' ? 'Volunteer' : 'Organization'}`;
          });
          
          setUserNames(names);
        }
      } catch (error) {
        console.error('Error fetching user names:', error);
      }
    };
    
    fetchUserNames();
  }, [messages, user]);

  // Group messages into conversations
  useEffect(() => {
    if (!user) return;
    
    const conversationMap: Record<string, Message[]> = {};
    
    // Group messages by the other user's ID
    messages.forEach(msg => {
      const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      
      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = [];
      }
      
      conversationMap[otherUserId].push(msg);
      
      // Mark messages as read if they are currently selected
      if (selectedConversation === otherUserId && msg.receiverId === user.id && !msg.read) {
        markMessageAsRead(msg.id);
      }
    });
    
    // Convert to conversation objects and sort by most recent
    const conversationArray = Object.entries(conversationMap).map(([userId, msgs]) => {
      const sortedMsgs = [...msgs].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return {
        userId,
        userName: userNames[userId] || (userId.startsWith("o") ? "Organization" : "Volunteer"),
        lastMessage: sortedMsgs[sortedMsgs.length - 1].content,
        unreadCount: sortedMsgs.filter(m => m.receiverId === user.id && !m.read).length,
        messages: sortedMsgs
      };
    });
    
    // Sort by most recent message
    conversationArray.sort((a, b) => {
      const aDate = new Date(a.messages[a.messages.length - 1].createdAt).getTime();
      const bDate = new Date(b.messages[b.messages.length - 1].createdAt).getTime();
      return bDate - aDate;
    });
    
    setConversations(conversationArray);
  }, [messages, user, selectedConversation, markMessageAsRead, userNames]);
  
  // Get the currently selected conversation
  const currentConversation = selectedConversation 
    ? conversations.find(c => c.userId === selectedConversation)
    : null;

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    await sendMessage(selectedConversation, newMessage);
    setNewMessage("");
  };
  
  // Handle conversation selection - mark messages as read
  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    
    // Mark all messages from this user as read
    if (user) {
      const conversationMessages = conversations.find(c => c.userId === userId)?.messages || [];
      conversationMessages.forEach(msg => {
        if (msg.receiverId === user.id && !msg.read) {
          markMessageAsRead(msg.id);
        }
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Please login to view your messages.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[70vh] flex flex-col md:flex-row">
            {/* Conversation sidebar */}
            <div className="w-full md:w-1/3 border-r">
              <div className="p-4 border-b">
                <Input 
                  placeholder="Search conversations..."
                  className="w-full"
                />
              </div>
              
              <div className="overflow-y-auto h-[65vh]">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.userId}
                      className={`flex items-start p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.userId ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation.userId)}
                    >
                      <div className="flex-grow">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium">{conversation.userName}</h3>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-volunteer-primary text-white rounded-full px-2 py-0.5 text-xs">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No conversations yet
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-grow flex flex-col h-[80vh]">
              {selectedConversation && currentConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-medium">{currentConversation.userName}</h2>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {currentConversation.messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderId === user.id 
                            ? "bg-volunteer-primary text-white" 
                            : "bg-gray-100"
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === user.id ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Type a message..."
                        className="flex-grow resize-none"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={2}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || loading}
                        className="bg-volunteer-primary hover:bg-volunteer-primary/90"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="mb-2">Select a conversation to start messaging</p>
                    {conversations.length === 0 && (
                      <p className="text-sm">
                        You don't have any messages yet. Apply to opportunities to connect with organizations.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
