import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Cloud, EllipsisVertical } from "lucide-react";
import { api } from "~/trpc/react";

export default function NoteOptions({
    noteId,
    refetch,
    onUpdateLoadingChange,
    onDeleteLoadingChange
}: {
    noteId: string;
    refetch: () => void;
    onUpdateLoadingChange?: (isLoading: boolean) => void;
    onDeleteLoadingChange?: (isLoading: boolean) => void;
}) {
    const { mutateAsync: updateMutation } = api.notes.update.useMutation({
        onMutate: () => onUpdateLoadingChange?.(true),
        onSettled: () => onUpdateLoadingChange?.(false),
    });

    const { mutateAsync: deleteMutation } = api.notes.delete.useMutation({
        onMutate: () => onDeleteLoadingChange?.(true),
        onSettled: () => onDeleteLoadingChange?.(false),
    });
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} className="cursor-pointer absolute h-6 w-6 right-3">
                    <EllipsisVertical className="self-center" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" border p-2 cursor-pointer">
                <DropdownMenuItem data-note-id={noteId} className="text-lg cursor-pointer rounded-md p-1 px-2" onClick={updateNote}>Save to Cloud<Cloud className="h-4 w-4" /></DropdownMenuItem>
                <DropdownMenuItem data-note-id={noteId} className="text-lg cursor-pointer rounded-md p-1 px-2" onClick={deleteNote}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}