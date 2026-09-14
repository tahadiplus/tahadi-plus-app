import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const questions = [
  {
    question: 'پایتەختی هەرێمی کوردستان کام شارە؟',
    answers: ['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکووک'],
    correct: 0,
  },
  {
    question: 'لە یاری تۆپی پێدا هەر تیمێک چەند یاریزان لە مەیداندا هەیە؟',
    answers: ['٩', '١٠', '١١', '١٢'],
    correct: 2,
  },
  {
    question: 'کامەیان گەورەترین کیشوەری جیهانە؟',
    answers: ['ئەفریقا', 'ئاسیا', 'ئەوروپا', 'ئۆسترالیا'],
    correct: 1,
  },
];

const modes = [
  {
    key: 'pk',
    icon: '⚔️',
    title: 'PK',
    subtitle: '١ بەرامبەر ١ ـ هاوڕێکت بانگ بکە',
    color: '#FFE6E6',
  },
  {
    key: 'tahadi',
    icon: '🔥',
    title: 'تەحەدی',
    subtitle: 'پرسیار و وەڵام و کۆکردنەوەی خاڵ',
    color: '#EAE6FF',
  },
  {
    key: 'konkan',
    icon: '🏆',
    title: 'کۆنکان',
    subtitle: 'ڕکابەری گرووپی و پلەبەندی',
    color: '#FFF3D6',
  },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null);
  const [score, setScore] = useState(120);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [pkYou, setPkYou] = useState(0);
  const [pkOpponent, setPkOpponent] = useState(0);
  const [feedback, setFeedback] = useState('');

  const openMode = (selectedMode) => {
    setMode(selectedMode);
    setFeedback('');
    setQuestionIndex(0);
    setScreen(selectedMode.key === 'pk' ? 'pk' : 'quiz');
  };

  const answerQuestion = (index) => {
    const current = questions[questionIndex];
    const isCorrect = index === current.correct;
    setFeedback(isCorrect ? '✅ وەڵامی ڕاست!' : '❌ وەڵامی هەڵە');
    if (isCorrect) setScore((value) => value + 10);

    setTimeout(() => {
      setFeedback('');
      setQuestionIndex((value) => (value + 1) % questions.length);
    }, 650);
  };

  const pkAnswer = (index) => {
    const current = questions[questionIndex];
    if (index === current.correct) {
      setPkYou((value) => value + 1);
      setScore((value) => value + 10);
      setFeedback('✅ خاڵێکت بردەوە');
    } else {
      setPkOpponent((value) => value + 1);
      setFeedback('❌ خاڵ بۆ ڕکابەر');
    }

    setTimeout(() => {
      setFeedback('');
      setQuestionIndex((value) => (value + 1) % questions.length);
    }, 650);
  };

  const goHome = () => {
    setScreen('home');
    setMode(null);
    setFeedback('');
  };

  const renderQuestion = (onAnswer) => {
    const current = questions[questionIndex];
    return (
      <>
        <View style={styles.progressRow}>
          <Text style={styles.muted}>پرسیار {questionIndex + 1}/{questions.length}</Text>
          <Text style={styles.points}>⭐ {score} خاڵ</Text>
        </View>
        <Text style={styles.question}>{current.question}</Text>
        {current.answers.map((answer, index) => (
          <TouchableOpacity key={`${answer}-${index}`} style={styles.answer} onPress={() => onAnswer(index)}>
            <Text style={styles.answerText}>{answer}</Text>
          </TouchableOpacity>
        ))}
        {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />

      {screen === 'home' && (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logo}><Text style={styles.logoText}>T+</Text></View>
            <View style={styles.headerText}>
              <Text style={styles.welcome}>بەخێربێیت</Text>
              <Text style={styles.title}>Tahadi Plus</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heroMini}>🎮 یارییەکەت هەڵبژێرە</Text>
            <Text style={styles.heroTitle}>ڕکابەری، تەحەدی، بردنەوە</Text>
            <Text style={styles.heroBody}>PK بکە، تەحەدی بکە و خاڵەکانت زیاد بکە.</Text>
          </View>

          <View style={styles.statsBox}>
            <View style={styles.stat}><Text style={styles.statValue}>{score}</Text><Text style={styles.statLabel}>خاڵ</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>7</Text><Text style={styles.statLabel}>بردنەوە</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>3</Text><Text style={styles.statLabel}>ڕۆژ</Text></View>
          </View>

          <Text style={styles.sectionTitle}>یارییەکان</Text>
          {modes.map((item) => (
            <TouchableOpacity key={item.key} style={[styles.modeCard, { backgroundColor: item.color }]} onPress={() => openMode(item)}>
              <Text style={styles.modeIcon}>{item.icon}</Text>
              <View style={styles.modeCopy}>
                <Text style={styles.modeTitle}>{item.title}</Text>
                <Text style={styles.modeSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>‹</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {screen === 'quiz' && (
        <ScrollView contentContainerStyle={styles.gameContainer}>
          <TouchableOpacity onPress={goHome}><Text style={styles.back}>← گەڕانەوە</Text></TouchableOpacity>
          <View style={[styles.modeBadge, { backgroundColor: mode?.color }]}><Text style={styles.modeBadgeIcon}>{mode?.icon}</Text></View>
          <Text style={styles.gameTitle}>{mode?.title}</Text>
          {renderQuestion(answerQuestion)}
        </ScrollView>
      )}

      {screen === 'pk' && (
        <ScrollView contentContainerStyle={styles.gameContainer}>
          <TouchableOpacity onPress={goHome}><Text style={styles.back}>← گەڕانەوە</Text></TouchableOpacity>
          <Text style={styles.pkTitle}>⚔️ PK</Text>
          <View style={styles.pkScoreBox}>
            <View style={styles.player}><Text style={styles.playerName}>تۆ</Text><Text style={styles.playerScore}>{pkYou}</Text></View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.player}><Text style={styles.playerName}>ڕکابەر</Text><Text style={styles.playerScore}>{pkOpponent}</Text></View>
          </View>
          <Text style={styles.pkHint}>هەر وەڵامێکی ڕاست = ١ خاڵ</Text>
          {renderQuestion(pkAnswer)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FC' },
  container: { padding: 20, paddingBottom: 36 },
  gameContainer: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  logo: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#5B3DF5', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerText: { flex: 1, marginLeft: 12 },
  welcome: { textAlign: 'right', color: '#8B8FA1', fontSize: 13 },
  title: { textAlign: 'right', color: '#171826', fontSize: 24, fontWeight: '900' },
  hero: { backgroundColor: '#5B3DF5', borderRadius: 28, padding: 22 },
  heroMini: { textAlign: 'right', color: '#DCD5FF', fontWeight: '800' },
  heroTitle: { textAlign: 'right', color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 10 },
  heroBody: { textAlign: 'right', color: '#EAE6FF', fontSize: 14, lineHeight: 22, marginTop: 8 },
  statsBox: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginTop: 16, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 19, fontWeight: '900', color: '#1B1C29' },
  statLabel: { fontSize: 11, color: '#9599A9', marginTop: 3 },
  sectionTitle: { textAlign: 'right', fontSize: 20, fontWeight: '900', color: '#1B1C29', marginTop: 24, marginBottom: 12 },
  modeCard: { flexDirection: 'row', alignItems: 'center', padding: 16, minHeight: 82, borderRadius: 21, marginBottom: 11 },
  modeIcon: { fontSize: 31 },
  modeCopy: { flex: 1, marginHorizontal: 13 },
  modeTitle: { textAlign: 'right', fontSize: 18, fontWeight: '900', color: '#222330' },
  modeSubtitle: { textAlign: 'right', marginTop: 4, fontSize: 12, color: '#6F7383' },
  chevron: { fontSize: 31, color: '#555868' },
  back: { color: '#5B3DF5', fontWeight: '900', marginBottom: 22, textAlign: 'right' },
  modeBadge: { width: 92, height: 92, borderRadius: 30, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  modeBadgeIcon: { fontSize: 44 },
  gameTitle: { textAlign: 'center', fontSize: 29, fontWeight: '900', color: '#1B1C29', marginTop: 14, marginBottom: 20 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  muted: { color: '#9498A8', fontSize: 12 },
  points: { color: '#5B3DF5', fontWeight: '900', fontSize: 12 },
  question: { textAlign: 'right', color: '#242634', fontSize: 21, fontWeight: '900', lineHeight: 33, marginBottom: 20 },
  answer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E3E5EC', borderRadius: 17, paddingVertical: 17, paddingHorizontal: 18, marginBottom: 11 },
  answerText: { textAlign: 'right', fontSize: 17, fontWeight: '800', color: '#303240' },
  feedback: { textAlign: 'center', fontSize: 16, fontWeight: '900', marginTop: 10, color: '#343645' },
  pkTitle: { textAlign: 'center', fontSize: 31, fontWeight: '900', color: '#1B1C29', marginBottom: 18 },
  pkScoreBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 10 },
  player: { flex: 1, alignItems: 'center' },
  playerName: { color: '#6E7281', fontSize: 13, fontWeight: '800' },
  playerScore: { color: '#1B1C29', fontSize: 34, fontWeight: '900', marginTop: 6 },
  vs: { color: '#5B3DF5', fontWeight: '900', fontSize: 17 },
  pkHint: { textAlign: 'center', color: '#8D91A2', marginBottom: 20, fontSize: 12 },
});
