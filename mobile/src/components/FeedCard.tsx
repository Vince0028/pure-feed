import { View, Text, TouchableOpacity, Dimensions, Modal, ScrollView, StyleSheet, ActivityIndicator, Platform, Linking } from 'react-native';
import { ExternalLink, ChevronDown, Play, BookOpen, X, Music, Clock } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { summarizePost } from '../lib/api';
import { VideoPlayer } from './VideoPlayer';

const { width, height } = Dimensions.get('window');

const KEYWORDS = [
    "GPT-5", "GPT-4o", "GPT-4V", "GPT-4",
    "Claude 3.5 Sonnet", "Claude 3.5", "Claude 3", "Claude",
    "Llama 3.1", "Llama 3", "Llama 4", "Qwen 3", "Qwen",
    "Gemini 1.5 Pro", "Gemini 1.5 Flash", "Gemini 1.5", "Gemini",
    "Mistral", "Mixtral", "Grok",
    "OpenAI", "Anthropic", "Google DeepMind", "Google",
    "Meta", "Microsoft", "Apple Intelligence", "Apple",
    "Tesla", "Nvidia", "AMD", "Intel", "TSMC", "ASML", "ARM",
    "Copilot", "Cursor", "Vercel", "Supabase",
    "LangChain", "LangGraph", "LlamaIndex",
    "PyTorch", "TensorFlow", "JAX", "Keras",
    "AlphaFold", "AlphaGo", "Sora", "Midjourney",
    "Stability AI", "Stable Diffusion",
    "Hugging Face", "Replicate", "Together AI", "Groq", "Perplexity",
    "chain-of-thought", "mixture-of-experts", "Mixture of Depths",
    "Flash Attention", "LoRA", "QLoRA",
    "fine-tuning", "quantization", "hallucination",
    "alignment", "jailbreak", "prompt engineering",
    "multi-modal", "multimodal", "on-device",
    "open weights", "open-source",
    "AI agents", "multi-agent", "agentic", "computer-use",
    "code execution", "function calling", "tool use",
    "quantum error correction", "quantum advantage",
    "compute cluster", "supercomputer", "data center",
    "Neural Engine", "AI Act",
    "MoE", "RAG", "RLHF", "RLAIF", "DPO", "RoPE",
    "RPA", "AGI", "ASI", "NPU", "TPU", "TOPS", "TFLOPS",
    "V0", "KTO", "B200", "H100", "A100",
    "Blackwell",
];

const escapedKeywords = KEYWORDS
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const termPattern = escapedKeywords.map((k) => `\\b${k}\\b`).join("|");
const numPattern = "\\$\\d[\\d,]*(?:\\.\\d+)?(?:\\s*(?:billion|million|trillion|K|M|B|T))?|\\d+(?:\\.\\d+)?(?:K|M|B|T)(?:\\+)?(?:\\s*(?:parameter|param|tokens?|TFLOPS|ms|ns|sec|rpm|nm|x))?|\\d+(?:\\.\\d+)?%|\\d+(?:\\.\\d+)?x";

const FULL_PATTERN = new RegExp(`(${termPattern}|${numPattern})`, "gi");

const highlightTextFunction = (text: string) => {
    if (!text) return null;
    const parts = text.split(FULL_PATTERN);
    return parts.map((part, i) => {
        if (!part) return null;
        if (i % 2 !== 0) {
            return (
                <Text key={i} style={s.highlightedWord}>
                    {part}
                </Text>
            );
        }
        return <Text key={i}>{part}</Text>;
    });
};

