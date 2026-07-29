// src/MenuBar2.tsx
import { Editor, useEditorState } from "@tiptap/react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CodeIcon from "@mui/icons-material/Code";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import HighlightIcon from "@mui/icons-material/Highlight";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import TableChartIcon from "@mui/icons-material/TableChart";
import BorderBottomIcon from "@mui/icons-material/BorderBottom";
import BorderRightIcon from "@mui/icons-material/BorderRight";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useThemeContext } from "../hooks/useThemeContext";
import { useState } from "react";
import { useCallback } from 'react'
import ImageIcon from '@mui/icons-material/Image';

export const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [color, setColor] = useState<string>("#000000"); // default black
  const { theme } = useThemeContext();

  if (!editor) return null;

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold") ?? false,
      canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive("italic") ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isParagraph: ctx.editor.isActive("paragraph") ?? false,
      isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
      isBulletList: ctx.editor.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor.isActive("orderedList") ?? false,
      isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
      isBlockquote: ctx.editor.isActive("blockquote") ?? false,
      isAlignLeft: ctx.editor.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor.isActive({ textAlign: "right" }) ?? false,
      isHighlight: ctx.editor.isActive("highlight") ?? false,
      isTable: ctx.editor.isActive("table") ?? false,
    }),
  });

  const addImage = useCallback(() => {
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        p: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
        backgroundColor: theme.palette.background.paper,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Text styles */}

      <Tooltip title="Image">
        <span>
          <IconButton
            onClick={addImage}
            sx={{
              color: editorState.isItalic
                ? "#4A6CFF"
                : theme.palette.text.primary,
            }}
          >
            <ImageIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Bold">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editorState.canBold}
            sx={{
              color: editorState.isBold
                ? "#4A6CFF"
                : theme.palette.text.primary,
            }}
          >
            <FormatBoldIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Italic">
        <span>
          <IconButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editorState.canItalic}
            sx={{
              color: editorState.isItalic
                ? "#4A6CFF"
                : theme.palette.text.primary,
            }}
          >
            <FormatItalicIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Highlight">
        <IconButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          sx={{
            color: editorState.isHighlight
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <HighlightIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Text Color">
        <input
          type="color"
          value={color}
          onChange={(e) => {
            const newColor = e.target.value;
            setColor(newColor);
            editor.chain().focus().setColor(newColor).run();
          }}
          style={{
            width: 30,
            height: 30,
            border: "none",
            cursor: "pointer",
            background: "transparent",
          }}
        />
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Paragraph & Headings */}
      <Tooltip title="Paragraph">
        <IconButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          sx={{
            color: editorState.isParagraph
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          P
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 1">
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          sx={{
            color: editorState.isHeading1
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          H1
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 2">
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          sx={{
            color: editorState.isHeading2
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          H2
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 3">
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          sx={{
            color: editorState.isHeading3
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          H3
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Lists */}
      <Tooltip title="Bullet List">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={{
            color: editorState.isBulletList
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <FormatListBulletedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Ordered List">
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={{
            color: editorState.isOrderedList
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <FormatListNumberedIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Block elements */}
      <Tooltip title="Code Block">
        <IconButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          sx={{
            color: editorState.isCodeBlock
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <CodeIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Blockquote">
        <IconButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          sx={{
            color: editorState.isBlockquote
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <FormatQuoteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Horizontal Rule">
        <IconButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <HorizontalRuleIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Alignment */}
      <Tooltip title="Align Left">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          sx={{
            color: editorState.isAlignLeft
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <FormatAlignLeftIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Center">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          sx={{
            color: editorState.isAlignCenter
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <FormatAlignCenterIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Right">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          sx={{
            color: editorState.isAlignRight
              ? "#4A6CFF"
              : theme.palette.text.primary,
          }}
        >
          <FormatAlignRightIcon />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem />

      {/* Tables */}
      <Tooltip title="Insert Table">
        <IconButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <TableChartIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add Row Below">
        <IconButton
          onClick={() => editor.chain().focus().addRowAfter().run()}
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <BorderBottomIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add Column After">
        <IconButton
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <BorderRightIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete Row">
        <IconButton
          onClick={() => editor.chain().focus().deleteRow().run()}
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete Column">
        <IconButton
          onClick={() => editor.chain().focus().deleteColumn().run()}
          sx={{
            color: theme.palette.text.primary,
          }}
        >
          <DeleteSweepIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete Table">
        <IconButton
          onClick={() => editor.chain().focus().deleteTable().run()}
          sx={{
            color: editorState.isTable
              ? theme.palette.error.main
              : theme.palette.text.primary,
          }}
        >
          <DeleteForeverIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
