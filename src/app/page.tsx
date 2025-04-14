"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { LoginButton } from "~/components/home/login-button";
import { Plus } from "lucide-react";
import { ImSpinner3 } from "react-icons/im";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react"
import Editor from "~/components/home/editor";
import NoteCreationDialog from "~/components/home/noteCreationDialog";
import AppSidebar from "~/components/home/appSidebar";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";

export default function Page() {
    const [title, setTitle] = useState("");
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);


    const session = useSession();
    const { data: notes, isLoading: notesLoading, refetch } = api.notes.getAll.useQuery(undefined, { enabled: !!session.data });

    const selectedNote = notes?.find((note) => note.id === selectedNoteId);

    if (notesLoading || updateLoading || deleteLoading) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-400">QuickNote</h2>
              <p className="flex mt-2 text-muted-foreground items-center justify-center"><ImSpinner3 className="h-4 w-4 animate-spin" /> {deleteLoading ? "Deleting" : updateLoading ? "Saving" : "Loading"} your notes...</p>
            </div>
          </div>
        )
    }

    return (
        <SidebarProvider>
          <AppSidebar notes={notes ?? []} title={title} setTitle={setTitle} selectedNoteId={selectedNoteId} setSelectedNoteId={setSelectedNoteId} refetch={refetch} setUpdateLoading={setUpdateLoading} setDeleteLoading={setDeleteLoading} />
          <main className="flex h-screen w-screen bg-background text-foreground overflow-hidden relative">

            <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border p-4 flex items-center">
          <SidebarTrigger className="cursor-pointer mr-2 h-9 w-9" />
          {selectedNote ? (
            <h2 className="text-xl font-bold">{selectedNote.title}</h2>
          ) : (
            <h2 className="text-xl font-bold">No note selected</h2>
          )}
          <div className="ml-auto flex items-center space-x-2">
            <LoginButton />
          </div>
        </header>

        {/* Editor and Preview */}
        <div className="flex-1 overflow-hidden flex">
          {selectedNote ? (
            <div className="flex-1 overflow-auto">
              <div className="px-8 py-2 min-w-full mx-auto h-screen">
                <Editor selectedNote={selectedNoteId} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center flex flex-col">
                <p className="text-muted-foreground text-3xl">No note selected or create a new one</p>
                <NoteCreationDialog  title={title} setTitle={setTitle} setSelectedNoteId={setSelectedNoteId} refetch={refetch}>
                  <Button
                    className="mt-4 flex w-1/2 self-center text-2xl cursor-pointer"
                    onClick={() => setTitle("")}
                  >
                    <Plus className="mr-2 h-8 w-8" />
                    Create Note
                  </Button>
                </NoteCreationDialog>
              </div>
            </div>
          )}
        </div>
      </div>
        </main>
        </SidebarProvider>
    );
}