export function FeedCard({ post, isActive, feedHeight }: { post: any; isActive: boolean; feedHeight: number }) {
    const isVideo = post.contentType === 'video' || post.contentType === 'short';
    const isShort = post.contentType === 'short';
    const isTiktok = post.source === 'tiktok';

    const [modalVisible, setModalVisible] = useState(false);

    // Dynamic Summary Fetching State
    const initialSummary = Array.isArray(post.summary)
        ? post.summary
        : typeof post.summary === 'string'
            ? post.summary.split('\n').filter(Boolean)
            : [];

    const [summaryList, setSummaryList] = useState<string[]>(initialSummary);
    const [loadingSummary, setLoadingSummary] = useState(false);

    const isPlaceholderSummary = !summaryList || summaryList.length === 0 || summaryList[0]?.startsWith("Generating");

    useEffect(() => {
        // Skip auto-summary on web — the local backend IP is unreachable from the browser
        if (Platform.OS === 'web') return;
        if (isActive && isPlaceholderSummary && !loadingSummary && !isVideo) {
            handleFetchSummary();
        }
    }, [isActive]);

    const handleFetchSummary = async () => {
        if (summaryList.length > 0 && !isPlaceholderSummary) return;
        if (Platform.OS === 'web') return; // Extra guard

        setLoadingSummary(true);
        try {
            const contentToSummarize = post.snippet || post.caption;
            const backendSummary = await summarizePost(post.title, contentToSummarize, post.sourceId);
            if (backendSummary && backendSummary.length > 0) {
                setSummaryList(backendSummary);
            } else {
                setSummaryList(["No summary available for this article."]);
            }
        } catch (e: any) {
            console.warn("Summary fetch error:", e?.message);
            setSummaryList(["Summary unavailable."]);
        }
        setLoadingSummary(false);
    };

    // Format time ago
    const diff = Date.now() - new Date(post.createdAt || Date.now()).getTime();
    const hours = Math.floor(diff / 3600000);
    const timeAgo = hours < 1 ? "just now" : hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;

    // Ensure embedUrl is a full, valid embed link
    let computedEmbedUrl = post.embedUrl || '';

    // Helper: extract a YouTube video ID from any YouTube URL format
    const extractYoutubeId = (urlOrId: string): string | null => {
        if (!urlOrId) return null;
        // Already a bare 11-char ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
        // youtube.com/shorts/ID or youtube.com/embed/ID or youtube.com/watch?v=ID or youtu.be/ID
        const patterns = [
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        ];
        for (const p of patterns) {
            const m = urlOrId.match(p);
            if (m) return m[1];
        }
        return null;
    };

    // If embedUrl is already a valid YouTube embed URL, use it directly
    if (computedEmbedUrl.includes('youtube.com/embed/')) {
        // Already correct format — just ensure autoplay
        if (!computedEmbedUrl.includes('autoplay')) {
            computedEmbedUrl += (computedEmbedUrl.includes('?') ? '&' : '?') + 'autoplay=1&playsinline=1';
        }
    } else if (isTiktok) {
        // TikTok: use sourceId as the numeric TikTok video ID
        const tiktokId = post.sourceId || '';
        computedEmbedUrl = `https://www.tiktok.com/player/v1/${tiktokId}`;
    } else if (isShort || post.source === 'youtube') {
        // YouTube: extract the 11-char video ID from any URL format
        const ytId = extractYoutubeId(computedEmbedUrl) || extractYoutubeId(post.sourceId) || extractYoutubeId(post.url || '');
        if (ytId) {
            computedEmbedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=1&playsinline=1`;
        } else {
            computedEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'; // Fallback
        }
    } else if (!computedEmbedUrl.startsWith('http')) {
        computedEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'; // Ultimate fallback
    }

    return (
        <View style={{ width, height: feedHeight, justifyContent: 'center', alignItems: 'center' }}>
            <View style={s.card}>
                {isVideo ? (
                    <View style={s.videoContainer}>
                        {/* Embedded Video Player */}
                        {isActive ? (
                            <VideoPlayer uri={computedEmbedUrl} isShort={isShort} />
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={s.playBtn}>
                                    <Play size={32} color="white" />
                                </View>
                            </View>
                        )}

                        {/* Video Overlay */}
                        <View style={s.videoOverlay}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <View style={[s.sourceBadge, { backgroundColor: isTiktok ? 'rgba(34,211,238,0.15)' : 'rgba(248,113,113,0.15)' }]}>
                                    {isTiktok ? <Music size={12} color="#22d3ee" /> : <Play size={12} color="#f87171" />}
                                    <Text style={{ fontSize: 11, fontWeight: '500', color: isTiktok ? '#22d3ee' : '#f87171' }}>
                                        {isTiktok ? 'TikTok' : isShort ? 'Short' : 'Video'}
                                    </Text>
                                </View>
                                <Text style={s.timeText}>{timeAgo}</Text>
                            </View>
                            <Text selectable={true} style={s.videoTitle} numberOfLines={2}>{post.title}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                {post.tags?.slice(0, 3).map((tag: string) => (
                                    <View key={tag} style={s.videoTag}>
                                        <Text style={s.videoTagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={s.articleContainer}>
                        {/* Meta row - matched directly from web style */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <View style={s.articleBadge}>
                                <BookOpen size={12} color="#fbbf24" />
                                <Text style={s.articleBadgeText}>{post.sourceName || "Article"}</Text>
                            </View>
                            <Text style={{ fontSize: 11, color: 'rgba(250,250,250,0.2)' }}>·</Text>
                            <Text style={s.timeText}>{timeAgo}</Text>

                            {/* Read Time addition */}
                            {post.readTime && (
                                <>
                                    <Text style={{ fontSize: 11, color: 'rgba(250,250,250,0.2)' }}>·</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} color="rgba(250,250,250,0.4)" />
                                        <Text style={s.timeText}>{post.readTime} min read</Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Caption / engagement stats - sits under meta row */}
                        {post.caption && (
                            <Text numberOfLines={1} style={s.caption}>{post.caption}</Text>
                        )}

                        {/* Tags */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                            {post.tags?.map((tag: string) => (
                                <View key={tag} style={s.tag}>
                                    <Text style={s.tagText}>{tag.toUpperCase()}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Title - matched bold tracking-tight from web, clamped to 4 lines */}
                        <Text selectable={true} numberOfLines={4} style={s.articleTitle}>{post.title}</Text>

                        <View style={s.divider} />

                        {/* Content Area wraps Snippet. Use flex-shrink so it doesn't push buttons out */}
                        <View style={{ flex: 1, flexShrink: 1, marginBottom: 16 }}>
                            {post.snippet && (
                                <Text numberOfLines={8} style={s.snippet}>
                                    {highlightTextFunction(post.snippet)}
                                </Text>
                            )}
                        </View>

                        {/* Bottom Sticky Action Buttons - side by side */}
                        <View style={s.bottomActions}>
                            {/* Read full article */}
                            <TouchableOpacity style={s.actionBtn}>
                                <Text style={s.actionBtnText}>Read article</Text>
                                <ExternalLink size={14} color="#fafafa" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={loadingSummary || isPlaceholderSummary}
                                onPress={() => setModalVisible(true)}
                                style={s.summaryBtn}
                            >
                                {loadingSummary ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <ActivityIndicator size="small" color="rgba(250,250,250,0.5)" />
                                        <Text style={s.summaryBtnText}>Summarizing</Text>
                                    </View>
                                ) : isPlaceholderSummary ? (
                                    <Text style={s.summaryBtnText}>No Summary</Text>
                                ) : (
                                    <>
                                        <Text style={s.summaryBtnText}>AI Summary</Text>
                                        <ChevronDown size={14} color="rgba(250,250,250,0.5)" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* AI Summary Modal */}
            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>AI Summary</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={s.modalClose}>
                                <X size={16} color="#fafafa" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {summaryList.length > 0 ? (
                                summaryList.map((point: string, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', marginBottom: 12 }}>
                                        <Text style={{ color: 'rgba(250,250,250,0.4)', fontSize: 15, marginRight: 8, marginTop: 2 }}>{i + 1}.</Text>
                                        <Text style={s.modalText}>{highlightTextFunction(point)}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={s.modalText}>No AI summary available for this post yet.</Text>
                            )}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    card: { flex: 1, width: '100%', backgroundColor: '#09090b', position: 'relative', overflow: 'hidden' },
    videoContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
    playBtn: { height: 80, width: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    videoPlaceholder: { color: 'white', marginTop: 16, fontWeight: '500', fontSize: 16 },
    videoNote: { color: 'rgba(255,255,255,0.4)', marginTop: 8, fontSize: 12 },
    videoOverlay: { position: 'absolute', bottom: 100, left: 0, right: 0, paddingHorizontal: 20 },
    sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    timeText: { fontSize: 12, fontWeight: '500', color: 'rgba(250,250,250,0.4)' },
    videoTitle: { fontSize: 22, fontWeight: '700', color: '#fafafa', letterSpacing: -0.5 },
    videoTag: { backgroundColor: 'rgba(250,250,250,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    videoTagText: { fontSize: 10, color: 'rgba(250,250,250,0.6)' },
    articleContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#09090b', paddingHorizontal: 20, paddingTop: 100, paddingBottom: 100 },
    articleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(251,191,36,0.1)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    articleBadgeText: { fontSize: 12, fontWeight: '600', color: '#fbbf24' },
    tag: { backgroundColor: 'rgba(250,250,250,0.05)', borderWidth: 1, borderColor: 'rgba(250,250,250,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    tagText: { fontSize: 10, fontWeight: '600', color: 'rgba(250,250,250,0.5)', letterSpacing: 0.5 },
    articleTitle: { fontSize: 24, fontWeight: '800', color: '#fafafa', lineHeight: 30, letterSpacing: -0.5, marginBottom: 12 },
    divider: { height: 1, width: 48, backgroundColor: 'rgba(250,250,250,0.15)', marginBottom: 20 },
    snippet: { fontSize: 16, color: 'rgba(250,250,250,0.7)', lineHeight: 26, fontWeight: '400' },
    caption: { fontSize: 12, color: 'rgba(250,250,250,0.4)', fontStyle: 'italic', marginBottom: 8 },
    highlightedWord: { backgroundColor: 'rgba(251,191,36,0.15)', color: '#fcd34d', fontWeight: '500' },
    bottomActions: { marginTop: 'auto', paddingTop: 12, flexDirection: 'row', gap: 10 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(250,250,250,0.05)', borderWidth: 1, borderColor: 'rgba(250,250,250,0.1)', paddingVertical: 12, borderRadius: 8 },
    actionBtnText: { fontSize: 13, fontWeight: '500', color: 'rgba(250,250,250,0.8)' },
    summaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(250,250,250,0.05)', borderWidth: 1, borderColor: 'rgba(250,250,250,0.1)', paddingVertical: 12, borderRadius: 8 },
    summaryBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(250,250,250,0.6)' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#09090b', width: '100%', height: '60%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: 'rgba(250,250,250,0.1)' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#fafafa', letterSpacing: -0.3 },
    modalClose: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(250,250,250,0.1)' },
    modalText: { fontSize: 15, color: 'rgba(250,250,250,0.8)', lineHeight: 24, fontWeight: '400', marginBottom: 24 },
});
