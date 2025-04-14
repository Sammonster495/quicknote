"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { api } from "~/trpc/react";
import { ImSpinner3 } from "react-icons/im";
import { ScrollArea } from "../ui/scroll-area";

export default function Editor({
    selectedNote
}: {
    selectedNote: string | null;
}) {
    const { data: noteData, isLoading: noteDataLoading } = api.notes.getById.useQuery({ id: selectedNote ?? "" });

    const [blocks, setBlocks] = useState<string[]>([""]); // Start empty
    const [editingIndex, setEditingIndex] = useState<number | null>(0); // Always start with 1 editable block
    const textareaRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

    useEffect(() => {
        const local = localStorage.getItem(`note-${selectedNote}`);

        if (local) {
            try {
                const parsed: unknown = JSON.parse(local);
                if (Array.isArray(parsed)) {
                    setBlocks(parsed as string[]);
                    return;
                }
            } catch (err) {
                console.error("Failed to parse local note data", err);
            }
        }

        if (noteData && noteData.content.length > 0) {
            // Assuming noteData.content is the full string — split it into blocks
            setBlocks(noteData.content); // or use your own block-splitting logic
        } else {
            setBlocks([""]);
        }
    }, [noteData, selectedNote]);

    const handleBlockChange = (index: number, value: string) => {
        const newBlocks = [...blocks];
        newBlocks[index] = value;
        setBlocks(newBlocks);
        localStorage.setItem(`note-${selectedNote}`, JSON.stringify(newBlocks));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        const textarea = textareaRefs.current[index];
        const cursorPosition = textarea?.selectionStart ?? 0;

        // Enter key: create new block
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            const current = blocks[index];
            const before = current?.slice(0, cursorPosition);
            const after = current?.slice(cursorPosition);

            const newBlocks = [...blocks];
            newBlocks[index] = before ?? "";
            newBlocks.splice(index + 1, 0, after ?? "");

            setBlocks(newBlocks);
            setEditingIndex(index + 1);

            setTimeout(() => {
                textareaRefs.current[index + 1]?.focus();
            }, 0);
        }

        // Backspace on empty block: delete it
        if (e.key === "Backspace" && blocks[index] === "") {
            e.preventDefault();

            if (blocks.length === 1) return; // Never delete the last block

            const newBlocks = [...blocks];
            newBlocks.splice(index, 1);

            setBlocks(newBlocks);
            const newIndex = Math.max(0, index - 1);
            setEditingIndex(newIndex);

            setTimeout(() => {
                textareaRefs.current[newIndex]?.focus();
            }, 0);
        }
    };

    if (noteDataLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-purple-400">QuickNote</h2>
                    <p className="mt-2 text-muted-foreground"><ImSpinner3 className="h-4 w-4 animate-spin" /> Loading your notes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="prose min-w-full">
            <ScrollArea className="flex-1">
                {blocks.map((block, i) =>
                    i === editingIndex ? (
                        <textarea
                            key={i}
                            ref={(el) => { textareaRefs.current[i] = el; }}
                            className="w-full border-none focus:outline-none focus:ring-0 rounded mb-2 bg-transparent resize-none"
                            value={block}
                            onChange={(e) => handleBlockChange(i, e.target.value)}
                            onBlur={() => setEditingIndex(null)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            rows={block.split("\n").length || 1}
                            autoFocus
                        />
                    ) : (
                        <div
                            key={i}
                            onClick={() => setEditingIndex(i)}
                            className="cursor-pointer mb-4 prose-headings:text-slate-500 prose-p:text-slate-400 prose-li:text-slate-400"
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{block}</ReactMarkdown>
                        </div>
                    )
                )}
            </ScrollArea>
        </div>
    );
}
