import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const challenges = [
  { icon: '⚽️', title: 'وەرزش', subtitle: 'پرسیاری خێرا لەسەر تۆپی پێ', color: '#DDF7E7' },
  { icon: '🧠', title: 'زانیاری گشتی', subtitle: 'زانیاری خۆت تاقی بکەرەوە', color: '#E7E5FF' },
  { icon: '🎬', title: 'فیلم و موزیک', subtitle: 'ناوی فیلم یان گۆرانی بڵێ', color: '#FFE8DC' },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [score, setScore] = useState(120);
  const [activeChallenge, setActiveChallenge] = useState(null);

  const startChallenge = (challenge) => {
    setActiveChallenge(challenge);
    setScreen('challenge');
  };

  const finishChallenge = () => {
    setScore((current) => current + 10);
    setScreen('home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <View style={styles.app}>
        {screen === 'home' ? (
          <>
            <View style={styles.header}>
              <View style={styles.avatar}><Text style={styles.avatarText}>T+</Text></View>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>بەخێربێیتەوە</Text>
                <Text style={styles.name}>Tahadi Plus</Text>
              </View>
            </View>

            <View style={styles.hero}>
              <Text style={styles.heroBadge}>🔥 تەحەدای ئەمڕۆ</Text>
              <Text style={styles.heroTitle}>ئامادەی بۆ بردنەوە؟</Text>
              <Text style={styles.heroText}>هاوڕێکانت بانگ بکە و بە زیرەکی خاڵ کۆبکەرەوە.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => startChallenge(challenges[1])}>
                <Text style={styles.primaryButtonText}>دەست پێ بکە</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{score}</Text>
                <Text style={styles.statLabel}>خاڵ</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>بردنەوە</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>ڕۆژ بەردەوام</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>جۆری تەحەدا هەڵبژێرە</Text>
            <View style={styles.cards}>
              {challenges.map((challenge) => (
                <TouchableOpacity
                  key={challenge.title}
                  style={[styles.card, { backgroundColor: challenge.color }]}
                  onPress={() => startChallenge(challenge)}
                >
                  <Text style={styles.cardIcon}>{challenge.icon}</Text>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{challenge.title}</Text>
                    <Text style={styles.cardSubtitle}>{challenge.subtitle}</Text>
                  </View>
                  <Text style={styles.arrow}>‹</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.challengeScreen}>
            <TouchableOpacity style={styles.back} onPress={() => setScreen('home')}>
              <Text style={styles.backText}>گەڕانەوە ←</Text>
            </TouchableOpacity>
            <View style={[styles.challengeIcon, { backgroundColor: activeChallenge?.color }]}>
              <Text style={styles.challengeEmoji}>{activeChallenge?.icon}</Text>
            </View>
            <Text style={styles.challengeTitle}>{activeChallenge?.title}</Text>
            <Text style={styles.question}>پایتەختی هەرێمی کوردستان کام شارە؟</Text>
            {['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکووک'].map((answer, index) => (
              <TouchableOpacity
                key={answer}
                style={styles.answer}
                onPress={index === 0 ? finishChallenge : undefined}
              >
                <Text style={styles.answerText}>{answer}</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.hint}>وەڵامی ڕاست ١٠ خاڵ زیاد دەکات</Text>
          </View>
        )}

        {screen === 'home' && (
          <View style={styles.nav}>
            <View style={styles.navItem}><Text style={styles.navIcon}>⌂</Text><Text style={styles.navActive}>سەرەکی</Text></View>
            <View style={styles.navItem}><Text style={styles.navIcon}>♛</Text><Text style={styles.navLabel}>پلەبەندی</Text></View>
            <View style={styles.navItem}><Text style={styles.navIcon}>●</Text><Text style={styles.navLabel}>هەژمار</Text></View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FC' },
  app: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#5B3DF5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  headerCopy: { flex: 1, marginLeft: 12 },
  eyebrow: { color: '#85899A', fontSize: 13, textAlign: 'right' },
  name: { color: '#171826', fontSize: 21, fontWeight: '800', textAlign: 'right' },
  hero: { backgroundColor: '#5B3DF5', borderRadius: 28, padding: 22, shadowColor: '#5B3DF5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 7 },
  heroBadge: { color: '#DCD5FF', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  heroTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '900', marginTop: 10, textAlign: 'right' },
  heroText: { color: '#E8E4FF', fontSize: 14, lineHeight: 22, marginTop: 6, textAlign: 'right' },
  primaryButton: { backgroundColor: '#FFFFFF', borderRadius: 15, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  primaryButtonText: { color: '#5B3DF5', fontSize: 16, fontWeight: '800' },
  stats: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 15, marginTop: 17, alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#171826', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#969AAB', fontSize: 11, marginTop: 3 },
  divider: { width: 1, height: 30, backgroundColor: '#EBECF1' },
  sectionTitle: { color: '#171826', fontSize: 18, fontWeight: '900', textAlign: 'right', marginTop: 21, marginBottom: 10 },
  cards: { gap: 9 },
  card: { minHeight: 74, borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 30 },
  cardCopy: { flex: 1, marginHorizontal: 12 },
  cardTitle: { color: '#222331', fontSize: 16, fontWeight: '800', textAlign: 'right' },
  cardSubtitle: { color: '#707487', fontSize: 12, marginTop: 3, textAlign: 'right' },
  arrow: { color: '#4B4D5A', fontSize: 28 },
  nav: { marginTop: 'auto', marginBottom: 8, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#E6E7ED', flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', minWidth: 70 },
  navIcon: { color: '#5B3DF5', fontSize: 19, fontWeight: '900' },
  navActive: { color: '#5B3DF5', fontSize: 11, fontWeight: '800', marginTop: 2 },
  navLabel: { color: '#9A9EAD', fontSize: 11, marginTop: 2 },
  challengeScreen: { flex: 1, paddingTop: 8 },
  back: { alignSelf: 'flex-end', paddingVertical: 10 },
  backText: { color: '#5B3DF5', fontWeight: '800' },
  challengeIcon: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 35 },
  challengeEmoji: { fontSize: 42 },
  challengeTitle: { color: '#171826', fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 16 },
  question: { color: '#282A38', fontSize: 21, fontWeight: '800', lineHeight: 33, textAlign: 'center', marginVertical: 28 },
  answer: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5EC', borderRadius: 17, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 10 },
  answerText: { color: '#313341', fontSize: 17, fontWeight: '700', textAlign: 'right' },
  hint: { color: '#979BAA', fontSize: 12, textAlign: 'center', marginTop: 12 },
});
