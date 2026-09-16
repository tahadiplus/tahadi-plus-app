import React from 'react';
import { StyleSheet, View } from 'react-native';

/** A code-native flag: red, white and green stripes with a 21-ray gold sun. */
export default function KurdistanFlag({ width = 54, height = 36 }) {
  const scale = width / 54;
  const radius = 6.6 * scale;
  const rayLength = 6.5 * scale;
  const rayWidth = 1.5 * scale;
  const middleX = width / 2;
  const middleY = height / 2;
  return <View accessibilityLabel="ئاڵای کوردستان" style={[styles.flag, { width, height, borderRadius: 3 * scale }]}>
    <View style={[styles.stripe, { backgroundColor: '#E53236' }]} />
    <View style={[styles.stripe, { backgroundColor: '#FFFFFF' }]} />
    <View style={[styles.stripe, { backgroundColor: '#159A49' }]} />
    {Array.from({ length: 21 }, (_, index) => {
      const angle = index * 360 / 21;
      const radians = angle * Math.PI / 180;
      return <View key={index} style={{ position: 'absolute', backgroundColor: '#F3BC28',
        width: rayWidth, height: rayLength, borderRadius: rayWidth / 2,
        left: middleX + Math.sin(radians) * (radius + rayLength / 2) - rayWidth / 2,
        top: middleY - Math.cos(radians) * (radius + rayLength / 2) - rayLength / 2,
        transform: [{ rotate: `${angle}deg` }] }} />;
    })}
    <View style={{ position: 'absolute', left: middleX - radius, top: middleY - radius,
      width: radius * 2, height: radius * 2, borderRadius: radius, backgroundColor: '#F3BC28' }} />
  </View>;
}

const styles = StyleSheet.create({
  flag: { overflow: 'hidden', borderWidth: 1, borderColor: '#C9AD72' },
  stripe: { flex: 1 },
});
