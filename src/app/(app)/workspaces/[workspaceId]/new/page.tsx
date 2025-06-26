"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LiveMarkdownEditor } from "~/components/core/live-markdown-editor";
import { api } from "~/trpc/react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewNotePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const router = useRouter();
  const [content, setContent] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  });

  const createNote = api.note.create.useMutation({
    onSuccess: (note) => {
      if (note) {
        router.push(`/workspaces/${params.workspaceId}/${note.id}`);
      }
    },
    onError: (error) => {
      alert(`Error creating note: ${error.message}`);
    },
  });

  const onSubmit = (data: FormValues) => {
    createNote.mutate({
      title: data.title,
      content: content,
      workspaceId: params.workspaceId,
    });
  };

  // Extract headings for table of contents
  const headings = content.match(/^#{1,6}\s+(.+)$/gm) || [];
  const tableOfContents = headings.map((heading, index) => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const text = heading.replace(/^#+\s+/, '');
    const id = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    return { level, text, id, index };
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <Input
              {...form.register("title")}
              placeholder="Untitled"
              className="text-2xl font-bold border-none shadow-none px-0 focus:ring-0 bg-transparent"
              disabled={createNote.isPending}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {createNote.isPending ? "Creating..." : "Draft"}
            </span>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createNote.isPending || !form.watch("title")}
              size="sm"
            >
              Create Note
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Creating new note...
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Live Editor */}
        <div className="flex-1 min-w-0">
          <LiveMarkdownEditor
            content={content}
            onChange={setContent}
            disabled={createNote.isPending}
          />
        </div>

        {/* Table of Contents Sidebar */}
        {tableOfContents.length > 0 && (
          <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-auto flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</h3>
            <nav className="space-y-1">
              {tableOfContents.map((heading) => (
                <button
                  key={heading.index}
                  onClick={() => {
                    const element = document.getElementById(heading.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block text-left w-full px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  style={{ paddingLeft: `${heading.level * 8}px` }}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 