import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const questions = [
  { question: 'پایتەختی هەرێمی کوردستان کام شارە؟', answers: ['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکووک'], correct: 0 },
  { question: 'لە یاری تۆپی پێدا هەر تیمێک چەند یاریزان لە مەیداندا هەیە؟', answers: ['٩', '١٠', '١١', '١٢'], correct: 2 },
  { question: 'کامەیان گەورەترین کیشوەری جیهانە؟', answers: ['ئەفریقا', 'ئاسیا', 'ئەوروپا', 'ئۆسترالیا'], correct: 1 },
  { question: 'کامەیان پلانیەتێکی سیستەمی خۆرە؟', answers: ['مانگ', 'مەریخ', 'ئەنتارکتیکا', 'نیل'], correct: 1 },
  { question: '٢ + ٨ × ٢ چەندە؟', answers: ['٢٠', '١٨', '١٦', '١٢'], correct: 1 },
  { question: 'کام ئاژەڵ خێراترینە لەسەر وشکانی؟', answers: ['شێر', 'چیتا', 'ئەسپ', 'پڵنگ'], correct: 1 },
  { question: 'ئاو لە پلەی چەنددا دەبەستێت؟', answers: ['٠°C', '١٠°C', '٥٠°C', '١٠٠°C'], correct: 0 },
];

const modes = [
  { key: 'pk', icon: '⚔️', title: 'PK', subtitle: '١ بەرامبەر ١ ـ ٥ ڕاوەند و تایمەر', color: '#FFE6E6' },
  { key: 'tahadi', icon: '🔥', title: 'تەحەدی', subtitle: 'پرسیار و وەڵام و کۆکردنەوەی خاڵ', color: '#EAE6FF' },
  { key: 'konkan', icon: '🏆', title: 'کۆنکان', subtitle: 'ڕکابەری گرووپی و پلەبەندی', color: '#FFF3D6' },
];

const PK_ROUNDS = 5;
const PK_SECONDS = 10;

