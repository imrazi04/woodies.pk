import { cn } from "@/lib/utils";

type Block = { type: "paragraph" | "heading" | "quote"; text: string };

/**
 * Admin-written story text as plain blocks: paragraphs separated by blank lines, `## ` subheadings
 * and `> ` quotes. Rendered as text (never HTML), so nothing typed in the admin panel can inject markup.
 */
function parseStory(content: string): Block[] {
  return content
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith("## ")) return { type: "heading", text: chunk.slice(3).trim() };
      if (chunk.startsWith(">")) {
        return {
          type: "quote",
          text: chunk
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join("\n"),
        };
      }
      return { type: "paragraph", text: chunk };
    });
}

export function StoryContent({ content, className }: { content: string; className?: string }) {
  const blocks = parseStory(content);
  const firstParagraph = blocks.findIndex((block) => block.type === "paragraph");

  return (
    <div className={cn("space-y-5 text-[1.05rem] leading-[1.8] text-espresso/80", className)}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={index} className="pt-3 font-display text-2xl leading-snug text-espresso md:text-[1.7rem]">
              {block.text}
            </h3>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="my-8 border-l-2 border-clay pl-6 font-display text-2xl leading-snug whitespace-pre-line text-espresso italic md:text-[1.75rem]"
            >
              {block.text}
            </blockquote>
          );
        }
        return (
          <p
            key={index}
            className={cn(
              "whitespace-pre-line",
              // A carved-initial drop cap opens each story.
              index === firstParagraph &&
                "first-letter:float-left first-letter:mt-1.5 first-letter:mr-3 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-clay",
            )}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
