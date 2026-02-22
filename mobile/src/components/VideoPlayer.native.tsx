import React, { useState, useCallback } from 'react';
import { View, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

export function VideoPlayer({ uri, isShort }: { uri: string, isShort?: boolean }) {
    const isYoutube = uri.includes('youtube.com') || uri.includes('youtu.be');
    // If it's a short, make it tall (16:9 vertical). Otherwise standard video (16:9 horizontal).
    const [videoHeight, setVideoHeight] = useState(isShort ? width * (16 / 9) : width * (9 / 16));

    // Extract exactly the 11 character ID for the YoutubePlayer component
    let ytId = '';
    if (isYoutube) {
        const match = uri.match(/(?:embed\/|v=|vi\/|v\/|youtu\.be\/|\/v\/|^https?:\/\/(?:www\.)?youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([^?&\"'>]+)/);
        ytId = match ? match[1] : '';
    }

    return (
        <View style={{ flex: 1, width: '100%', backgroundColor: '#000' }}>
            {isYoutube && ytId ? (
                // Shift standard landscape videos up by 80px to account for bottom text overlay
                <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: !isShort ? -80 : 0 }}>
                    <View style={{ width: '100%', height: videoHeight }}>
                        <YoutubePlayer
                            height={videoHeight}
                            play={true}
                            videoId={ytId}
                            initialPlayerParams={{
                                controls: false,
                                preventFullScreen: true,
                                loop: true,
                                modestbranding: true,
                                rel: false
                            }}
                        />
                    </View>
                </View>
            ) : (
                <WebView
                    source={{ uri }}
                    style={{ flex: 1, width: '100%' }}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scrollEnabled={false}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                            <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                    )}
                    onError={(e) => console.warn('WebView error:', e.nativeEvent.description)}
                />
            )}
        </View>
    );
}
