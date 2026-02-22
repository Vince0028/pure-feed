import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, StyleSheet, Image, ViewToken } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchFeed, FeedPost } from './src/lib/api';
import { FeedCard } from './src/components/FeedCard';
import { mockPosts } from './src/data/mockPosts';

const { height, width } = Dimensions.get('window');

export default function App() {
    const [filter, setFilter] = useState("articles");
    const [posts, setPosts] = useState<any[]>(mockPosts);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [feedHeight, setFeedHeight] = useState(height); // Default to screen height
    const flatListRef = useRef<FlatList>(null);

    // MUST be stable refs — inline definitions cause infinite re-render crash
    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index!);
        }
    }, []);

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        const supabaseData = await fetchFeed();

        // Merge: Supabase data takes priority, then fill in with mockPosts
        const seenIds = new Set<string>();
        const merged: any[] = [];

        // Add all Supabase posts first (they take priority)
        for (const p of (supabaseData || [])) {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                merged.push(p);
            }
        }

        // Then add mockPosts that aren't already in Supabase
        for (const p of mockPosts) {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                merged.push(p);
            }
        }

        setPosts(merged);
        setLoading(false);
    };

    const filteredPosts = useMemo(() => {
        const typed = posts.filter((p: any) => {
            if (filter === 'articles') return p.contentType === 'article';
            if (filter === 'videos') return p.contentType === 'video';
            if (filter === 'shorts') return p.contentType === 'short';
            return true;
        });

        // Deduplicate
        const uniqueIds = new Set<string>();
        const uniquePosts: any[] = [];
        for (const p of typed) {
            if (p.sourceId === "https://tiktok.com" || p.sourceId === "https://youtube.com/shorts" || (typeof p.sourceId === 'string' && p.sourceId.includes("mock"))) {
                uniquePosts.push(p);
            } else if (!uniqueIds.has(p.sourceId)) {
                uniqueIds.add(p.sourceId);
                uniquePosts.push(p);
            }
        }

        if (filter === "shorts") {
            const tiktok = uniquePosts.filter(p => p.source === "tiktok").sort(() => Math.random() - 0.5);
            const youtube = uniquePosts.filter(p => p.source === "youtube").sort(() => Math.random() - 0.5);
            return [...tiktok, ...youtube];
        } else if (filter === "articles") {
            const getFame = (p: any) => {
                if (typeof p.fameScore === 'number') return p.fameScore;
                let hash = 0;
                for (let i = 0; i < p.id.length; i++) hash += p.id.charCodeAt(i);
                return 10 + (hash % 85);
            };
            return [...uniquePosts].sort((a, b) => getFame(b) - getFame(a));
        } else {
            return [...uniquePosts].sort(() => Math.random() - 0.5);
        }
    }, [filter, posts]);

    const handleScrollTo = (dir: 'up' | 'down') => {
        let nextIndex = dir === 'down' ? activeIndex + 1 : activeIndex - 1;
        nextIndex = Math.max(0, Math.min(nextIndex, filteredPosts.length - 1));
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setActiveIndex(nextIndex);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Top Filter Tabs */}
            <View style={styles.topBar}>
                <View style={styles.tabRow}>
                    {["articles", "shorts", "videos"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => {
                                setFilter(tab);
                                setActiveIndex(0);
                                flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
                            }}
                            style={[styles.tab, filter === tab && styles.tabActive]}
                        >
                            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Main Feed */}
            <View
                style={styles.feedContainer}
                onLayout={(e) => {
                    // Update feedHeight to the exact pixel height available minus padding/safe areas
                    setFeedHeight(e.nativeEvent.layout.height);
                }}
            >
                {loading && filteredPosts.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.loadingText}>Loading feed...</Text>
                    </View>
                ) : filteredPosts.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>No {filter} found</Text>
                    </View>
                ) : feedHeight > 0 ? (
                    <FlatList
                        key={filter} // Force unmount/remount on tab switch to fix Web layout bugs
                        ref={flatListRef}
                        data={filteredPosts}
                        keyExtractor={(item: any) => item.id}
                        initialNumToRender={3}
                        windowSize={5}
                        maxToRenderPerBatch={3}
                        pagingEnabled
                        showsVerticalScrollIndicator={false}
                        snapToInterval={feedHeight}
                        snapToAlignment="start"
                        disableIntervalMomentum={true}
                        decelerationRate="fast"
                        viewabilityConfig={viewabilityConfig}
                        onViewableItemsChanged={onViewableItemsChanged}
                        renderItem={({ item, index }: { item: any; index: number }) => (
                            <FeedCard post={item} isActive={index === activeIndex} feedHeight={feedHeight} />
                        )}
                        getItemLayout={(_, index) => ({
                            length: feedHeight,
                            offset: feedHeight * index,
                            index,
                        })}
                    />
                ) : null}
            </View>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.brandRow}>
                    <Image source={require('./assets/nofluff_logo.png')} style={styles.logoImg} />
                    <Text style={styles.brandText}>
                        NoFluff<Text style={styles.brandSub}>.ai</Text>
                    </Text>
                </View>

                {/* Post Counter */}
                <View style={styles.counterBox}>
                    <Text style={styles.counterTextActive}>{activeIndex + 1}</Text>
                    <Text style={styles.counterText}> / {filteredPosts.length}</Text>
                </View>

                <View style={styles.navButtons}>
                    <TouchableOpacity onPress={() => handleScrollTo('up')} style={styles.navButton}>
                        <ChevronUp size={20} color="#fafafa" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleScrollTo('down')} style={styles.navButton}>
                        <ChevronDown size={20} color="#fafafa" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    topBar: { position: 'absolute', top: 50, width: '100%', zIndex: 50, paddingVertical: 8, alignItems: 'center' },
    tabRow: { flexDirection: 'row', gap: 8 },
    tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(250,250,250,0.1)' },
    tabActive: { backgroundColor: '#fafafa' },
    tabText: { fontSize: 13, fontWeight: '500', color: 'rgba(250,250,250,0.7)' },
    tabTextActive: { color: '#09090b' },
    feedContainer: { flex: 1, backgroundColor: '#09090b' },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: 'rgba(250,250,250,0.5)', marginTop: 12, fontSize: 14 },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', zIndex: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 40, backgroundColor: 'rgba(9,9,11,0.85)', borderTopWidth: 1, borderTopColor: 'rgba(250,250,250,0.08)' },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    logoImg: { height: 28, width: 28, borderRadius: 7 },
    brandText: { fontSize: 14, fontWeight: '600', color: '#fafafa' },
    brandSub: { color: 'rgba(250,250,250,0.6)', fontWeight: '400' },
    counterBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(250,250,250,0.05)', borderWidth: 1, borderColor: 'rgba(250,250,250,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    counterTextActive: { color: 'rgba(250,250,250,0.9)', fontSize: 11, fontWeight: '600', fontFamily: 'monospace' },
    counterText: { color: 'rgba(250,250,250,0.5)', fontSize: 11, fontFamily: 'monospace' },
    navButtons: { flexDirection: 'row', gap: 8 },
    navButton: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(250,250,250,0.2)', backgroundColor: 'rgba(9,9,11,0.5)' },
});
