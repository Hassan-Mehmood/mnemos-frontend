import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ChatSidebar } from '@/components/ChatSidebar';
import ChatContainer from '@/components/ChatContainer';
import { ChatProvider } from '@/context/ChatContext';

const Index = () => {
    return (
        <ChatProvider>
            <SidebarProvider>
                <div className="min-h-screen flex w-full">
                    <ChatSidebar />
                    <div className="flex-1 flex flex-col min-w-0">
                        <header className="h-10 flex items-center border-b border-chat-input-border bg-chat-bg shrink-0">
                            <SidebarTrigger className="ml-2 text-chat-text-muted hover:text-chat-text" />
                        </header>
                        <div className="flex-1 min-h-0">
                            <ChatContainer />
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        </ChatProvider>
    );
};

export default Index;