export default function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null);
  const [score, setScore] = useState(120);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [locked, setLocked] = useState(false);

  const [pkYou, setPkYou] = useState(0);
  const [pkOpponent, setPkOpponent] = useState(0);
  const [pkRound, setPkRound] = useState(1);
  const [pkTime, setPkTime] = useState(PK_SECONDS);
  const [pkFinished, setPkFinished] = useState(false);

  const currentQuestion = questions[questionIndex % questions.length];

  const pkWinner = useMemo(() => {
    if (pkYou > pkOpponent) return 'تۆ بردتەوە 🎉';
    if (pkYou < pkOpponent) return 'ڕکابەر بردی 😅';
    return 'یارییەکە یەکسان بوو 🤝';
  }, [pkYou, pkOpponent]);

  useEffect(() => {
    if (screen !== 'pk' || pkFinished || locked) return undefined;
    const timer = setInterval(() => {
      setPkTime((value) => {
        if (value <= 1) {
          clearInterval(timer);
          handlePkTimeout();
          return PK_SECONDS;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, pkRound, pkFinished, locked]);

  const openMode = (selectedMode) => {
    setMode(selectedMode);
    setFeedback('');
    setLocked(false);
    setQuestionIndex(0);
    if (selectedMode.key === 'pk') {
      restartPk(false);
      setScreen('pk');
    } else {
      setScreen('quiz');
    }
  };

  const goHome = () => {
    setScreen('home');
    setMode(null);
    setFeedback('');
    setLocked(false);
  };

  const answerQuestion = (index) => {
    if (locked) return;
    setLocked(true);
    const isCorrect = index === currentQuestion.correct;
    setFeedback(isCorrect ? '✅ وەڵامی ڕاست! +١٠ خاڵ' : '❌ وەڵامی هەڵە');
    if (isCorrect) setScore((value) => value + 10);
    setTimeout(() => {
      setQuestionIndex((value) => (value + 1) % questions.length);
      setFeedback('');
      setLocked(false);
    }, 750);
  };

  const finishPkRound = (youPoint, opponentPoint, message) => {
    if (locked || pkFinished) return;
    setLocked(true);
    const nextYou = pkYou + youPoint;
    const nextOpponent = pkOpponent + opponentPoint;
    setPkYou(nextYou);
    setPkOpponent(nextOpponent);
    if (youPoint) setScore((value) => value + 10);
    setFeedback(message);

    setTimeout(() => {
      if (pkRound >= PK_ROUNDS) {
        setPkFinished(true);
        setLocked(false);
        setFeedback('');
      } else {
        setPkRound((value) => value + 1);
        setQuestionIndex((value) => (value + 1) % questions.length);
        setPkTime(PK_SECONDS);
        setFeedback('');
        setLocked(false);
      }
    }, 700);
  };

  const pkAnswer = (index) => {
    if (index === currentQuestion.correct) {
      finishPkRound(1, 0, '✅ خاڵ بۆ تۆ');
    } else {
      finishPkRound(0, 1, '❌ خاڵ بۆ ڕکابەر');
    }
  };

  const handlePkTimeout = () => {
    if (screen !== 'pk' || locked || pkFinished) return;
    finishPkRound(0, 1, '⏰ کات تەواو بوو — خاڵ بۆ ڕکابەر');
  };

  const restartPk = (stayOnPk = true) => {
    setPkYou(0);
    setPkOpponent(0);
    setPkRound(1);
    setPkTime(PK_SECONDS);
    setPkFinished(false);
    setQuestionIndex(0);
    setFeedback('');
    setLocked(false);
    if (stayOnPk) setScreen('pk');
  };

  const inviteFriend = async () => {
    try {
      await Share.share({
        message: 'وەرە لە Tahadi Plus ـدا PK بکەین! ⚔️🔥',
      });
    } catch (_) {}
  };

  const renderQuestion = (onAnswer, showPkTimer = false) => (
    <>
      <View style={styles.progressRow}>
        <Text style={styles.muted}>{showPkTimer ? `ڕاوەند ${pkRound}/${PK_ROUNDS}` : `پرسیار ${questionIndex + 1}`}</Text>
        <Text style={showPkTimer ? styles.timer : styles.points}>{showPkTimer ? `⏱ ${pkTime}s` : `⭐ ${score} خاڵ`}</Text>
      </View>
      {showPkTimer && (
        <View style={styles.timerTrack}>
          <View style={[styles.timerFill, { width: `${(pkTime / PK_SECONDS) * 100}%` }]} />
        </View>
      )}
      <Text style={styles.question}>{currentQuestion.question}</Text>
      {currentQuestion.answers.map((answer, index) => (
        <TouchableOpacity
          key={`${answer}-${index}`}
          style={[styles.answer, locked && styles.answerLocked]}
          onPress={() => onAnswer(index)}
          disabled={locked}
        >
          <Text style={styles.answerText}>{answer}</Text>
        </TouchableOpacity>
      ))}
      {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}
    </>
  );

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

      {screen === 'pk' && !pkFinished && (
        <ScrollView contentContainerStyle={styles.gameContainer}>
          <TouchableOpacity onPress={goHome}><Text style={styles.back}>← گەڕانەوە</Text></TouchableOpacity>
          <View style={styles.pkHeaderRow}>
            <TouchableOpacity style={styles.inviteSmall} onPress={inviteFriend}><Text style={styles.inviteSmallText}>＋ بانگکردنی هاوڕێ</Text></TouchableOpacity>
            <Text style={styles.pkTitle}>⚔️ PK</Text>
          </View>
          <View style={styles.pkScoreBox}>
            <View style={styles.player}><Text style={styles.playerName}>تۆ</Text><Text style={styles.playerScore}>{pkYou}</Text></View>
            <Text style={styles.vs}>VS</Text>
            <View style={styles.player}><Text style={styles.playerName}>ڕکابەر</Text><Text style={styles.playerScore}>{pkOpponent}</Text></View>
          </View>
          <Text style={styles.pkHint}>٥ ڕاوەند — هەر وەڵامی ڕاست ١ خاڵی PK و ١٠ خاڵی گشتی</Text>
          {renderQuestion(pkAnswer, true)}
        </ScrollView>
      )}

      {screen === 'pk' && pkFinished && (
        <View style={styles.resultScreen}>
          <Text style={styles.resultEmoji}>{pkYou > pkOpponent ? '🏆' : pkYou === pkOpponent ? '🤝' : '🎯'}</Text>
          <Text style={styles.resultTitle}>{pkWinner}</Text>
          <Text style={styles.resultScore}>{pkYou}  —  {pkOpponent}</Text>
          <Text style={styles.resultSub}>کۆتایی PK ـی ٥ ڕاوەند</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => restartPk(true)}>
            <Text style={styles.primaryButtonText}>دووبارە PK بکە</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={inviteFriend}>
            <Text style={styles.secondaryButtonText}>هاوڕێیەک بانگ بکە</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goHome}><Text style={styles.homeLink}>گەڕانەوە بۆ سەرەکی</Text></TouchableOpacity>
        </View>
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
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  muted: { color: '#9498A8', fontSize: 12, fontWeight: '700' },
  points: { color: '#5B3DF5', fontWeight: '900', fontSize: 12 },
  timer: { color: '#E14B4B', fontWeight: '900', fontSize: 14 },
  timerTrack: { height: 7, backgroundColor: '#E7E8EE', borderRadius: 99, overflow: 'hidden', marginBottom: 18 },
  timerFill: { height: '100%', backgroundColor: '#5B3DF5', borderRadius: 99 },
  question: { textAlign: 'right', color: '#242634', fontSize: 21, fontWeight: '900', lineHeight: 33, marginBottom: 20 },
  answer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E3E5EC', borderRadius: 17, paddingVertical: 17, paddingHorizontal: 18, marginBottom: 11 },
  answerLocked: { opacity: 0.62 },
  answerText: { textAlign: 'right', fontSize: 17, fontWeight: '800', color: '#303240' },
  feedback: { textAlign: 'center', fontSize: 16, fontWeight: '900', marginTop: 10, color: '#343645' },
  pkHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  pkTitle: { fontSize: 31, fontWeight: '900', color: '#1B1C29' },
  inviteSmall: { backgroundColor: '#EEEAFE', borderRadius: 13, paddingVertical: 9, paddingHorizontal: 12 },
  inviteSmallText: { color: '#5B3DF5', fontSize: 12, fontWeight: '900' },
  pkScoreBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 18, marginBottom: 10 },
  player: { flex: 1, alignItems: 'center' },
  playerName: { color: '#6E7281', fontSize: 13, fontWeight: '800' },
  playerScore: { color: '#1B1C29', fontSize: 34, fontWeight: '900', marginTop: 6 },
  vs: { color: '#5B3DF5', fontWeight: '900', fontSize: 17 },
  pkHint: { textAlign: 'center', color: '#8D91A2', marginBottom: 20, fontSize: 12 },
  resultScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  resultEmoji: { fontSize: 72 },
  resultTitle: { fontSize: 30, fontWeight: '900', color: '#1B1C29', marginTop: 20, textAlign: 'center' },
  resultScore: { fontSize: 44, fontWeight: '900', color: '#5B3DF5', marginTop: 16 },
  resultSub: { color: '#8D91A2', marginTop: 6, marginBottom: 30 },
  primaryButton: { width: '100%', backgroundColor: '#5B3DF5', borderRadius: 17, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  secondaryButton: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDD9FA', borderRadius: 17, paddingVertical: 16, alignItems: 'center', marginTop: 11 },
  secondaryButtonText: { color: '#5B3DF5', fontWeight: '900', fontSize: 15 },
  homeLink: { color: '#747889', fontWeight: '800', marginTop: 22 },
});
