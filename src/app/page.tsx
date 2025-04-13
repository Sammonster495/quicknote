"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { LoginButton } from "~/components/Home/login-button";
import { EllipsisVertical, PanelLeft, Search, Cloud, Plus, FileText, X } from "lucide-react";
import { ImSpinner3 } from "react-icons/im";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react"
import Editor from "~/components/Home/editor";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose, DialogOverlay } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";

export default function Page() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("")
    const [title, setTitle] = useState("");
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    const session = useSession();
    const { data: notes, isLoading: notesLoading, refetch } = api.notes.getAll.useQuery(undefined, { enabled: !!session.data });
    const { isPending: creationLoading, mutateAsync: createNoteMutation } = api.notes.create.useMutation();
    const { isPending: updateLoading, mutateAsync: updateMutation } = api.notes.update.useMutation();
    const { isPending: deleteLoading, mutateAsync: deleteMutation } = api.notes.delete.useMutation();

    const selectedNote = notes?.find((note) => note.id === selectedNoteId);

    const createNewNote = async () => {
        const newNote = await createNoteMutation({ title }, {
          onSuccess() {
            setTitle("");
            void refetch();
          },
        });
        setDialogOpen(false);
        setSelectedNoteId(newNote.id);
    }

    const updateNote = async (event: React.MouseEvent<HTMLDivElement>) => {
        const noteId = event.currentTarget.getAttribute("data-note-id");
        const local = localStorage.getItem(`note-${noteId}`);
        if (!local) return;
        const parsed: unknown = JSON.parse(local ?? "[]");
        const content = Array.isArray(parsed) ? (parsed as string[]) : [""];
        await updateMutation({ id: noteId ?? "", content }, {
          onSuccess() {
            localStorage.removeItem(`note-${noteId}`);
            void refetch();
          }
        })
    }

    const deleteNote = async (event: React.MouseEvent<HTMLDivElement>) => {
        const noteId = event.currentTarget.getAttribute("data-note-id");
        await deleteMutation({ id: noteId ?? "" }, {
          onSuccess() {
            localStorage.removeItem(`note-${noteId}`);
            void refetch();
          }
        })
    }

    if (notesLoading) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-400">QuickNote</h2>
              <p className="flex mt-2 text-muted-foreground items-center justify-center"><ImSpinner3 className="h-4 w-4 animate-spin" /> Loading your notes...</p>
            </div>
          </div>
        )
    }

    if (updateLoading) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-400">QuickNote</h2>
              <p className="flex mt-2 text-muted-foreground items-center justify-center"><ImSpinner3 className="h-4 w-4 animate-spin" /> Saving your notes...</p>
            </div>
          </div>
        )
    }

    if (deleteLoading) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-purple-400">QuickNote</h2>
              <p className="flex mt-2 text-muted-foreground items-center justify-center"><ImSpinner3 className="h-4 w-4 animate-spin" /> Deleting your notes...</p>
            </div>
          </div>
        )
    }

    return (
        <main className="flex h-screen bg-background text-foreground overflow-hidden relative">
            <div
                className={`border-r border-border transition-all duration-300 flex flex-col ${sidebarOpen ? "w-80" : "w-0"}`}
            >
                {sidebarOpen && (
                <>
                    <div className="p-4 flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-purple-400">QuickNote</h1>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <PanelLeft className="h-6 w-6" />
                    </Button>
                    </div>
                    <div className="px-4 pb-2">
                    <div className="relative flex justify-center items-center border border-gray-100 rounded-md p-2">
                        <Search className="h-5 w-5 text-muted-foreground" strokeWidth={3} />
                        <Input
                          placeholder="Search notes..."
                          className="pl-8 focus:outline-none border-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          />
                    </div>
                    </div>
                    <ScrollArea className="flex-1">
                    <div className="px-2">
                        <div className="flex items-center justify-between py-2 px-2">
                        <div className="text-xl font-medium text-muted-foreground">Notes</div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setDialogOpen(true);
                                      setTitle("");
                                    }}
                                  >
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </DialogTrigger>
                            <DialogOverlay className="fixed inset-0 backdrop-blur-[2px] z-[0]" />
                            <DialogContent className="absolute inset-0 max-w-[25%] self-center left-1/2 -translate-x-1/2 p-5 backdrop-blur-lg flex flex-col gap-4 rounded-md">
                                <DialogClose className="absolute top-2 right-2">
                                    <X className="h-5 w-5" />
                                </DialogClose>
                                <DialogTitle className="text-2xl">Create a new note</DialogTitle>
                                  <Input
                                    placeholder="Enter title of the note"
                                    className="p-2 focus:outline-none"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyDown={async (e) => {
                                      if (e.key === "Enter") {
                                        await createNewNote();
                                        setSidebarOpen(false);
                                        e.preventDefault();
                                      }
                                    }}
                                  />
                                <Button type="submit" onClick={createNewNote} className="text-black self-center flex w-[20%]">
                                  {creationLoading ? <ImSpinner3 className="animate-spin self-center" /> : "Confirm"}
                                </Button>
                            </DialogContent>
                        </Dialog>
                        </div>
                        <div className="space-y-1">
                            {notes?.length === 0 && (
                                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                    No notes found. Create a new one!
                                </div>
                            )}
                            {notes?.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase())).map((note) => (
                                <Button
                                    key={note.id}
                                    variant={"ghost"}
                                    className={`relative w-full flex justify-start text-left font-normal ${note.id === selectedNoteId ? "bg-secondary" : ""}`}
                                    onClick={() => setSelectedNoteId(note.id)}
                                >
                                    <FileText className="mr-2 h-6 w-6" />
                                    <span className="truncate text-lg">{note.title}</span>
                                    <EllipsisVertical className="absolute h-6 w-6 right-0 self-center" />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <EllipsisVertical className="absolute h-6 w-6 right-0 self-center" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="z-50 bg-black border p-2 cursor-pointer">
                                          <DropdownMenuItem data-note-id={note.id} className="text-lg hover:bg-slate-800 rounded-md p-1 px-2" onClick={updateNote}>Save to Cloud<Cloud className="h-4 w-4" /></DropdownMenuItem>
                                          <DropdownMenuItem data-note-id={note.id} className="text-lg hover:bg-red-800 rounded-md p-1 px-2" onClick={deleteNote}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </Button>
                            ))}
                        </div>
                    </div>
                    </ScrollArea>
                </>
                )}
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border p-4 flex items-center">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2">
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
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
              <div className="p-4 min-w-full mx-auto bg-slate-300 h-screen">
                <Editor selectedNote={selectedNoteId} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center flex flex-col">
                <p className="text-muted-foreground text-3xl">No note selected or create a new one</p>
                <Button onClick={createNewNote} className="mt-4 bg-transparent flex w-1/2 self-center text-2xl border hover:bg-white hover:text-black">
                  <Plus className="mr-2 h-8 w-8" />
                  Create Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
        </main>
    );
}