// src/Tiptap.tsx
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "../components/MenuBar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { TableKit } from "@tiptap/extension-table";
import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { get_document } from "../services/Get_Visualization_Doc";
import { update_system_doc } from "../services/System";
import { update_service_doc } from "../services/Service";
import Image from '@tiptap/extension-image'
import ImageResize from 'tiptap-extension-resize-image';
import { DecorationsPlugin, decorationsPluginKey } from "../extensions/decorations";
import { SearchNavbar } from "../components/SearchNavbar";

const Tiptap = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") as "system" | "service";
  const keyword = searchParams.get("keyword");

  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [hasScrolledToFirst, setHasScrolledToFirst] = useState(false);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "editor-page",
        dir: "rtl",
      },
    },
    extensions: [
      StarterKit,
      Highlight,
      TextStyle,
      Color,
      Image,
      ImageResize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TableKit.configure({
        table: { resizable: true },
      }),
      DecorationsPlugin.configure({ customOption: keyword ?? "empty" })
    ],
    content: "",
    onUpdate: ({ editor }) => {
      saveDoc(editor.getJSON());
    },
  });

  const totalMatches = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return 0;
      const state = decorationsPluginKey.getState(ctx.editor.state);
      return state?.classes?.length ?? 0;
    },
  }) ?? 0;

  const goToMatch = useCallback((index: number) => {
    document.querySelectorAll(".decorations-highlight-active").forEach((el) => {
      el.classList.remove("decorations-highlight-active");
    });
    const el = document.querySelector(`.decorations-highlight-${index}`);
    if (el) {
      el.classList.add("decorations-highlight-active");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleNext = useCallback(() => {
    if (totalMatches === 0) return;
    setActiveMatchIndex((prev) => (prev >= totalMatches ? 1 : prev + 1));
  }, [totalMatches]);

  const handlePrev = useCallback(() => {
    if (totalMatches === 0) return;
    setActiveMatchIndex((prev) => (prev <= 1 ? totalMatches : prev - 1));
  }, [totalMatches]);

  const handleClose = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("keyword");
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    if (keyword && totalMatches > 0 && !hasScrolledToFirst) {
      setHasScrolledToFirst(true);
      setActiveMatchIndex(1);
    }
  }, [keyword, totalMatches, hasScrolledToFirst]);

  useEffect(() => {
    if (activeMatchIndex > 0) {
      goToMatch(activeMatchIndex);
    }
  }, [activeMatchIndex, goToMatch]);

  useEffect(() => {
    if (!keyword) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        e.preventDefault();
        e.shiftKey ? handlePrev() : handleNext();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [keyword, handleNext, handlePrev, handleClose]);

  const load_doc = async () => {
    try {
      const response = await get_document(id, type);
      const content = response.data[0].content;
      if (editor && content) {
        editor.commands.setContent(content);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveDoc = async (content: any) => {
    try {
      switch (type) {
        case "system":
          await update_system_doc(id, content);
          break;
        case "service":
          await update_service_doc(id, content);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error saving document", error);
    }
  };

  useEffect(() => {
    load_doc();
  }, []);

  return (
    <div>
      <MenuBar editor={editor} />

      {keyword && (
        <SearchNavbar
          keyword={keyword}
          totalMatches={totalMatches}
          currentMatch={activeMatchIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
        />
      )}

      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
