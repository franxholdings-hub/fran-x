// Markdown renderer for FRIX AI responses — headings, lists, tables,
// code blocks and links render as styled rich content.

import ReactMarkdown from "react-markdown";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="frix-markdown break-words text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="mb-2 mt-4 font-display text-lg font-semibold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-2 mt-4 font-display text-base font-semibold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-1.5 mt-3 font-display text-sm font-semibold">{children}</h3>,
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">{children}</blockquote>
          ),
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return <code className="font-mono text-xs">{children}</code>;
            }
            return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 text-xs">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-border bg-muted/40 px-3 py-1.5 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-border/60 px-3 py-1.5">{children}</td>,
          hr: () => <hr className="my-3 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
