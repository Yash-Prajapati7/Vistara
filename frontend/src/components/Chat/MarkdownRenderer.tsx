import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders full CommonMark + GitHub Flavored Markdown (headings, tables, lists,
 * blockquotes, horizontal rules, code blocks, and inline formatting) styled to
 * match Vistara's editorial aesthetic.
 */
const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1
      className="font-display text-[26px] font-light tracking-tight mt-4 mb-2.5 first:mt-0 text-ink dark:text-on-dark leading-snug"
      {...props}
    />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2
      className="font-display text-[23px] font-light tracking-tight mt-4 mb-2 first:mt-0 text-ink dark:text-on-dark leading-snug"
      {...props}
    />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3
      className="font-display text-[21px] font-light tracking-tight mt-3.5 mb-2 first:mt-0 text-ink dark:text-on-dark leading-snug"
      {...props}
    />
  ),
  h4: ({ node: _node, ...props }) => (
    <h4
      className="font-body text-[15px] font-semibold tracking-wide mt-3 mb-1.5 first:mt-0 text-ink dark:text-on-dark"
      {...props}
    />
  ),
  h5: ({ node: _node, ...props }) => (
    <h5
      className="font-body text-[14px] font-semibold tracking-wide mt-2.5 mb-1 first:mt-0 text-ink dark:text-on-dark"
      {...props}
    />
  ),
  h6: ({ node: _node, ...props }) => (
    <h6
      className="font-body text-[13px] font-semibold tracking-wider uppercase mt-2.5 mb-1 first:mt-0 text-muted dark:text-muted-soft"
      {...props}
    />
  ),
  p: ({ node: _node, ...props }) => (
    <p
      className="leading-relaxed text-[15px] mb-2.5 last:mb-0 text-body-strong dark:text-on-dark/90 tracking-[0.14px]"
      {...props}
    />
  ),
  strong: ({ node: _node, ...props }) => (
    <strong className="font-semibold text-ink dark:text-white" {...props} />
  ),
  em: ({ node: _node, ...props }) => (
    <em className="italic text-ink/90 dark:text-on-dark/95" {...props} />
  ),
  del: ({ node: _node, ...props }) => (
    <del className="line-through text-muted dark:text-muted-soft" {...props} />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul
      className="my-2 ml-5 list-disc space-y-1 text-[15px] text-body-strong dark:text-on-dark/90 [&>li>ul]:mt-1 [&>li>ol]:mt-1"
      {...props}
    />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol
      className="my-2 ml-5 list-decimal space-y-1 text-[15px] text-body-strong dark:text-on-dark/90 [&>li>ul]:mt-1 [&>li>ol]:mt-1"
      {...props}
    />
  ),
  li: ({ node: _node, ...props }) => (
    <li
      className="leading-relaxed pl-0.5 [&>p]:mb-1 [&>p:last-child]:mb-0"
      {...props}
    />
  ),
  hr: ({ node: _node, ...props }) => (
    <hr
      className="my-4 border-0 border-t border-hairline dark:border-white/10"
      {...props}
    />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="my-3 pl-3.5 border-l-2 border-hairline-strong dark:border-white/25 text-body dark:text-muted-soft italic text-[14.5px] leading-relaxed"
      {...props}
    />
  ),
  a: ({ node: _node, ...props }) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink dark:text-on-dark underline decoration-hairline-strong underline-offset-2 hover:decoration-ink dark:hover:decoration-white transition-colors"
      {...props}
    />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre
      className="my-3 p-3.5 rounded-xl overflow-x-auto bg-canvas-soft dark:bg-surface-dark border border-hairline dark:border-white/10 font-mono text-[12.5px] leading-relaxed text-ink dark:text-on-dark [&_code]:bg-transparent [&_code]:p-0 [&_code]:rounded-none [&_code]:text-inherit"
      {...props}
    />
  ),
  code: ({ node: _node, ...props }) => (
    <code
      className="font-mono text-[13px] px-1.5 py-0.5 rounded bg-surface-strong dark:bg-white/10 text-ink dark:text-on-dark"
      {...props}
    />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="my-3 w-full overflow-x-auto rounded-xl border border-hairline dark:border-white/10 bg-canvas-soft/40 dark:bg-surface-dark/40">
      <table className="w-full border-collapse text-left text-[13.5px]" {...props} />
    </div>
  ),
  thead: ({ node: _node, ...props }) => (
    <thead
      className="bg-canvas-soft dark:bg-surface-dark border-b border-hairline dark:border-white/10"
      {...props}
    />
  ),
  tbody: ({ node: _node, ...props }) => (
    <tbody className="divide-y divide-hairline-soft dark:divide-white/10" {...props} />
  ),
  tr: ({ node: _node, ...props }) => (
    <tr
      className="hover:bg-canvas-soft/70 dark:hover:bg-white/[0.03] transition-colors"
      {...props}
    />
  ),
  th: ({ node: _node, ...props }) => (
    <th
      className="px-3.5 py-2.5 font-semibold text-ink dark:text-on-dark align-top whitespace-nowrap"
      {...props}
    />
  ),
  td: ({ node: _node, ...props }) => (
    <td
      className="px-3.5 py-2.5 text-body-strong dark:text-on-dark/90 align-top leading-relaxed min-w-[120px]"
      {...props}
    />
  ),
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="min-w-0 max-w-full break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
