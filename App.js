import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import okey from './gameLogic';

const GOLD = '#F8BE45', NAVY = '#091321', CARD = '#142236', PALE = '#F7F8FF';
const quiz = [
  { q: 'پایتەختی هەرێمی کوردستان کام شارە؟', choices: ['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکووک'], answer: 0 },
  { q: 'هەر تیمێکی تۆپی پێ چەند یاریزانی لە مەیداندا هەیە؟', choices: ['٩', '١٠', '١١', '١٢'], answer: 2 },
  { q: 'گەورەترین کیشوەری جیهان کامەیە؟', choices: ['ئەفریقا', 'ئاسیا', 'ئەوروپا', 'ئۆسترالیا'], answer: 1 },
  { q: '٢ + ٨ × ٢ چەندە؟', choices: ['٢٠', '١٨', '١٦', '١٢'], answer: 1 },
  { q: 'چەند ڕەنگ لە کاشییەکانی ئۆکەیدا هەیە؟', choices: ['٢', '٣', '٤', '٥'], answer: 2 },
  { q: 'مانگی تەمموز ژمارەی چەندی ساڵە؟', choices: ['٥', '٦', '٧', '٨'], answer: 2 },
  { q: 'شەممە دوای کام ڕۆژ دێت؟', choices: ['هەینی', 'یەکشەممە', 'چوارشەممە', 'دووشەممە'], answer: 0 },
  { q: '٥ × ٦ چەندە؟', choices: ['٢٥', '٣٠', '٣٥', '٤٠'], answer: 1 },
];
const colors = { red: '#F15A64', blue: '#5BA9F6', black: '#323B51', yellow: '#E9B746', false: '#A36AEC' };

