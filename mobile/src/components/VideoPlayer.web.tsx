import React, { createElement } from 'react';
import { View } from 'react-native';

export function VideoPlayer({ uri, isShort }: { uri: string, isShort?: boolean }) {
    return (
        <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#000' }}>
            {createElement('iframe', {
                src: uri,
                style: {
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#000',
                },
                allowFullScreen: true,
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
            })}
        </View>
    );
}
