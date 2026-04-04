import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, User, Trash2, LogOut } from 'lucide-react';
import { fetchChats, fetchChatMessages, deleteChat } from '@/api/chats';
import { useAuth } from '@/context/AuthContext';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatContext } from '@/context/ChatContext';

export function ChatSidebar() {
    const { state } = useSidebar();
    const { selectedChatId, setSelectedChatId, setInitialMessages } =
        useChatContext();
    const queryClient = useQueryClient();
    const { logout, user } = useAuth();

    console.log(user);

    const collapsed = state === 'collapsed';

    const { mutate: removeChatMutation } = useMutation({
        mutationFn: (chatId: string) => deleteChat(chatId, user?.id || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setSelectedChatId(null);
            setInitialMessages([]);
        },
    });

    const { data: chats, isLoading } = useQuery({
        queryKey: ['chats', user?.id],
        queryFn: () => fetchChats(user?.id || ''),
        enabled: !!user?.id,
    });

    const { data: messages } = useQuery({
        queryKey: ['chat', selectedChatId],
        queryFn: () => fetchChatMessages(selectedChatId!, user?.id || ''),
        enabled: !!selectedChatId && !!user?.id, // only runs when a chat is selected
    });

    // Push fetched messages into context whenever they arrive (including cached data)
    useEffect(() => {
        if (messages) {
            setInitialMessages(messages);
        } else if (selectedChatId === null) {
            // Clear messages when going to "New Chat"
            setInitialMessages([]);
        }
    }, [messages, selectedChatId, setInitialMessages]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="px-2 py-2">
                    <SidebarMenuButton
                        onClick={() => {
                            if (selectedChatId !== null) {
                                setSelectedChatId(null);
                            }
                        }}
                        className="w-full justify-start gap-2 text-sidebar-foreground border border-sidebar-border"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>New Chat</span>}
                    </SidebarMenuButton>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    {!collapsed && (
                        <SidebarGroupLabel>Recent</SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <SidebarMenuItem key={i}>
                                        <div className="px-2 py-1.5">
                                            <Skeleton className="h-4 w-full bg-sidebar-accent" />
                                        </div>
                                    </SidebarMenuItem>
                                ))}
                            {chats?.map((chat) => (
                                <SidebarMenuItem
                                    key={chat.id}
                                    className="group/item"
                                >
                                    <SidebarMenuButton
                                        tooltip={chat.name}
                                        isActive={selectedChatId === chat.id}
                                        onClick={() => {
                                            if (selectedChatId !== chat.id) {
                                                setSelectedChatId(chat.id);
                                            }
                                        }}
                                        className="pr-1"
                                    >
                                        <MessageSquare className="h-4 w-4 shrink-0" />
                                        {!collapsed && (
                                            <span className="truncate flex-1">
                                                {chat.name}
                                            </span>
                                        )}
                                        {!collapsed && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeChatMutation(chat.id);
                                                }}
                                                className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive"
                                                aria-label="Delete chat"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            {!isLoading &&
                                chats?.length === 0 &&
                                !collapsed && (
                                    <p className="px-2 py-3 text-xs text-muted-foreground">
                                        No chats yet
                                    </p>
                                )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
                <div className="flex items-center justify-between gap-2 px-1 w-full">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="h-7 w-7 shrink-0">
                            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                                <User className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <span className="truncate text-sm text-sidebar-foreground">
                                {user?.email ?? 'User'}
                            </span>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={logout}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                    {collapsed && (
                        <button
                            onClick={logout}
                            className="w-full flex justify-center text-muted-foreground hover:text-foreground mt-2"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
