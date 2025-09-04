"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { role: string; content: string; verses?: Array<{ book: string; chapter: number; verse: number; text?: string }>; prayer?: string; createdAt: string };
}

export default function HistoryDetailSheet({ open, onOpenChange, item }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px]">
        <SheetHeader>
          <SheetTitle>기록 상세</SheetTitle>
        </SheetHeader>
        {item ? (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="font-semibold mr-2">{item.role === 'user' ? '사용자' : '상담봇'}</span>
              <span className="text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div className="whitespace-pre-wrap">{item.content}</div>
            {item.verses?.length ? (
              <div className="text-xs bg-muted rounded p-2">
                <div className="font-medium mb-1">관련 구절</div>
                {item.verses.map((v, i) => (
                  <div key={i}>{v.book} {v.chapter}:{v.verse} {v.text ? `- ${v.text}` : ''}</div>
                ))}
              </div>
            ) : null}
            {item.prayer ? (
              <div className="text-xs italic bg-muted rounded p-2">기도: {item.prayer}</div>
            ) : null}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(item.content)}
                className="h-7 px-2 text-xs"
              >복사(본문)</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const v = item.verses?.[0];
                  const share = [
                    `${item.role === 'user' ? '사용자' : '상담봇'}`,
                    item.content,
                    v ? `(${v.book} ${v.chapter}:${v.verse})` : '',
                    item.prayer ? `기도: ${item.prayer}` : '',
                  ].filter(Boolean).join('\n');
                  navigator.clipboard.writeText(share);
                }}
                className="h-7 px-2 text-xs"
              >복사(전체)</Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}


