"use client";

import type { AgentType } from "@/server/agent.ts";
import type { AgentTools, ChatAIMessageToolCall } from "@trpc-chat-agent/core";
import { ToolCallWrapper } from "@/components/chat/ToolCallWrapper.tsx";
import { ToolResultWrapper } from "@/components/chat/ToolResultWrapper.tsx";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { ExpertResponse } from "./ExpertResponse.tsx";
import { useState } from "react";
import { StyledMarkdown } from "@/components/chat/StyledMarkdown.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Card } from "@/components/ui/card.tsx";

function CodeContent({
  content,
  language,
}: {
  content: string;
  language?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const truncated =
    content.length > 500 ? content.slice(0, 500) + "..." : content;

  const CodeBlock = ({ content: blockContent }: { content: string }) => {
    const inner = language ? (
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        PreTag="div"
        className="p-0"
        customStyle={{ margin: 0 }}
      >
        {blockContent}
      </SyntaxHighlighter>
    ) : (
      <Card className="p-4 border border-accent-foreground/20 w-full block rounded-lg">
        <pre className="font-mono whitespace-pre-wrap">{blockContent}</pre>
      </Card>
    );

    return (
      <ScrollArea className="max-w-full" orientation="both">
        {inner}
      </ScrollArea>
    );
  };

  return (
    <>
      <CodeBlock content={truncated} />
      {content.length > 500 && (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          View Full Content
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen w-auto">
          <DialogHeader>
            <DialogTitle>Full Content</DialogTitle>
          </DialogHeader>
          <div className="p-4 max-w-2xl">
            <CodeBlock content={content} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RenderTool({
  tool,
}: {
  tool: ChatAIMessageToolCall<AgentTools<AgentType>>;
}) {
  switch (tool.name) {
    case "write-lib-file": {
      const data = tool.result;
      return (
        <ToolCallWrapper tool={tool} title="Write Library File">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Path: </span>
              <code>{tool.args?.path}</code>
            </div>
            <div>
              <span className="font-semibold">Declarations:</span>
              <div className="mt-1">
                <CodeContent
                  content={tool.args?.declarations ?? ""}
                  language="typescript"
                />
              </div>
            </div>
            <div>
              <span className="font-semibold">Content:</span>
              <div className="mt-1">
                <CodeContent
                  content={tool.args?.content ?? ""}
                  language="typescript"
                />
              </div>
            </div>
          </div>
        </ToolCallWrapper>
      );
    }

    case "execute-script": {
      const data = tool.result;
      const progress = tool.progressStatus?.output ?? "";

      return (
        <ToolCallWrapper tool={tool} title="Execute Script">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Code:</span>
              <div className="mt-1">
                <CodeContent
                  content={tool.args?.code ?? ""}
                  language="typescript"
                />
              </div>
            </div>
            {!data && progress && (
              <div>
                <span className="font-semibold">Output:</span>
                <div className="mt-1">
                  <CodeContent content={progress} />
                </div>
              </div>
            )}
            {data && (
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Exit Code: </span>
                  <code>{data.exitCode}</code>
                </div>
                {data.stdout && (
                  <div>
                    <span className="font-semibold">Stdout:</span>
                    <div className="mt-1">
                      <CodeContent content={data.stdout} />
                    </div>
                  </div>
                )}
                {data.stderr && (
                  <div>
                    <span className="font-semibold">Stderr:</span>
                    <div className="mt-1">
                      <CodeContent content={data.stderr} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ToolCallWrapper>
      );
    }

    default:
      return (
        <ToolCallWrapper tool={tool} title="Unknown Tool">
          <div className="text-muted-foreground">
            Unknown tool: {(tool as any).name}
          </div>
        </ToolCallWrapper>
      );
  }
}
