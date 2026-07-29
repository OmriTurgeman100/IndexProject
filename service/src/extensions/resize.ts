// src/extensions/ServerImageResize.ts
import { Node } from "@tiptap/core";

const ServerImageResize = Node.create({
  name: "imageResize",
  group: "block",
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      wrapperStyle: { default: "display: flex" },
      containerStyle: {
        default: "width: 100%; height: auto; cursor: pointer; ",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          const el = element as HTMLElement;

          return {
            src: el.getAttribute("src"),
            alt: el.getAttribute("alt"),
            title: el.getAttribute("title"),
            width: el.getAttribute("width"),
            height: el.getAttribute("height"),
            wrapperStyle: "display: flex",
            containerStyle:
              "width: 100%; height: auto; cursor: pointer; ",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", HTMLAttributes];
  },
});

export default ServerImageResize;