export default function App() {
  const [screen, setScreen] = useState('home');
  const [coins, setCoins] = useState(130);
  const [wins, setWins] = useState(0);
  const [name, setName] = useState('یاریزان');
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [room, setRoom] = useState(null);
  const [mode, setMode] = useState('quiz');
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [points, setPoints] = useState([0, 0]);
  const [picked, setPicked] = useState(null);
  const [board, setBoard] = useState(() => okey.startOkey());
  const [selected, setSelected] = useState(null);

  function begin(nextMode) {
    setMode(nextMode); setIndex(0); setTurn(0); setPoints([0, 0]);
    setPicked(null); setScreen('question');
  }
  function choose(choice) {
    if (picked !== null) return;
    setPicked(choice);
    if (choice === quiz[index].answer) {
      setPoints(previous => previous.map((value, player) => player === turn ? value + 1 : value));
      if (mode === 'quiz') setCoins(value => value + 10);
    }
  }
  function next() {
    if (index === quiz.length - 1) {
      if (mode === 'quiz' || points[0] > points[1]) setWins(value => value + 1);
      setScreen('result');
    } else {
      setIndex(value => value + 1);
      setTurn(value => mode === 'pk' ? 1 - value : 0);
      setPicked(null);
    }
  }
  function createRoom() {
    const title = roomName.trim();
    if (!title) return Alert.alert('ناوی ژوور بنووسە');
    const created = { id: Date.now().toString(), title, host: name.trim() || 'یاریزان' };
    setRooms(previous => [created, ...previous]); setRoom(created);
    setRoomName(''); setScreen('room');
  }
  function tileLabel(tile) {
    if (tile.color === 'false') return '★';
    return okey.isJoker(tile, board.indicator) ? '★' : String(tile.number);
  }
  function draw(fromDiscard = false) {
    if (board.phase !== 'draw') return;
    if (fromDiscard && !board.discard) return;
    if (!fromDiscard && !board.stock.length) return Alert.alert('کاشی نەماوە', 'یارییەکی نوێ دەست پێ بکە.');
    const tile = fromDiscard ? board.discard : board.stock[0];
    setBoard(previous => ({
      ...previous, hand: [...previous.hand, tile],
      discard: fromDiscard ? null : previous.discard,
      stock: fromDiscard ? previous.stock : previous.stock.slice(1),
      phase: 'discard',
    }));
    setSelected(null);
  }
  function discard() {
    if (board.phase !== 'discard' || selected === null) return;
    setBoard(previous => ({
      ...previous, discard: previous.hand[selected],
      hand: previous.hand.filter((_, position) => position !== selected),
      phase: 'draw', turns: previous.turns + 1,
    }));
    setSelected(null);
  }
  function checkHand() {
    if (board.phase !== 'discard') return Alert.alert('سەرەتا کاشییەک هەڵبگرە');
    if (!okey.winningHand(board.hand.slice(0, 14), board.indicator) && !board.hand.some((_, i) =>
      okey.winningHand(board.hand.filter((__, j) => j !== i), board.indicator))) {
      return Alert.alert('هێشتا تەواو نییە', '١٤ کاشی لە گرووپی ژمارە، زنجیرە یان ٧ جووت ڕێک بخە.');
    }
    if (!board.won) { setWins(value => value + 1); setCoins(value => value + 50); }
    setBoard(previous => ({ ...previous, won: true }));
    Alert.alert('پیرۆزە! 🏆', '٥٠ کۆینی دیمۆت بردەوە.');
  }
  const button = (label, onPress, secondary = false) =>
    <TouchableOpacity accessibilityRole="button" style={[styles.button, secondary && styles.secondary]} onPress={onPress}>
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </TouchableOpacity>;
  const title = text => <Text style={styles.title}>{text}</Text>;
  const notice = text => <Text style={styles.notice}>{text}</Text>;
  const header = text => <View style={styles.header}>
    <TouchableOpacity accessibilityRole="button" onPress={() => setScreen('home')}><Text style={styles.back}>‹</Text></TouchableOpacity>
    <Text style={styles.headerTitle}>{text}</Text><Text style={styles.balance}>🪙 {coins}</Text>
  </View>;
  const nav = <View style={styles.nav}>
    {[[ '⌂', 'سەرەکی', 'home' ], [ '♛', 'پلەبەندی', 'leaderboard' ], [ '●', 'هەژمار', 'profile' ]].map(([icon, label, destination]) =>
      <TouchableOpacity key={destination} onPress={() => setScreen(destination)} style={styles.navItem}>
        <Text style={styles.navIcon}>{icon}</Text><Text style={styles.navLabel}>{label}</Text>
      </TouchableOpacity>)}
  </View>;

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      {screen === 'home' && <>
        <View style={styles.homeHeader}><Text style={styles.logo}>T+</Text><View><Text style={styles.small}>بەخێربێیتەوە</Text><Text style={styles.heading}>Tahadi Plus</Text></View></View>
        <View style={styles.hero}><Text style={styles.heroSmall}>🔥 تەحەدای ئەمڕۆ</Text>
          <Text style={styles.heroTitle}>ئامادەی بۆ بردنەوە؟</Text><Text style={styles.heroCopy}>پرسیارەکان تاقی بکە و کۆینی دیمۆ کۆ بکەرەوە.</Text>
          {button('دەست پێ بکە', () => begin('quiz'), true)}</View>
        <View style={styles.stats}><Text style={styles.stat}>🪙 {coins}{'\n'}<Text style={styles.small}>کۆینی دیمۆ</Text></Text>
          <Text style={styles.stat}>🏆 {wins}{'\n'}<Text style={styles.small}>بردنەوە</Text></Text>
          <Text style={styles.stat}>🎮 {rooms.length}{'\n'}<Text style={styles.small}>ژوور</Text></Text></View>
        {title('جۆری یارییەکان')}
        {[['🎙️', 'کۆنکان و ژوورەکان', 'ژووری تایبەت دروست بکە و هاوبەشی بکە', 'rooms'],
          ['🧠', 'تەحەدا و پرسیار', 'پرسیار و وەڵام بۆ خاڵ', 'quiz'],
          ['⚔️', 'PK دوو یاریزان', 'پاس کردنی مۆبایل لە نێوان دوو کەس', 'pk'],
          ['🀄', 'ئۆکەی', '١٤ کاشی، هەڵگرتن و فڕێدان', 'okey']].map(([icon, label, detail, destination]) =>
          <TouchableOpacity key={destination} style={styles.modeCard} onPress={() =>
            destination === 'quiz' || destination === 'pk' ? begin(destination) : setScreen(destination)}>
            <Text style={styles.modeIcon}>{icon}</Text><View style={{ flex: 1 }}><Text style={styles.modeName}>{label}</Text>
              <Text style={styles.modeDetail}>{detail}</Text></View><Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>)}
        {notice('ئەمە وەشانی تاقیکردنەوەی iPhone ـە: یاری و کۆین لەسەر ئەم مۆبایلەن؛ ژووری LIVE و پارەدان هێشتا نەکراون.')}
      </>}
      {screen === 'rooms' && <>{header('کۆنکان و ژوورەکان')}{title('ژووری دیمۆ دروست بکە')}
        {notice('ژوورەکان تەنها لەم سێشنەی مۆبایلە دان. دەنگ و هاوڕێی ئۆنلاین هێشتا پەیوەست نەکراون.')}
        <TextInput style={styles.input} value={roomName} onChangeText={setRoomName}
          placeholder="ناوی ژوور" placeholderTextColor="#8895A9" maxLength={36} />
        {button('＋ دروستکردنی ژوور', createRoom)}
        {rooms.length ? rooms.map(item => <TouchableOpacity key={item.id} style={styles.modeCard}
          onPress={() => { setRoom(item); setScreen('room'); }}><Text style={styles.modeIcon}>🎙️</Text>
          <View style={{ flex: 1 }}><Text style={styles.modeName}>{item.title}</Text>
            <Text style={styles.modeDetail}>خاوەن: {item.host} · ناوخۆیی</Text></View></TouchableOpacity>)
          : notice('هێشتا هیچ ژوورێک دروست نەکراوە.')}</>}
      {screen === 'room' && <>{header(room?.title || 'ژوور')}{title('🎙️ ' + (room?.title || ''))}
        {notice('ئەندام: ' + (room?.host || name) + '. ئەم ژوورە دیمۆی ناوخۆییە؛ میکرۆفۆن و بانگهێشتنی ئۆنلاین نییە.')}
        {button('⚔️ تەحەدای دوو کەس لە هەمان iPhone', () => begin('pk'))}
        {button('🧠 پرسیارەکانی ژوور', () => begin('quiz'), true)}
        {button('دەرچوون لە ژوور', () => setScreen('rooms'), true)}</>}
      {screen === 'question' && <>{header(mode === 'pk' ? 'PK' : 'تەحەدا')}
        {mode === 'pk' && notice('یاریزانی ' + (turn + 1) + ' ـەم · پرسیاری جیاوازی هەر یاریزان؛ مۆبایلەکە پاس بکە.')}
        <View style={styles.stats}><Text style={styles.stat}>یاریزانی ١: {points[0]}</Text>
          {mode === 'pk' && <Text style={styles.stat}>یاریزانی ٢: {points[1]}</Text>}</View>
        <Text style={styles.small}>پرسیاری {index + 1} / {quiz.length}</Text>
        <View style={styles.question}><Text style={styles.questionText}>{quiz[index].q}</Text></View>
        {quiz[index].choices.map((choice, i) => <TouchableOpacity key={i} disabled={picked !== null}
          onPress={() => choose(i)} style={[styles.choice,
            picked !== null && i === quiz[index].answer && styles.correct,
            picked === i && i !== quiz[index].answer && styles.incorrect]}>
          <Text style={styles.choiceText}>{choice}</Text></TouchableOpacity>)}
        {picked !== null && <>{notice(picked === quiz[index].answer ? 'وەڵامی ڕاستە! ✨' : 'وەڵامی ڕاست: ' + quiz[index].choices[quiz[index].answer])}
          {button('پرسیاری دواتر', next)}</>}</>}
      {screen === 'result' && <>{header('ئەنجام')}{title('🏆 ئەنجامی یاری')}
        <View style={styles.result}><Text style={styles.resultText}>یاریزانی ١: {points[0]} / {mode === 'pk' ? quiz.length / 2 : quiz.length}</Text>
          {mode === 'pk' && <Text style={styles.resultText}>یاریزانی ٢: {points[1]} / {quiz.length / 2}</Text>}
          <Text style={styles.small}>{mode === 'pk' ? (points[0] === points[1] ? 'یەکسانن!' : 'براوە: یاریزانی ' + (points[0] > points[1] ? '١' : '٢')) : 'هەر وەڵامێکی ڕاست ١٠ کۆینی دیمۆیە.'}</Text></View>
        {button('دووبارە یاری بکە', () => begin(mode))}{button('بگەڕێوە سەرەکی', () => setScreen('home'), true)}</>}
      {screen === 'okey' && <>{header('یاری ئۆکەی')}{title('🀄 ئۆکەی — تاقیکردنەوەی تاکەکەسی')}
        {notice('کاشییەک هەڵبگرە، پاشان یەکێک فڕێ بدە. ١٤ کاشی بە زنجیرە/ژمارە یان ٧ جووت ڕێک بخە.')}
        <View style={styles.stats}><Text style={styles.stat}>دەست: {board.turns}</Text>
          <Text style={styles.stat}>بەشی ماوە: {board.stock.length}</Text></View>
        <Text style={styles.small}>نیشاندەر: {board.indicator.number} · {board.indicator.color} | جوکەر: {okey.jokerFor(board.indicator).number}</Text>
        <View style={styles.tileRow}>{board.hand.map((tile, i) => <TouchableOpacity key={tile.id}
          onPress={() => setSelected(i)} style={[styles.tile, { borderColor: colors[tile.color] },
            selected === i && styles.selectedTile]}>
          <Text style={[styles.tileText, { color: colors[tile.color] }]}>{tileLabel(tile)}</Text></TouchableOpacity>)}</View>
        {notice('فڕێدراو: ' + (board.discard ? board.discard.number + ' · ' + board.discard.color : 'نییە'))}
        {board.phase === 'draw' ? <>
          {button('کاشی لە کۆگاکە هەڵبگرە', () => draw(false))}
          {board.discard && button('کاشی فڕێدراو هەڵبگرە', () => draw(true), true)}
        </> : <>{button('دەستەکەم تەواوە؟', checkHand)}
          {button('کاشی دیاریکراو فڕێ بدە', discard, true)}</>}
        {button('یاری ئۆکەیی نوێ', () => { setBoard(okey.startOkey()); setSelected(null); }, true)}
        {notice('ئەمە وەشانی فێربوونی تاکەکەسییە؛ ڕکابەری ٤ کەسی ئۆنلاین دواتر پێویستی بە سێرڤەرە.')}</>}
      {screen === 'leaderboard' && <>{header('پلەبەندی')}{title('🏆 پلەبەندی ئەم مۆبایلە')}
        <View style={styles.modeCard}><Text style={styles.modeIcon}>🥇</Text><View>
          <Text style={styles.modeName}>{name || 'یاریزان'}</Text><Text style={styles.modeDetail}>{wins} بردنەوە · {coins} کۆین</Text></View></View>
        {notice('پلەبەندی گشتی و یاریزانانی LIVE هێشتا پەیوەست نەکراون.')}</>}
      {screen === 'profile' && <>{header('هەژمار')}{title('👤 پرۆفایلی ناوخۆیی')}
        <TextInput style={styles.input} value={name} onChangeText={setName}
          placeholder="ناوی یاریزان" placeholderTextColor="#8895A9" maxLength={24} />
        <View style={styles.stats}><Text style={styles.stat}>🪙 {coins} کۆین</Text>
          <Text style={styles.stat}>🏆 {wins} بردنەوە</Text></View>
        {button('کۆینەکان', () => setScreen('wallet'))}
        {notice('ئەم داتایە تا ئەپەکە داخەیت لە بیرگەدایە؛ هەژماری ڕاستەقینە هێشتا نییە.')}</>}
      {screen === 'wallet' && <>{header('کۆین')}{title('🪙 کۆینی دیمۆ')}
        <View style={styles.result}><Text style={styles.heroTitle}>{coins} کۆین</Text></View>
        {notice('لە تەحەدای پرسیاردا هەر وەڵامێکی ڕاست ١٠ کۆین دەدات؛ بردنەوەی ئۆکەی ٥٠ کۆین. کڕینی کۆین و نرخەکان لەم وەشانەدا بەردەست نین.')}
        {button('دەست پێ بکە بە تەحەدا', () => begin('quiz'))}</>}
    </ScrollView>
    {['home', 'leaderboard', 'profile'].includes(screen) && nav}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  page: { padding: 20, paddingBottom: 110 },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  logo: { color: '#fff', backgroundColor: '#563DEE', borderRadius: 20, padding: 18, fontSize: 23, fontWeight: '900' },
  heading: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'right' },
  small: { color: '#AAB8CD', fontSize: 14, textAlign: 'right', marginVertical: 6 },
  hero: { backgroundColor: '#583EED', borderRadius: 30, padding: 24, marginVertical: 15 },
  heroSmall: { color: '#E4DFFF', fontSize: 18, textAlign: 'right', fontWeight: '700' },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 31, textAlign: 'right', marginTop: 16 },
  heroCopy: { color: '#E4DFFF', textAlign: 'right', marginVertical: 12, fontSize: 16 },
  button: { backgroundColor: GOLD, borderRadius: 16, padding: 15, marginVertical: 7 },
  buttonText: { color: NAVY, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  secondary: { backgroundColor: PALE },
  secondaryText: { color: '#5841DF' },
  stats: { backgroundColor: CARD, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-around', padding: 18, marginVertical: 12 },
  stat: { color: '#fff', textAlign: 'center', fontSize: 19, fontWeight: '800' },
  title: { color: '#fff', fontSize: 25, fontWeight: '900', textAlign: 'right', marginVertical: 18 },
  notice: { color: '#AAB8CD', fontSize: 15, lineHeight: 26, textAlign: 'right', marginVertical: 12 },
  modeCard: { backgroundColor: CARD, borderRadius: 19, padding: 18, marginVertical: 6, flexDirection: 'row', alignItems: 'center' },
  modeIcon: { fontSize: 30, marginRight: 15 },
  modeName: { color: '#fff', fontWeight: '900', fontSize: 20, textAlign: 'right' },
  modeDetail: { color: '#AAB8CD', fontSize: 13, textAlign: 'right', marginTop: 4 },
  arrow: { color: GOLD, fontSize: 30, marginLeft: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  back: { color: GOLD, fontSize: 38, marginRight: 14 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 22, flex: 1, textAlign: 'right' },
  balance: { color: GOLD, fontSize: 16, marginLeft: 9 },
  input: { backgroundColor: CARD, color: '#fff', borderRadius: 14, padding: 16, fontSize: 18, textAlign: 'right', marginVertical: 9 },
  question: { backgroundColor: PALE, borderRadius: 22, padding: 30, marginVertical: 20 },
  questionText: { fontSize: 24, fontWeight: '900', color: NAVY, textAlign: 'right' },
  choice: { backgroundColor: CARD, padding: 17, marginVertical: 6, borderRadius: 15 },
  choiceText: { color: '#fff', textAlign: 'right', fontSize: 18 },
  correct: { backgroundColor: '#167D5F' }, incorrect: { backgroundColor: '#A63F4B' },
  result: { backgroundColor: CARD, borderRadius: 20, padding: 25, marginVertical: 15 },
  resultText: { color: '#fff', fontSize: 21, textAlign: 'right', marginVertical: 5 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 15 },
  tile: { backgroundColor: PALE, borderWidth: 3, borderRadius: 9, width: 43, height: 57, justifyContent: 'center', alignItems: 'center', margin: 3 },
  selectedTile: { transform: [{ translateY: -10 }], backgroundColor: '#FFE9B0' },
  tileText: { fontSize: 22, fontWeight: '900' },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#101D30', borderTopWidth: 1, borderColor: '#304054', paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-around' },
  navItem: { alignItems: 'center' }, navIcon: { color: GOLD, fontSize: 25 }, navLabel: { color: '#AAB8CD', fontSize: 12 },
});
