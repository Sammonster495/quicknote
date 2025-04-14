import { ImSpinner3 } from "react-icons/im";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useState } from "react";

export default function NoteCreationDialog({
    setSelectedNoteId,
    title,
    setTitle,
    refetch,
    children
}: {
    setSelectedNoteId: (id: string) => void;
    title: string;
    setTitle: (title: string) => void;
    refetch: () => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState<boolean>(false);

    const { isPending: creationLoading, mutateAsync: createNoteMutation } = api.notes.create.useMutation();

    const createNewNote = async () => {
        try {
            const newNote = await createNoteMutation({ title });
            setTitle("");
            setSelectedNoteId(newNote.id);
            refetch();
            setOpen(false); // close the dialog
        } catch (err) {
            console.error("Error creating note:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="absolute inset-0 max-w-[25%] self-center left-1/2 -translate-x-1/2 p-5 backdrop-blur-lg flex flex-col gap-4 rounded-md">
                <DialogTitle className="text-2xl">Create a new note</DialogTitle>
                <Input
                    placeholder="Enter title of the note"
                    className="p-2 focus:outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                            await createNewNote();
                            e.preventDefault();
                        }
                    }}
                />
                <Button type="submit" onClick={createNewNote} className="cursor-pointer self-center flex w-[20%]">
                    {creationLoading ? <ImSpinner3 className="animate-spin self-center" /> : "Confirm"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
