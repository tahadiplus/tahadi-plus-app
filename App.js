import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import okey from './gameLogic';

const GOLD = '#F1C65D', GOLD_SOFT = '#D69A37', NAVY = '#080A10', CARD = '#171B24', PALE = '#F7F1E5';
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
  const [roomMode, setRoomMode] = useState('1v1');
  const [inventory, setInventory] = useState({ rose: 0, crown: 0, trophy: 0 });
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
    const created = { id: Date.now().toString(), title, mode: roomMode, host: name.trim() || 'یاریزان' };
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
  function openMode(nextMode) {
    setRoomMode(nextMode); setScreen('rooms');
  }
  function collectGift(key, price, label) {
    if (coins < price) return Alert.alert('کۆینی دیمۆ بەس نییە', 'لە یاری پرسیاردا کۆین کۆ بکەرەوە.');
    setCoins(value => value - price);
    setInventory(previous => ({ ...previous, [key]: previous[key] + 1 }));
    Alert.alert('زیاد کرا', label + ' بۆ کۆگای دیارییەکانت زیاد کرا. ئەمە دیمۆی ناوخۆییە.');
  }
  const button = (label, onPress, secondary = false) =>
    <TouchableOpacity accessibilityRole="button" style={[styles.button, secondary && styles.secondary]} onPress={onPress}>
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
    </TouchableOpacity>;
  const title = text => <Text style={styles.title}>{text}</Text>;
  const badge = text => <View style={styles.badge}><Text style={styles.badgeText}>{text}</Text></View>;
  const notice = text => <Text style={styles.notice}>{text}</Text>;
  const header = text => <View style={styles.header}>
    <TouchableOpacity accessibilityRole="button" onPress={() => setScreen('home')} style={styles.backCircle}><Text style={styles.back}>‹</Text></TouchableOpacity>
    <Text style={styles.headerTitle}>{text}</Text>
    <TouchableOpacity accessibilityRole="button" onPress={() => setScreen('wallet')} style={styles.coinChip}>
      <Text style={styles.balance}>🪙 {coins} ＋</Text></TouchableOpacity>
  </View>;
  const nav = <View style={styles.nav}>
    {[[ '⌂', 'ماڵەوە', 'home' ], [ '◈', 'ژوورەکان', 'rooms' ], [ '♛', 'پلەکان', 'leaderboard' ],
      [ '◉', 'کۆین', 'wallet' ], [ '●', 'هەژمار', 'profile' ]].map(([icon, label, destination]) =>
      <TouchableOpacity key={destination} accessibilityRole="button" onPress={() => setScreen(destination)} style={styles.navItem}>
        <Text style={[styles.navIcon, screen === destination && styles.navActive]}>{icon}</Text>
        <Text style={[styles.navLabel, screen === destination && styles.navActive]}>{label}</Text>
      </TouchableOpacity>)}
  </View>;

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      {screen === 'home' && <>
        <View style={styles.homeHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>♛</Text></View>
          <View style={styles.homeIdentity}><Text style={styles.small}>بەخێربێیتەوە، {name}</Text>
            <Text style={styles.heading}>TAHADI <Text style={{ color: GOLD }}>PLUS</Text></Text></View>
          <TouchableOpacity accessibilityRole="button" style={styles.coinChip} onPress={() => setScreen('wallet')}>
            <Text style={styles.balance}>🪙 {coins} ＋</Text></TouchableOpacity>
        </View>
        <View style={styles.hero}>
          <Text style={styles.heroCrown}>♛</Text>
          <Text style={styles.heroSmall}>تەحەدای ئەمڕۆ · iPhone</Text>
          <Text style={styles.heroTitle}>لەسەر مێزی یاری،{ '\n' } پاڵەوان بە!</Text>
          <Text style={styles.heroCopy}>PK، ئۆکەی و پرسیارەکان ـ هەموویان لە یەک شوێن.</Text>
          {button('⚔️ PK دەست پێ بکە', () => begin('pk'))}
          <Text style={styles.heroCaption}>دوو کەس · لە هەمان مۆبایل</Text>
        </View>
        <View style={styles.stats}>
          <View><Text style={styles.stat}>🪙 {coins}</Text><Text style={styles.statLabel}>کۆینی دیمۆ</Text></View>
          <View style={styles.statDivider} />
          <View><Text style={styles.stat}>🏆 {wins}</Text><Text style={styles.statLabel}>بردنەوە</Text></View>
          <View style={styles.statDivider} />
          <View><Text style={styles.stat}>◈ {rooms.length}</Text><Text style={styles.statLabel}>ژووری ناوخۆیی</Text></View>
        </View>
        {title('⚔️ دۆخی ڕکابەری')}
        <View style={styles.modeGrid}>{[
          ['1v1', '#3B2350', 'PK لە یەک مۆبایل', () => begin('pk')],
          ['4v4', '#173047', 'ژووری تیمی ناوخۆیی', () => openMode('4v4')],
          ['8v8', '#403326', 'ژووری تیمی ناوخۆیی', () => openMode('8v8')],
          ['12v12', '#24382D', 'ژووری تیمی ناوخۆیی', () => openMode('12v12')],
        ].map(([label, color, detail, action]) =>
          <TouchableOpacity key={label} accessibilityRole="button" style={[styles.modeBlock, { backgroundColor: color }]} onPress={action}>
            <Text style={styles.modeLarge}>{label}</Text><Text style={styles.modeMini}>{detail}</Text>
            <Text style={styles.modeEdge}>↗</Text>
          </TouchableOpacity>)}</View>
        {title('🎮 یاری و ژوورەکان')}
        {[['🀄', 'ئۆکەی', 'کاشی و جوکەر · تاکەکەسی', () => setScreen('okey')],
          ['🧠', 'تەحەدای زانیاری', '٨ پرسیار · وەڵام بدە', () => begin('quiz')],
          ['🎙️', 'ژووری گشتی و تایبەت', 'ژووری دیمۆ دروست بکە', () => setScreen('rooms')],
          ['🪙', 'کۆین و دیاری', 'کۆگای دیارییە ناوخۆییەکان', () => setScreen('wallet')]].map(([icon, label, detail, action]) =>
          <TouchableOpacity key={label} accessibilityRole="button" style={styles.modeCard} onPress={action}>
            <View style={styles.modeIconBox}><Text style={styles.modeIcon}>{icon}</Text></View>
            <View style={styles.modeBody}><Text style={styles.modeName}>{label}</Text>
              <Text style={styles.modeDetail}>{detail}</Text></View><Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>)}
        {notice('وەشانی تاقیکردنەوە: یاری لەم مۆبایلەدایە؛ LIVE، دەنگ، یاریزانی ئۆنلاین و پارەدانی ڕاستەقینە هێشتا نییە.')}
      </>}
      {screen === 'rooms' && <>{header('ژوورەکان')}
        <View style={styles.sectionHero}><Text style={styles.sectionIcon}>◈</Text>
          <Text style={styles.sectionHeading}>دیوەخانی یاری</Text>
          <Text style={styles.sectionCopy}>ژووری گشتی و تایبەت، بە شێوەی تاقیکردنەوەی ناوخۆیی.</Text>
        </View>
        {title('دۆخی ژوور')}
        <View style={styles.modeGrid}>{['1v1', '4v4', '8v8', '12v12'].map(item =>
          <TouchableOpacity key={item} accessibilityRole="button" style={[styles.modeSelect,
            roomMode === item && styles.modeSelectActive]} onPress={() => setRoomMode(item)}>
            <Text style={[styles.modeSelectText, roomMode === item && { color: NAVY }]}>{item}</Text>
          </TouchableOpacity>)}</View>
        <TextInput style={styles.input} value={roomName} onChangeText={setRoomName}
          placeholder="ناوی ژوورەکەت بنووسە" placeholderTextColor="#9A91A1" maxLength={36} />
        {button('＋ ژووری تایبەت دروست بکە', createRoom)}
        {title('◈ ژووری گشتی')}
        <View style={styles.roomNotice}><Text style={styles.roomNoticeTitle}>بەشی LIVE هێشتا بەردەست نییە</Text>
          <Text style={styles.modeDetail}>یاریزانانی ساختە نیشان نادرێن. بۆ هاوڕێی لە مۆبایلی تر سێرڤەر پێویستە.</Text></View>
        {title('ژوورەکانی تۆ')}
        {rooms.length ? rooms.map(item => <TouchableOpacity key={item.id} accessibilityRole="button"
          style={styles.modeCard} onPress={() => { setRoom(item); setScreen('room'); }}>
          <View style={styles.modeIconBox}><Text style={styles.modeIcon}>🎙️</Text></View>
          <View style={styles.modeBody}><Text style={styles.modeName}>{item.title}</Text>
            <Text style={styles.modeDetail}>{item.mode} · خاوەن: {item.host} · ناوخۆیی</Text></View>
          {badge('چوونەژوور')}</TouchableOpacity>) : notice('هێشتا هیچ ژوورێکی تایبەتت نییە.')}</>}
      {screen === 'room' && <>{header(room?.title || 'ژوور')}
        <View style={styles.sectionHero}><Text style={styles.sectionIcon}>🎙️</Text>
          <Text style={styles.sectionHeading}>{room?.title || 'ژوور'}</Text>
          <Text style={styles.sectionCopy}>{room?.mode || '1v1'} · ژووری ناوخۆیی</Text></View>
        <View style={styles.seatCard}><Text style={styles.seatAvatar}>♛</Text>
          <View><Text style={styles.modeName}>{room?.host || name}</Text>
            <Text style={styles.modeDetail}>خاوەنی ژوور · ئەندامی ئێستا</Text></View></View>
        {notice('بۆ یاریی دوو کەس لە هەمان iPhone دوگمەی PK بەکار بهێنە. میکرۆفۆن و بانگهێشتنی ئۆنلاین هێشتا نییە.')}
        {button('⚔️ PK دەست پێ بکە', () => begin('pk'))}
        {button('🧠 تەحەدای پرسیار', () => begin('quiz'), true)}
        {button('دەرچوون لە ژوور', () => setScreen('rooms'), true)}</>}
      {screen === 'question' && <>{header(mode === 'pk' ? 'PK' : 'تەحەدا')}
        {mode === 'pk' ? <View style={styles.arena}>
          <View style={styles.fighter}><Text style={styles.fighterAvatar}>♛</Text>
            <Text style={styles.fighterName}>یاریزانی ١</Text><Text style={styles.fighterScore}>{points[0]}</Text></View>
          <View><Text style={styles.vs}>VS</Text><Text style={styles.arenaHint}>4 پرسیار بۆ هەر کەس</Text></View>
          <View style={styles.fighter}><Text style={[styles.fighterAvatar, styles.fighterBlue]}>●</Text>
            <Text style={styles.fighterName}>یاریزانی ٢</Text><Text style={styles.fighterScore}>{points[1]}</Text></View>
        </View> : <View style={styles.quizBanner}><Text style={styles.sectionHeading}>🧠 تەحەدای زانیاری</Text>
          <Text style={styles.sectionCopy}>وەڵامی ڕاست · ١٠ کۆینی دیمۆ</Text></View>}
        {mode === 'pk' && notice('نۆرەی یاریزانی ' + (turn + 1) + ' ـەمە؛ مۆبایلەکە بۆ ئەوی تر پاس بکە.')}
        <View style={styles.questionMeta}><Text style={styles.metaText}>پرسیار {index + 1} / {quiz.length}</Text>
          {badge(mode === 'pk' ? 'PK · ناوخۆیی' : 'کۆین +١٠')}</View>
        <View style={styles.progressTrack}><View style={[styles.progressFill,
          { width: (((index + 1) / quiz.length) * 100) + '%' }]} /></View>
        <View style={styles.question}><Text style={styles.questionText}>{quiz[index].q}</Text></View>
        {quiz[index].choices.map((choice, i) => <TouchableOpacity key={i} disabled={picked !== null}
          onPress={() => choose(i)} style={[styles.choice,
            picked !== null && i === quiz[index].answer && styles.correct,
            picked === i && i !== quiz[index].answer && styles.incorrect]}>
          <Text style={styles.choiceLetter}>{['A', 'B', 'C', 'D'][i]}</Text>
          <Text style={styles.choiceText}>{choice}</Text></TouchableOpacity>)}
        {picked !== null && <>{notice(picked === quiz[index].answer ? 'وەڵامی ڕاستە! ✨' : 'وەڵامی ڕاست: ' + quiz[index].choices[quiz[index].answer])}
          {button('پرسیاری دواتر', next)}</>}</>}
      {screen === 'result' && <>{header('ئەنجام')}
        <View style={styles.winHero}><Text style={styles.winTrophy}>🏆</Text>
          <Text style={styles.heroTitle}>{mode === 'pk' && points[0] === points[1] ? 'یەکسانن!' : 'تەحەدا تەواو بوو!'}</Text>
          <Text style={styles.sectionCopy}>ئەنجامی ئەم یارییە لەم مۆبایلەدایە.</Text></View>
        <View style={styles.result}><Text style={styles.resultText}>یاریزانی ١: {points[0]} / {mode === 'pk' ? quiz.length / 2 : quiz.length}</Text>
          {mode === 'pk' && <Text style={styles.resultText}>یاریزانی ٢: {points[1]} / {quiz.length / 2}</Text>}
          <Text style={styles.small}>{mode === 'pk' ? (points[0] === points[1] ? 'یەکسانن!' : 'براوە: یاریزانی ' + (points[0] > points[1] ? '١' : '٢')) : 'هەر وەڵامێکی ڕاست ١٠ کۆینی دیمۆیە.'}</Text></View>
        {button('دووبارە یاری بکە', () => begin(mode))}{button('بگەڕێوە سەرەکی', () => setScreen('home'), true)}</>}
      {screen === 'okey' && <>{header('ئۆکەی')}
        <View style={styles.okeyHeader}><Text style={styles.sectionIcon}>🀄</Text>
          <Text style={styles.sectionHeading}>مێزی ئۆکەی</Text>
          <Text style={styles.sectionCopy}>کاشییەکان ڕێک بخە · هەڵبگرە · فڕێ بدە</Text></View>
        <View style={styles.okeyTable}>
          <View style={styles.tableTop}><Text style={styles.tableSeat}>◯ شوێنی ڕکابەر · ئۆنلاین نییە</Text>
            {badge('تاکەکەسی')}</View>
          <View style={styles.tableCenter}>
            <View style={styles.tablePile}><Text style={styles.tablePileIcon}>▤</Text>
              <Text style={styles.tablePileLabel}>{board.stock.length} کاشی</Text></View>
            <View style={styles.tableCup}><Text style={styles.tableCupLabel}>نیشاندەر · CUP</Text>
              <View style={[styles.cupTile, { borderColor: colors[board.indicator.color] }]}>
                <Text style={[styles.tileText, { color: colors[board.indicator.color] }]}>{board.indicator.number}</Text></View>
              <Text style={styles.tableCupLabel}>جوکەر {okey.jokerFor(board.indicator).number}</Text></View>
            <View style={styles.tablePile}><Text style={styles.tablePileIcon}>{board.discard ? board.discard.number : '—'}</Text>
              <Text style={styles.tablePileLabel}>فڕێدراو</Text></View>
          </View><Text style={styles.tableSeat}>نۆرەی تۆ · {board.turns + 1}</Text>
        </View>
        {title('کاشییەکانی تۆ')}
        <View style={styles.rack}><View style={styles.tileRow}>{board.hand.map((tile, i) =>
          <TouchableOpacity key={tile.id} accessibilityRole="button" accessibilityLabel={'کاشی ' + tileLabel(tile)}
            onPress={() => setSelected(i)} style={[styles.tile, { borderColor: colors[tile.color] },
              selected === i && styles.selectedTile]}>
            <Text style={[styles.tileText, { color: colors[tile.color] }]}>{tileLabel(tile)}</Text>
          </TouchableOpacity>)}</View></View>
        {notice(board.phase === 'draw' ? 'ئێستا کاشییەک هەڵبگرە.' :
          '١٥ کاشیت هەیە؛ یەکێک دیاری بکە و فڕێی بدە، یان دەستەکەت بپشکنە.')}
        {board.phase === 'draw' ? <>
          {button('▤ لە کۆگاکە هەڵبگرە', () => draw(false))}
          {board.discard && button('↶ فڕێدراوەکە هەڵبگرە', () => draw(true), true)}
        </> : <>{button('🏆 دەستەکەم بپشکنە', checkHand)}
          {button('کاشی دیاریکراو فڕێ بدە', discard, true)}</>}
        {button('یاری ئۆکەیی نوێ', () => { setBoard(okey.startOkey()); setSelected(null); }, true)}
        {notice('ڕکابەری ٤ کەسی و یاسای تەواوی کۆنکان هێشتا نەکراوە؛ ئەمە دیمۆی تاکەکەسیی ئۆکەیە.')}</>}
      {screen === 'leaderboard' && <>{header('پلەکان')}
        <View style={styles.sectionHero}><Text style={styles.sectionIcon}>🏆</Text>
          <Text style={styles.sectionHeading}>پلەبەندی</Text><Text style={styles.sectionCopy}>تەنها ئەنجامی ئەم مۆبایلە</Text></View>
        <View style={styles.modeCard}><View style={styles.modeIconBox}><Text style={styles.modeIcon}>🥇</Text></View>
          <View style={styles.modeBody}><Text style={styles.modeName}>{name || 'یاریزان'}</Text>
            <Text style={styles.modeDetail}>{wins} بردنەوە · {coins} کۆینی دیمۆ</Text></View>{badge('#١')}</View>
        {notice('پلەبەندی گشتی و یاریزانانی LIVE هێشتا پەیوەست نەکراون.')}</>}
      {screen === 'profile' && <>{header('هەژمار')}
        <View style={styles.profileHero}><Text style={styles.profileAvatar}>♛</Text>
          <Text style={styles.sectionHeading}>{name || 'یاریزان'}</Text>
          <Text style={styles.sectionCopy}>Challenge is Life 👑</Text></View>
        {title('ناوی یاریزان')}
        <TextInput style={styles.input} value={name} onChangeText={setName}
          placeholder="ناوی یاریزان" placeholderTextColor="#8895A9" maxLength={24} />
        <View style={styles.stats}><Text style={styles.stat}>🪙 {coins} کۆین</Text>
          <Text style={styles.stat}>🏆 {wins} بردنەوە</Text></View>
        {button('🪙 کۆین و دیارییەکان', () => setScreen('wallet'))}
        {notice('ئەم داتایە تا ئەپەکە داخەیت لە بیرگەدایە؛ هەژماری ڕاستەقینە هێشتا نییە.')}</>}
      {screen === 'wallet' && <>{header('کۆین')}
        <View style={styles.walletHero}><Text style={styles.walletIcon}>🪙</Text>
          <Text style={styles.walletTitle}>{coins}</Text><Text style={styles.sectionCopy}>کۆینی دیمۆی تۆ</Text></View>
        {title('چۆن کۆین کۆ بکەیتەوە؟')}
        <View style={styles.modeCard}><View style={styles.modeIconBox}><Text style={styles.modeIcon}>🧠</Text></View>
          <View style={styles.modeBody}><Text style={styles.modeName}>تەحەدای پرسیار</Text>
            <Text style={styles.modeDetail}>+١٠ کۆین بۆ هەر وەڵامی ڕاست</Text></View></View>
        <View style={styles.modeCard}><View style={styles.modeIconBox}><Text style={styles.modeIcon}>🀄</Text></View>
          <View style={styles.modeBody}><Text style={styles.modeName}>بردنەوەی ئۆکەی</Text>
            <Text style={styles.modeDetail}>+٥٠ کۆینی دیمۆ</Text></View></View>
        {title('دیارییەکانی کۆگای تۆ')}
        {[['🌹', 'گوڵ', 'rose', 30], ['🏆', 'کۆپا', 'trophy', 60], ['👑', 'تاج', 'crown', 100]].map(([icon, label, key, price]) =>
          <View key={key} style={styles.giftCard}><Text style={styles.giftIcon}>{icon}</Text>
            <View style={styles.modeBody}><Text style={styles.modeName}>{label}</Text>
              <Text style={styles.modeDetail}>لە کۆگا: {inventory[key]} · {price} کۆین</Text></View>
            <TouchableOpacity accessibilityRole="button" style={styles.giftButton} onPress={() => collectGift(key, price, label)}>
              <Text style={styles.giftButtonText}>زیاد بکە</Text></TouchableOpacity></View>)}
        {notice('ئەم دیارییانە تەنها لە کۆگای ناوخۆیی زیاد دەبن؛ ناتوانرێت بۆ کەسێکی ئۆنلاین بنێردرێن. کڕینی کۆین بە پارەی ڕاستەقینە نییە.')}
        {button('⚔️ بە تەحەدا کۆین کۆ بکەرەوە', () => begin('quiz'))}</>}
    </ScrollView>
    {['home', 'rooms', 'leaderboard', 'wallet', 'profile'].includes(screen) && nav}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  page: { padding: 18, paddingBottom: 112 },
  homeHeader: { flexDirection: 'row', alignItems: 'center', marginVertical: 13 },
  homeIdentity: { flex: 1, marginHorizontal: 12 },
  avatar: { width: 48, height: 48, borderRadius: 17, backgroundColor: '#332713',
    borderWidth: 1, borderColor: GOLD_SOFT, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: GOLD, fontSize: 28 },
  heading: { color: '#FFFFFF', fontSize: 19, fontWeight: '900', textAlign: 'right', letterSpacing: 0.5 },
  small: { color: '#A9A5A0', fontSize: 13, textAlign: 'right', marginVertical: 5 },
  coinChip: { borderWidth: 1, borderColor: '#7F602A', backgroundColor: '#292215',
    borderRadius: 18, paddingVertical: 9, paddingHorizontal: 10 },
  balance: { color: GOLD, fontSize: 13, fontWeight: '900' },
  hero: { backgroundColor: '#191719', borderRadius: 27, padding: 22, marginTop: 10,
    borderWidth: 1, borderColor: '#8A6629' },
  heroCrown: { color: GOLD, fontSize: 48, textAlign: 'right' },
  heroSmall: { color: GOLD, fontSize: 14, textAlign: 'right', fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 29, textAlign: 'right', marginTop: 11,
    lineHeight: 38 },
  heroCopy: { color: '#C0B6A5', textAlign: 'right', marginVertical: 13, fontSize: 15 },
  heroCaption: { color: '#AF9C72', textAlign: 'center', marginTop: 6, fontSize: 12 },
  button: { backgroundColor: GOLD, borderRadius: 15, padding: 15, marginVertical: 7,
    borderWidth: 1, borderColor: '#FFE59A' },
  buttonText: { color: NAVY, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  secondary: { backgroundColor: '#24242B', borderColor: '#515057' },
  secondaryText: { color: '#E9DFCC' },
  stats: { backgroundColor: CARD, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', padding: 16, marginVertical: 13, borderWidth: 1, borderColor: '#363337' },
  stat: { color: GOLD, textAlign: 'center', fontSize: 19, fontWeight: '900' },
  statLabel: { color: '#B5B0AB', fontSize: 11, textAlign: 'center', marginTop: 6 },
  statDivider: { width: 1, height: 37, backgroundColor: '#39343B' },
  title: { color: '#FFF6E1', fontSize: 21, fontWeight: '900', textAlign: 'right', marginTop: 24, marginBottom: 12 },
  notice: { color: '#B7B3B1', fontSize: 14, lineHeight: 24, textAlign: 'right', marginVertical: 12 },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modeBlock: { width: '48.5%', borderWidth: 1, borderColor: '#755D3B',
    borderRadius: 17, padding: 16, marginBottom: 11, minHeight: 112 },
  modeLarge: { color: '#FFF', fontSize: 27, fontWeight: '900' },
  modeMini: { color: '#D9D0C5', fontSize: 11, marginTop: 4 },
  modeEdge: { color: GOLD, textAlign: 'right', fontSize: 19 },
  modeCard: { backgroundColor: CARD, borderRadius: 17, padding: 13, marginVertical: 6,
    borderWidth: 1, borderColor: '#39363A', flexDirection: 'row', alignItems: 'center' },
  modeIconBox: { width: 50, height: 50, backgroundColor: '#30271B', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modeIcon: { fontSize: 27 },
  modeBody: { flex: 1 },
  modeName: { color: '#FFF5E9', fontWeight: '900', fontSize: 17, textAlign: 'right' },
  modeDetail: { color: '#ACA5A0', fontSize: 12, textAlign: 'right', marginTop: 4, lineHeight: 18 },
  arrow: { color: GOLD, fontSize: 27, marginLeft: 11 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backCircle: { backgroundColor: CARD, borderWidth: 1, borderColor: '#51452D',
    width: 41, height: 41, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  back: { color: GOLD, fontSize: 32, marginTop: -5 },
  headerTitle: { color: '#FFF4DF', fontWeight: '900', fontSize: 20, flex: 1, textAlign: 'right', marginHorizontal: 11 },
  input: { backgroundColor: CARD, color: '#FFFFFF', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#64533C', fontSize: 17, textAlign: 'right', marginVertical: 11 },
  badge: { borderRadius: 11, backgroundColor: '#3B301C', borderWidth: 1, borderColor: '#816128',
    paddingHorizontal: 9, paddingVertical: 6 },
  badgeText: { color: GOLD, fontWeight: '800', fontSize: 11 },
  sectionHero: { backgroundColor: CARD, borderWidth: 1, borderColor: '#7B5A2C',
    borderRadius: 24, padding: 25, alignItems: 'center', marginVertical: 13 },
  sectionIcon: { fontSize: 45, color: GOLD, textAlign: 'center' },
  sectionHeading: { color: '#FFF8E8', fontWeight: '900', fontSize: 23, textAlign: 'center', marginTop: 6 },
  sectionCopy: { color: '#C7B9A4', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  modeSelect: { width: '24%', backgroundColor: CARD, borderWidth: 1, borderColor: '#655135',
    borderRadius: 12, paddingVertical: 11, marginBottom: 5 },
  modeSelectActive: { backgroundColor: GOLD, borderColor: '#FFE59A' },
  modeSelectText: { color: GOLD, fontWeight: '900', textAlign: 'center' },
  roomNotice: { padding: 18, borderRadius: 17, backgroundColor: '#1D1B1E',
    borderWidth: 1, borderColor: '#6E4A39' },
  roomNoticeTitle: { color: '#FFE2BA', fontWeight: '900', textAlign: 'right', marginBottom: 5 },
  seatCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, borderWidth: 1,
    borderColor: '#665134', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 14 },
  seatAvatar: { backgroundColor: '#3F3322', borderRadius: 50, overflow: 'hidden',
    color: GOLD, padding: 13, fontSize: 24 },
  arena: { backgroundColor: '#1A1820', borderRadius: 22, borderWidth: 1, borderColor: '#91652C',
    padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  fighter: { alignItems: 'center' },
  fighterAvatar: { width: 55, height: 55, borderRadius: 30, backgroundColor: '#3C2E1B',
    textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden', color: GOLD, fontSize: 30 },
  fighterBlue: { backgroundColor: '#173C56', color: '#79C8FF' },
  fighterName: { color: '#C9C2B6', fontSize: 12, marginTop: 6 },
  fighterScore: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  vs: { color: GOLD, textAlign: 'center', fontSize: 27, fontWeight: '900' },
  arenaHint: { color: '#ACA9A6', fontSize: 10, textAlign: 'center' },
  quizBanner: { backgroundColor: CARD, borderRadius: 18, padding: 20, marginVertical: 12,
    borderWidth: 1, borderColor: '#786038' },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { color: GOLD, fontWeight: '900', fontSize: 15 },
  progressTrack: { height: 7, backgroundColor: '#343137', borderRadius: 8,
    overflow: 'hidden', marginVertical: 13 },
  progressFill: { height: '100%', backgroundColor: GOLD },
  question: { backgroundColor: '#22242D', borderRadius: 20, padding: 26, marginVertical: 12,
    borderWidth: 1, borderColor: '#5C4A31' },
  questionText: { fontSize: 23, fontWeight: '900', color: '#FFF5E6', textAlign: 'right', lineHeight: 33 },
  choice: { backgroundColor: CARD, padding: 13, marginVertical: 6, borderRadius: 14,
    borderWidth: 1, borderColor: '#4C4440', flexDirection: 'row', alignItems: 'center' },
  choiceLetter: { color: GOLD, backgroundColor: '#372C1B', overflow: 'hidden',
    width: 33, height: 33, textAlign: 'center', textAlignVertical: 'center', borderRadius: 8, fontWeight: '900' },
  choiceText: { color: '#FFF', textAlign: 'right', fontSize: 17, flex: 1, marginHorizontal: 10 },
  correct: { backgroundColor: '#175B49', borderColor: '#57CC97' },
  incorrect: { backgroundColor: '#71303D', borderColor: '#D68593' },
  winHero: { alignItems: 'center', borderWidth: 1, borderColor: '#9B732D',
    borderRadius: 24, padding: 25, marginTop: 15, backgroundColor: CARD },
  winTrophy: { fontSize: 60 },
  result: { backgroundColor: CARD, borderRadius: 18, padding: 23, marginVertical: 15,
    borderWidth: 1, borderColor: '#665334' },
  resultText: { color: '#FFF4DE', fontSize: 20, textAlign: 'right', marginVertical: 5 },
  okeyHeader: { alignItems: 'center', backgroundColor: CARD, borderRadius: 19,
    borderWidth: 1, borderColor: '#74552E', padding: 17, marginVertical: 12 },
  okeyTable: { backgroundColor: '#123427', borderRadius: 24, borderWidth: 4,
    borderColor: '#73552A', minHeight: 260, padding: 15, marginVertical: 10 },
  tableTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableSeat: { color: '#C3D9C9', textAlign: 'center', fontSize: 12, marginVertical: 7 },
  tableCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flex: 1 },
  tablePile: { backgroundColor: '#254638', borderRadius: 14, padding: 9, alignItems: 'center',
    width: 82, borderWidth: 1, borderColor: '#517B57' },
  tablePileIcon: { color: '#FFF8E9', fontSize: 30, fontWeight: '900' },
  tablePileLabel: { color: '#B3D0BA', fontSize: 11, marginTop: 5 },
  tableCup: { alignItems: 'center' },
  tableCupLabel: { color: GOLD, fontWeight: '800', fontSize: 10, textAlign: 'center', marginVertical: 5 },
  cupTile: { backgroundColor: PALE, borderWidth: 3, borderRadius: 8, width: 42,
    height: 54, alignItems: 'center', justifyContent: 'center' },
  rack: { backgroundColor: '#443323', borderColor: '#AE7938', borderWidth: 2,
    borderRadius: 15, padding: 8, marginBottom: 8 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tile: { backgroundColor: PALE, borderWidth: 2, borderRadius: 7, width: 39,
    height: 53, justifyContent: 'center', alignItems: 'center', margin: 3 },
  selectedTile: { transform: [{ translateY: -8 }], backgroundColor: '#FFE3A5' },
  tileText: { fontSize: 21, fontWeight: '900' },
  profileHero: { alignItems: 'center', backgroundColor: CARD, borderWidth: 1,
    borderColor: '#8B6227', borderRadius: 24, padding: 24, marginVertical: 13 },
  profileAvatar: { fontSize: 46, color: GOLD, backgroundColor: '#3E2F1E',
    borderRadius: 50, width: 82, height: 82, overflow: 'hidden', textAlign: 'center',
    textAlignVertical: 'center' },
  walletHero: { alignItems: 'center', backgroundColor: '#281F16', borderRadius: 24,
    borderWidth: 1, borderColor: '#A97A37', padding: 23, marginVertical: 15 },
  walletIcon: { fontSize: 44 },
  walletTitle: { color: GOLD, fontWeight: '900', fontSize: 43, marginTop: 6 },
  giftCard: { backgroundColor: CARD, borderWidth: 1, borderColor: '#5C4B31', borderRadius: 17,
    flexDirection: 'row', alignItems: 'center', padding: 12, marginVertical: 6 },
  giftIcon: { fontSize: 31, marginRight: 11 },
  giftButton: { backgroundColor: '#4D3921', borderRadius: 11, borderWidth: 1, borderColor: GOLD_SOFT,
    paddingVertical: 9, paddingHorizontal: 10, marginLeft: 10 },
  giftButtonText: { color: GOLD, fontWeight: '900', fontSize: 12 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#101218',
    borderTopWidth: 1, borderTopColor: '#776038', paddingVertical: 10, flexDirection: 'row',
    justifyContent: 'space-around' },
  navItem: { alignItems: 'center', width: '20%' },
  navIcon: { color: '#898582', fontSize: 23 },
  navLabel: { color: '#898582', fontSize: 10 },
  navActive: { color: GOLD, fontWeight: '900' },
});
