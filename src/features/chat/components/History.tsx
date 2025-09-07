'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import HistoryDetailSheet from './HistoryDetailSheet';
import { MessageCircle, BookOpenText, Hand } from 'lucide-react';

interface Props {
  sessionId: string;
}

export default function History({ sessionId }: Props) {
  const [q, setQ] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<undefined | any>(undefined);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => new Set());

  const { data, isLoading, error, fetchNextPage, hasNextPage, refetch, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['history', sessionId, q, from, to],
      queryFn: async ({ pageParam }) => {
        const qs = new URLSearchParams({ sessionId });
        if (pageParam) qs.set('cursor', pageParam as string);
        qs.set('limit', '20');
        if (q) qs.set('q', q);
        if (from) qs.set('from', from);
        if (to) qs.set('to', to);
        const res = await fetch(`/api/history?${qs.toString()}`);
        if (!res.ok) throw new Error('기록을 불러오지 못했습니다');
        return (await res.json()) as {
          items: Array<{
            role: string;
            content: string;
            createdAt: string;
            verses?: Array<{ book: string; chapter: number; verse: number }>;
            prayer?: string;
          }>;
          nextCursor?: string;
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: undefined,
    });

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const isVisible = entries.some((e) => e.isIntersecting);
      if (isVisible && hasNextPage && !isFetchingNextPage) fetchNextPage();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const raw = localStorage.getItem(`history-bookmarks:${sessionId}`);
    if (raw) setBookmarks(new Set(JSON.parse(raw)));
  }, [sessionId]);

  const saveBookmarks = (next: Set<string>) => {
    setBookmarks(new Set(next));
    localStorage.setItem(`history-bookmarks:${sessionId}`, JSON.stringify(Array.from(next)));
  };

  const highlight = (text: string, keyword: string) => {
    if (!keyword) return <>{text}</>;
    const parts = text.split(
      new RegExp(`(${keyword.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi'),
    );
    return (
      <>
        {parts.map((p, i) =>
          p.toLowerCase() === keyword.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-foreground px-0.5 rounded">
              {p}
            </mark>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </>
    );
  };

  // useMemo를 항상 호출하도록 이동
  const items = data?.pages?.flatMap((p) => p.items) ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const day = format(new Date(it.createdAt), 'yyyy-MM-dd');
      const arr = map.get(day) || [];
      arr.push(it);
      map.set(day, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [items]);

  if (isLoading)
    return (
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        <div className="h-2 w-full bg-muted rounded animate-pulse" />
        <div className="h-2 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-2 w-2/3 bg-muted rounded animate-pulse" />
      </div>
    );

  if (error) return <div className="text-sm text-red-600">기록 로드 실패</div>;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">상담 기록</p>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="검색"
            className="h-6 px-2 rounded border bg-background text-xs"
          />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-6 px-2 rounded border bg-background text-xs"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-6 px-2 rounded border bg-background text-xs"
          />
          <button className="text-xs underline" onClick={() => refetch()}>
            새로고침
          </button>
        </div>
      </div>
      <div className="space-y-3 max-h-60 overflow-auto pr-1">
        {grouped.map(([day, group], gi) => (
          <div key={gi} className="space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{day}</div>
            <ul className="space-y-1">
              {group.map((it, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground cursor-pointer"
                  onClick={() => {
                    setSelected(it);
                    setDetailOpen(true);
                  }}
                >
                  <div className="flex items-start gap-2 p-2 rounded-md border bg-background/50">
                    <div className="mt-0.5 text-foreground">
                      {it.role === 'user' ? (
                        <MessageCircle className="w-3.5 h-3.5" />
                      ) : (
                        <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {it.role === 'user' ? '사용자' : '상담봇'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(it.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-foreground/90">{highlight(it.content, q)}</div>
                      <div className="flex flex-wrap items-center gap-3">
                        {it.verses?.length ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full">
                            <BookOpenText className="w-3 h-3" />
                            {it.verses[0].book} {it.verses[0].chapter}:{it.verses[0].verse}
                          </span>
                        ) : null}
                        {it.prayer ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full italic">
                            <Hand className="w-3 h-3" /> 기도
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div ref={sentinelRef} />
      </div>
      <div className="flex items-center justify-end">
        <button
          className="text-xs underline"
          onClick={() => {
            const rows = items.map((it) => ({
              role: it.role,
              content: it.content.replaceAll('\n', ' '),
              createdAt: it.createdAt,
            }));
            const header = 'role,content,createdAt';
            const csv = [
              header,
              ...rows.map((r) => `${r.role},"${r.content}",${r.createdAt}`),
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `history-${sessionId}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          CSV 내보내기
        </button>
      </div>
      <HistoryDetailSheet open={detailOpen} onOpenChange={setDetailOpen} item={selected as any} />
      {isFetchingNextPage && (
        <div className="text-[10px] text-muted-foreground">더 불러오는 중…</div>
      )}
    </div>
  );
}
