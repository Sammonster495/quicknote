import { FileText, Plus, Search } from "lucide-react";
import type { Note } from "prisma/generated/client";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "~/components/ui/sidebar";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import NoteCreationDialog from "~/components/home/noteCreationDialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import NoteOptions from "~/components/home/noteOptions";
import { useState } from "react";

export default function AppSidebar({
    notes,
    title,
    selectedNoteId,
    setTitle,
    setSelectedNoteId,
    refetch,
    setUpdateLoading,
    setDeleteLoading
}: {
    notes: Note[];
    title: string;
    selectedNoteId: string | null;
    setTitle: (title: string) => void;
    setSelectedNoteId: (id: string) => void;
    refetch: () => void;
    setUpdateLoading: (isLoading: boolean) => void;
    setDeleteLoading: (isLoading: boolean) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-2xl font-semibold text-purple-400 my-2">QuickNote</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem className="flex items-center justify-between m-2">
                    <Search className="absolute left-2 h-5 w-5 text-muted-foreground" strokeWidth={3} />
                        <Input
                          placeholder="Search notes..."
                          className="pl-10 h-10 focus:outline-none border-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          />
                    </SidebarMenuItem>
                    <Separator className="m-2 p-0.5 w-80" />
                    <SidebarMenuItem className="flex justify-between pl-3 mb-2">
                    <div className="text-xl font-medium text-muted-foreground">Notes</div>
                        <NoteCreationDialog title={title} setTitle={setTitle} setSelectedNoteId={setSelectedNoteId} refetch={refetch}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={() => setTitle("")}
                              >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </NoteCreationDialog>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <ScrollArea className="flex-1 px-2">
                        {notes?.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
                          <div
                            key={note.id}
                            className={`w-full flex justify-start text-left cursor-pointer hover:bg-slate-700 ${selectedNoteId === note.id ? "bg-slate-800" : ""} rounded-md p-2 mb-2`}
                            onClick={() => setSelectedNoteId(note.id)}
                          >
                              <FileText className="mr-2 h-6 w-6" />
                              <span className="truncate text-lg">{note.title}</span>
                              <NoteOptions noteId={note.id} refetch={refetch} onUpdateLoadingChange={setUpdateLoading} onDeleteLoadingChange={setDeleteLoading} />
                          </div>
                        ))}
                      </ScrollArea>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
    )
}