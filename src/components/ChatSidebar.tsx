import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, User } from 'lucide-react';
import { fetchChats, fetchChatMessages } from '@/api/chats';
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

    const collapsed = state === 'collapsed';

    const { data: chats, isLoading } = useQuery({
        queryKey: ['chats'],
        queryFn: fetchChats,
    });

    const { data: messages } = useQuery({
        queryKey: ['chat', selectedChatId],
        queryFn: () => fetchChatMessages(selectedChatId!),
        enabled: !!selectedChatId, // only runs when a chat is selected
    });

    // Push fetched messages into context whenever they arrive
    useEffect(() => {
        if (messages) setInitialMessages(messages);
    }, [messages]);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-1">
                    <MessageSquare className="h-5 w-5 shrink-0 text-sidebar-primary" />
                    {!collapsed && (
                        <span className="text-sm font-semibold text-sidebar-foreground">
                            Chats
                        </span>
                    )}
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
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton
                                        tooltip={chat.name}
                                        isActive={selectedChatId === chat.id}
                                        onClick={() => {
                                            setSelectedChatId(chat.id);
                                            setInitialMessages([]);
                                        }}
                                    >
                                        <MessageSquare className="h-4 w-4 shrink-0" />
                                        {!collapsed && (
                                            <span className="truncate">
                                                {chat.name}
                                            </span>
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
                <div className="flex items-center gap-2 px-1">
                    <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <span className="truncate text-sm text-sidebar-foreground">
                            Username
                        </span>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
