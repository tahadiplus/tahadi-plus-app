import React, { useEffect, useState } from 'react';
import { Alert, ImageBackground, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import okey from './gameLogic';
import konkan from './konkanLogic';
import KurdistanFlag from './KurdistanFlag';
import localSave from './localSave';

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
const ROOM_PREVIEWS = [
  { title: 'دیوەخانی شێخە', category: 'ژوور', caption: 'گفتوگۆ و هاوڕێیەتی', icon: '🏰', tint: '#F3D79C' },
  { title: 'یاریی کۆنکان', category: 'کۆنکان', caption: 'مێزی قەڵای زاگرۆس', icon: '🀄', tint: '#D9EAD8' },
  { title: 'تەحەدای زانیاری', category: 'تەحەدی', caption: 'پرسیار و ڕکابەری', icon: '🧠', tint: '#EFE0FF' },
  { title: 'ڕکابەری پاڵەوانان', category: 'تەحەدی', caption: 'یەک بە یەک لە ئایفۆن', icon: '⚔️', tint: '#FCDDD7' },
  { title: 'هاوڕێی زاگرۆس', category: 'ژوور', caption: 'ژووری تایبەتی هاوڕێکان', icon: '🌄', tint: '#DCEBF5' },
  { title: 'مێزی ئۆکەی', category: 'کۆنکان', caption: 'کاشی و جوکەر', icon: '🀄', tint: '#FBE6BB' },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [coins, setCoins] = useState(130);
  const [wins, setWins] = useState(0);
  const [name, setName] = useState('یاریزان');
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [room, setRoom] = useState(null);
  const [roomMode, setRoomMode] = useState('1v1');
  const [roomFilter, setRoomFilter] = useState('هەموو');
  const [inventory, setInventory] = useState({ rose: 0, crown: 0, trophy: 0, eagle: 0, zagros: 0 });
  const [mode, setMode] = useState('quiz');
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [points, setPoints] = useState([0, 0]);
  const [picked, setPicked] = useState(null);
  const [board, setBoard] = useState(() => okey.startOkey());
  const [selected, setSelected] = useState(null);
  const [konkanBoard, setKonkanBoard] = useState(() => konkan.startKonkan());
  const [konkanSelected, setKonkanSelected] = useState([]);
  const [saveReady, setSaveReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(localSave.SAVE_KEY).then(raw => {
      if (!mounted) return;
      const saved = localSave.restoreSave(raw);
      if (saved) {
        setName(saved.name); setCoins(saved.coins); setWins(saved.wins);
        setRooms(saved.rooms); setInventory(saved.inventory);
        if (saved.board) setBoard(saved.board);
        if (saved.konkanBoard) setKonkanBoard(saved.konkanBoard);
      }
    }).catch(() => {}).finally(() => { if (mounted) setSaveReady(true); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!saveReady) return;
    const timer = setTimeout(() => {
      AsyncStorage.setItem(localSave.SAVE_KEY,
        localSave.packSave({ name, coins, wins, rooms, inventory, board, konkanBoard })).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [saveReady, name, coins, wins, rooms, inventory, board, konkanBoard]);

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
  function drawKonkan() {
    if (konkanBoard.phase !== 'draw' || !konkanBoard.stock.length) {
      if (!konkanBoard.stock.length) Alert.alert('کاشی نەماوە', 'مێزێکی نوێ دەست پێ بکە.');
      return;
    }
    setKonkanBoard(previous => ({ ...previous, hand: [...previous.hand, previous.stock[0]],
      stock: previous.stock.slice(1), phase: 'meld' }));
    setKonkanSelected([]);
  }
  function toggleKonkanTile(id) {
    setKonkanSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  }
  function addKonkanMeld() {
    if (konkanBoard.phase !== 'meld') return Alert.alert('سەرەتا کاشییەک هەڵبگرە');
    const group = konkanBoard.hand.filter(tile => konkanSelected.includes(tile.id));
    if (!konkan.validMeld(group, konkanBoard.cup)) return Alert.alert('گرووپەکە دروست نییە',
      '٣ تا ٥ کاشی هاوشێوە یان زنجیرە هەڵبژێرە. جوکەرەکان لەم ڕاهێنانەدا هێشتا ناچنە گرووپ.');
    setKonkanBoard(previous => ({ ...previous,
      hand: previous.hand.filter(tile => !konkanSelected.includes(tile.id)),
      [previous.opened ? 'melds' : 'pending']: [...(previous.opened ? previous.melds : previous.pending), group] }));
    setKonkanSelected([]);
  }
  function openKonkan() {
    const score = konkanBoard.pending.reduce((sum, group) => sum + konkan.meldPoints(group), 0);
    if (score < 81) return Alert.alert('٨١ خاڵ پێویستە', 'گرووپەکانی ئەم نۆرە: ' + score + ' خاڵ.');
    setKonkanBoard(previous => ({ ...previous, opened: true, openPoints: score,
      melds: [...previous.melds, ...previous.pending], pending: [] }));
    Alert.alert('مێزەکەت کرایەوە! 🏰', score + ' خاڵ · ئێستا دەتوانیت گرووپی تر زیاد بکەیت.');
  }
  function undoKonkan() {
    setKonkanBoard(previous => ({ ...previous, hand: [...previous.hand, ...previous.pending.flat()], pending: [] }));
    setKonkanSelected([]);
  }
  function discardKonkan() {
    if (konkanBoard.phase !== 'meld') return;
    if (konkanBoard.pending.length) return Alert.alert('گرووپەکان تەواو بکە',
      'بە ٨١ خاڵ مێزەکەت بکەرەوە یان گرووپە چاوەڕوانەکان هەڵبوەشێنەوە.');
    if (konkanSelected.length !== 1) return Alert.alert('یەک کاشی هەڵبژێرە', 'بۆ کۆتایی نۆرە تەنها یەک کاشی فڕێ بدە.');
    const final = konkanBoard.opened && konkanBoard.hand.length === 1;
    setKonkanBoard(previous => ({ ...previous, discard: previous.hand.find(tile => tile.id === konkanSelected[0]),
      hand: previous.hand.filter(tile => tile.id !== konkanSelected[0]),
      phase: final ? 'done' : 'draw', won: final, turns: previous.turns + 1 }));
    setKonkanSelected([]);
    if (final) Alert.alert('پیرۆزە! 🏰', 'ڕاهێنانی کۆنکانت تەواو کرد؛ ئەمە یاریی ئۆنلاین نییە.');
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
  const nav = <View style={[styles.nav, screen === 'rooms' && styles.navWarm]}>
    {[[ '⌂', 'ماڵەوە', 'home' ], [ '◈', 'ژوورەکان', 'rooms' ], [ '♛', 'پلەکان', 'leaderboard' ],
      [ '◉', 'کۆین', 'wallet' ], [ '●', 'هەژمار', 'profile' ]].map(([icon, label, destination]) =>
      <TouchableOpacity key={destination} accessibilityRole="button" onPress={() => setScreen(destination)} style={styles.navItem}>
        <Text style={[styles.navIcon, screen === 'rooms' && styles.navIconWarm,
          screen === destination && (screen === 'rooms' ? styles.navActiveWarm : styles.navActive)]}>{icon}</Text>
        <Text style={[styles.navLabel, screen === 'rooms' && styles.navLabelWarm,
          screen === destination && (screen === 'rooms' ? styles.navActiveWarm : styles.navActive)]}>{label}</Text>
      </TouchableOpacity>)}
  </View>;

  return <SafeAreaView style={[styles.safe, screen === 'rooms' && styles.safeRooms]}>
    <StatusBar barStyle={screen === 'rooms' ? 'dark-content' : 'light-content'} />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
      {screen === 'home' && <>
        <View style={styles.homeHeader}>
          <View style={styles.avatar}><KurdistanFlag width={40} height={27} /></View>
          <View style={styles.homeIdentity}><Text style={styles.small}>بەخێربێیتەوە، {name}</Text>
            <Text style={styles.heading}>تەحەدی <Text style={{ color: GOLD }}>پڵەس</Text></Text></View>
          <TouchableOpacity accessibilityRole="button" style={styles.coinChip} onPress={() => setScreen('wallet')}>
            <Text style={styles.balance}>🪙 {coins} ＋</Text></TouchableOpacity>
        </View>
        <ImageBackground source={require('./assets/zagros-citadel.jpg')} style={styles.hero}
          imageStyle={styles.heroImage} resizeMode="cover">
          <View style={styles.heroShade}>
            <View style={styles.heroTop}><KurdistanFlag width={64} height={43} />
              <Text style={styles.heroSmall}>قەڵای زاگرۆس · ئایفۆن</Text></View>
            <Text style={styles.heroTitle}>بەرەو قەڵای زاگرۆس،{ '\n' } پاڵەوان بە!</Text>
            <Text style={styles.heroCopy}>کۆنکان، ئۆکەی و تەحەدی · هەمووی بە کوردی.</Text>
            {button('🀄 مێزی یاری بکەرەوە', () => setScreen('okey'))}
            <Text style={styles.heroCaption}>ڕاهێنانی تاکەکەسی لە ئایفۆن</Text>
          </View>
        </ImageBackground>
        <View style={styles.stats}>
          <View><Text style={styles.stat}>🪙 {coins}</Text><Text style={styles.statLabel}>کۆینی دیمۆ</Text></View>
          <View style={styles.statDivider} />
          <View><Text style={styles.stat}>🏆 {wins}</Text><Text style={styles.statLabel}>بردنەوە</Text></View>
          <View style={styles.statDivider} />
          <View><Text style={styles.stat}>◈ {rooms.length}</Text><Text style={styles.statLabel}>ژووری ناوخۆیی</Text></View>
        </View>
        {title('⚔️ دۆخی ڕکابەری')}
        <View style={styles.modeGrid}>{[
          ['یەک بە یەک', '#3B2350', 'پرسیار · دوو کەس لە یەک ئامێر', () => begin('pk')],
          ['چوار بە چوار', '#173047', 'ژووری تیمی ناوخۆیی', () => openMode('4v4')],
          ['هەشت بە هەشت', '#403326', 'ژووری تیمی ناوخۆیی', () => openMode('8v8')],
          ['دوازدە بە دوازدە', '#24382D', 'ژووری تیمی ناوخۆیی', () => openMode('12v12')],
        ].map(([label, color, detail, action]) =>
          <TouchableOpacity key={label} accessibilityRole="button" style={[styles.modeBlock, { backgroundColor: color }]} onPress={action}>
            <Text style={styles.modeLarge}>{label}</Text><Text style={styles.modeMini}>{detail}</Text>
            <Text style={styles.modeEdge}>↗</Text>
          </TouchableOpacity>)}</View>
        {title('🎮 یاری و ژوورەکان')}
        {[['🏰', 'کۆنکان', 'ڕاهێنانی ٨١ خاڵ · تاکەکەسی', () => setScreen('konkan')],
          ['🀄', 'ئۆکەی', 'کاشی و جوکەر · تاکەکەسی', () => setScreen('okey')],
          ['🧠', 'تەحەدای زانیاری', '٨ پرسیار · وەڵام بدە', () => begin('quiz')],
          ['🎙️', 'ژووری گشتی و تایبەت', 'ژووری دیمۆ دروست بکە', () => setScreen('rooms')],
          ['🪙', 'کۆین و دیاری', 'کۆگای دیارییە ناوخۆییەکان', () => setScreen('wallet')]].map(([icon, label, detail, action]) =>
          <TouchableOpacity key={label} accessibilityRole="button" style={styles.modeCard} onPress={action}>
            <View style={styles.modeIconBox}><Text style={styles.modeIcon}>{icon}</Text></View>
            <View style={styles.modeBody}><Text style={styles.modeName}>{label}</Text>
              <Text style={styles.modeDetail}>{detail}</Text></View><Text style={styles.arrow}>‹</Text>
          </TouchableOpacity>)}
        {notice('وەشانی تاقیکردنەوە: یاری لەم مۆبایلەدایە؛ دەنگ، یاریزانی ئۆنلاین و پارەدانی ڕاستەقینە هێشتا نییە.')}
      </>}
      {screen === 'rooms' && <>
        <View style={styles.roomsHeader}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="گەڕانەوە سەرەکی"
            onPress={() => setScreen('home')}><Text style={styles.roomsSearch}>⌂</Text></TouchableOpacity>
          <View style={styles.roomsHeadingBox}><Text style={styles.roomsEyebrow}>تەحەدی پڵەس</Text>
            <Text style={styles.roomsHeading}>ژوورەکان</Text></View>
          <KurdistanFlag width={39} height={26} />
        </View>
        <ImageBackground source={require('./assets/zagros-citadel.jpg')} style={styles.roomsBanner}
          imageStyle={styles.roomsBannerImage} resizeMode="cover">
          <View style={styles.roomsBannerShade}><Text style={styles.roomsBannerTitle}>قەڵای زاگرۆس 🏰</Text>
            <Text style={styles.roomsBannerCopy}>بەخێربێیت بۆ دیوەخانی یاری</Text></View>
        </ImageBackground>
        <TouchableOpacity accessibilityRole="button" style={styles.roomsGiftBanner} onPress={() => setScreen('wallet')}>
          <Text style={styles.roomsGiftIcon}>🌼</Text>
          <Text style={styles.roomsGiftText}>دیارییەکانی ژوور و کۆینی دیمۆ</Text>
          <Text style={styles.roomsGiftArrow}>‹</Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomsFilters}>
          {['هەموو', 'ژوور', 'کۆنکان', 'تەحەدی', 'ژوورەکانی تۆ'].map(item =>
            <TouchableOpacity key={item} accessibilityRole="button" accessibilityState={{ selected: roomFilter === item }}
              onPress={() => setRoomFilter(item)} style={[styles.roomsFilter,
                roomFilter === item && styles.roomsFilterActive]}>
              <Text style={[styles.roomsFilterText, roomFilter === item && styles.roomsFilterTextActive]}>{item}</Text>
            </TouchableOpacity>)}
        </ScrollView>
        {roomFilter !== 'ژوورەکانی تۆ' && ROOM_PREVIEWS.filter(item => roomFilter === 'هەموو' || item.category === roomFilter).map((item, index) =>
          <TouchableOpacity key={item.title} accessibilityRole="button" style={styles.previewRoomCard}
            onPress={() => { setRoom({ title: item.title, host: 'نموونە', mode: 'ڕووکاری تاقیکردنەوە', preview: true }); setScreen('room'); }}>
            <View style={styles.previewRoomSide}><Text style={styles.previewRoomNumber}>٠{index + 1}</Text>
              <Text style={styles.previewRoomBadge}>نموونە</Text></View>
            <View style={styles.previewRoomInfo}><Text style={styles.previewRoomTitle}>{item.title}</Text>
              <Text style={styles.previewRoomCaption}>{item.caption}</Text>
              <Text style={styles.previewRoomCategory}>{item.category} · دیزاینی پێشەکی</Text></View>
            <View style={[styles.previewRoomThumb, { backgroundColor: item.tint }]}>
              <Text style={styles.previewRoomEmoji}>{item.icon}</Text></View>
          </TouchableOpacity>)}
        {roomFilter === 'ژوورەکانی تۆ' && !rooms.length &&
          <Text style={styles.roomsEmpty}>هێشتا ژووری خۆت دروست نەکردووە.</Text>}
        {rooms.length > 0 && (roomFilter === 'هەموو' || roomFilter === 'ژوورەکانی تۆ') && <>
          <Text style={styles.roomsSubheading}>ژوورەکانی تۆ</Text>
          {rooms.map(item => <TouchableOpacity key={item.id} accessibilityRole="button" style={styles.previewRoomCard}
            onPress={() => { setRoom(item); setScreen('room'); }}>
            <View style={styles.previewRoomSide}><Text style={styles.previewRoomBadge}>ناوخۆیی</Text></View>
            <View style={styles.previewRoomInfo}><Text style={styles.previewRoomTitle}>{item.title}</Text>
              <Text style={styles.previewRoomCaption}>خاوەن: {item.host} · {item.mode}</Text></View>
            <View style={[styles.previewRoomThumb, { backgroundColor: '#DFEBDF' }]}>
              <Text style={styles.previewRoomEmoji}>🎙️</Text></View>
          </TouchableOpacity>)}</>}
        <View style={styles.roomsCreator}><Text style={styles.roomsSubheading}>ژووری خۆت دروست بکە</Text>
          <View style={styles.roomsModeRow}>{['1v1', '4v4', '8v8', '12v12'].map((item, index) =>
            <TouchableOpacity key={item} accessibilityRole="button" style={[styles.roomsMode,
              roomMode === item && styles.roomsModeActive]} onPress={() => setRoomMode(item)}>
              <Text style={[styles.roomsModeText, roomMode === item && styles.roomsModeTextActive]}>
                {['١ بە ١', '٤ بە ٤', '٨ بە ٨', '١٢ بە ١٢'][index]}</Text></TouchableOpacity>)}</View>
          <TextInput style={styles.roomsInput} value={roomName} onChangeText={setRoomName}
            placeholder="ناوی ژوورەکەت بنووسە" placeholderTextColor="#938988" maxLength={36} />
          <TouchableOpacity accessibilityRole="button" style={styles.roomsCreateButton} onPress={createRoom}>
            <Text style={styles.roomsCreateText}>＋ ژووری ناوخۆیی دروست بکە</Text></TouchableOpacity>
          <Text style={styles.roomsFootnote}>ئەم ژوورە لەم ئایفۆنەدایە؛ ژووری ئۆنلاین و دەنگ هێشتا نییە.</Text>
        </View>
      </>}
      {screen === 'room' && <>{header(room?.title || 'ژوور')}
        <View style={styles.sectionHero}><Text style={styles.sectionIcon}>🎙️</Text>
          <Text style={styles.sectionHeading}>{room?.title || 'ژوور'}</Text>
          <Text style={styles.sectionCopy}>{room?.mode || '1v1'} · {room?.preview ? 'نموونەی ڕووکار' : 'ژووری ناوخۆیی'}</Text></View>
        <View style={styles.seatCard}><Text style={styles.seatAvatar}>♛</Text>
          <View><Text style={styles.modeName}>{room?.host || name}</Text>
            <Text style={styles.modeDetail}>خاوەنی ژوور · ئەندامی ئێستا</Text></View></View>
        {notice(room?.preview ? 'ئەمە ژووری ڕاستەقینە نییە؛ تەنها نموونەی دیزاینە. بۆ ژووری خۆت لە شاشەی ژوورەکاندا ژووری ناوخۆیی دروست بکە.' :
          'بۆ یاریی دوو کەس لە هەمان ئایفۆن دوگمەی ڕکابەری بەکار بهێنە. میکرۆفۆن و بانگهێشتنی ئۆنلاین هێشتا نییە.')}
        {button('⚔️ ڕکابەری دەست پێ بکە', () => begin('pk'))}
        {button('🧠 تەحەدای پرسیار', () => begin('quiz'), true)}
        {button('دەرچوون لە ژوور', () => setScreen('rooms'), true)}</>}
      {screen === 'question' && <>{header(mode === 'pk' ? 'ڕکابەری' : 'تەحەدا')}
        {mode === 'pk' ? <View style={styles.arena}>
          <View style={styles.fighter}><Text style={styles.fighterAvatar}>♛</Text>
            <Text style={styles.fighterName}>یاریزانی ١</Text><Text style={styles.fighterScore}>{points[0]}</Text></View>
          <View><Text style={styles.vs}>بەرامبەر</Text><Text style={styles.arenaHint}>٤ پرسیار بۆ هەر کەس</Text></View>
          <View style={styles.fighter}><Text style={[styles.fighterAvatar, styles.fighterBlue]}>●</Text>
            <Text style={styles.fighterName}>یاریزانی ٢</Text><Text style={styles.fighterScore}>{points[1]}</Text></View>
        </View> : <View style={styles.quizBanner}><Text style={styles.sectionHeading}>🧠 تەحەدای زانیاری</Text>
          <Text style={styles.sectionCopy}>وەڵامی ڕاست · ١٠ کۆینی دیمۆ</Text></View>}
        {mode === 'pk' && notice('نۆرەی یاریزانی ' + (turn + 1) + ' ـەمە؛ مۆبایلەکە بۆ ئەوی تر پاس بکە.')}
        <View style={styles.questionMeta}><Text style={styles.metaText}>پرسیار {index + 1} / {quiz.length}</Text>
          {badge(mode === 'pk' ? 'ڕکابەری · ناوخۆیی' : 'کۆین +١٠')}</View>
        <View style={styles.progressTrack}><View style={[styles.progressFill,
          { width: (((index + 1) / quiz.length) * 100) + '%' }]} /></View>
        <View style={styles.question}><Text style={styles.questionText}>{quiz[index].q}</Text></View>
        {quiz[index].choices.map((choice, i) => <TouchableOpacity key={i} disabled={picked !== null}
          onPress={() => choose(i)} style={[styles.choice,
            picked !== null && i === quiz[index].answer && styles.correct,
            picked === i && i !== quiz[index].answer && styles.incorrect]}>
          <Text style={styles.choiceLetter}>{['١', '٢', '٣', '٤'][i]}</Text>
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
      {screen === 'konkan' && <>{header('کۆنکان')}
        <ImageBackground source={require('./assets/zagros-citadel.jpg')} style={styles.konkanBanner}
          imageStyle={styles.heroImage} resizeMode="cover">
          <View style={styles.konkanBannerShade}><KurdistanFlag width={54} height={36} />
            <Text style={styles.sectionHeading}>مێزی قەڵای زاگرۆس</Text>
            <Text style={styles.sectionCopy}>کۆنکان · ڕاهێنانی تاکەکەسی · یاسای هەولێر</Text></View>
        </ImageBackground>
        <View style={styles.okeyTable}>
          <View style={styles.tableTop}><Text style={styles.tableSeat}>◯ شوێنی هاوتیم · یاریزانی ئۆنلاین نییە</Text>
            {badge(konkanBoard.opened ? 'کرایەوە' : '٨١ خاڵ')}</View>
          <View style={styles.tableCenter}>
            <View style={styles.tablePile}><Text style={styles.tablePileIcon}>▤</Text>
              <Text style={styles.tablePileLabel}>{konkanBoard.stock.length} کاشی</Text></View>
            <View style={styles.tableCup}><Text style={styles.tableCupLabel}>جام</Text>
              <View style={[styles.cupTile, { borderColor: colors[konkanBoard.cup.color] }]}>
                <Text style={[styles.tileText, { color: colors[konkanBoard.cup.color] }]}>{konkanBoard.cup.number}</Text></View>
              <Text style={styles.tableCupLabel}>جوکەر {konkan.jokerFor(konkanBoard.cup).number}</Text></View>
            <View style={styles.tablePile}><Text style={styles.tablePileIcon}>{konkanBoard.discard?.number || '—'}</Text>
              <Text style={styles.tablePileLabel}>فڕێدراو</Text></View>
          </View><Text style={styles.tableSeat}>نۆرەی {konkanBoard.turns + 1} · {konkanBoard.opened ?
            'گرووپەکان لەسەر مێزن' : 'گرووپەکان بگەیەنە ٨١ خاڵ'}</Text>
        </View>
        {konkanBoard.melds.length > 0 && <>{title('گرووپەکانی سەر مێز')}
          {konkanBoard.melds.map((group, index) => <View key={index} style={styles.meldRow}>
            <Text style={styles.meldText}>{group.map(tile => tile.number).join(' · ')} · {konkan.meldPoints(group)} خاڵ</Text></View>)}</>}
        {konkanBoard.pending.length > 0 && <>{title('گرووپە چاوەڕوانەکان')}
          <Text style={styles.notice}>{konkanBoard.pending.reduce((sum, group) => sum + konkan.meldPoints(group), 0)} / ٨١ خاڵ · لەم نۆرەدا</Text>
          {konkanBoard.pending.map((group, index) => <View key={index} style={styles.meldRow}>
            <Text style={styles.meldText}>{group.map(tile => tile.number).join(' · ')} · {konkan.meldPoints(group)} خاڵ</Text></View>)}</>}
        {title('کاشییەکانی تۆ')}
        <View style={styles.rack}><View style={styles.tileRow}>{konkanBoard.hand.map(tile =>
          <TouchableOpacity key={tile.id} accessibilityRole="button" accessibilityLabel={'کاشی ' + tile.number}
            onPress={() => toggleKonkanTile(tile.id)} style={[styles.tile, { borderColor: colors[tile.color] },
              konkanSelected.includes(tile.id) && styles.selectedTile]}>
            <Text style={[styles.tileText, { color: colors[tile.color] }]}>{tile.color === 'false' ||
              konkan.isRealJoker(tile, konkanBoard.cup) ? '★' : tile.number}</Text></TouchableOpacity>)}</View></View>
        {konkanBoard.won ? notice('ڕاهێنانەکەت تەواو بوو! مێزێکی نوێ دەست پێ بکە.') :
          notice(konkanBoard.phase === 'draw' ? 'سەرەتا یەک کاشی لە کۆگا هەڵبگرە.' :
            '٣ تا ٥ کاشی هەڵبژێرە بۆ گرووپ، یان یەک کاشی فڕێ بدە بۆ کۆتایی نۆرە.')}
        {konkanBoard.phase === 'draw' && button('▤ کاشی هەڵبگرە', drawKonkan)}
        {konkanBoard.phase === 'meld' && <>{button('◈ گرووپ زیاد بکە', addKonkanMeld)}
          {!konkanBoard.opened && konkanBoard.pending.length > 0 && <>{button('🏰 بە ٨١ خاڵ مێز بکەرەوە', openKonkan)}
            {button('گرووپەکان هەڵبوەشێنەوە', undoKonkan, true)}</>}
          {button('یەک کاشی فڕێ بدە', discardKonkan, true)}</>}
        {button('مێزی کۆنکانی نوێ', () => { setKonkanBoard(konkan.startKonkan()); setKonkanSelected([]); }, true)}
        {notice('ئەمە ڕاهێنانی بنەڕەتییە: جوکەر، دزینی جوکەر، تیمی ٤ کەسی، پلەبەندی و هەموو وردەیاساکان هێشتا جێبەجێ نەکراون.')}</>}
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
            <View style={styles.tableCup}><Text style={styles.tableCupLabel}>نیشاندەر · جام</Text>
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
        {notice('ئەمە دیمۆی تاکەکەسیی ئۆکەیە؛ یاریی چوار کەسی و وردەیاسای تەواوی کۆنکان لە ڕاهێنانەکەدا هێشتا نییە.')}</>}
      {screen === 'leaderboard' && <>{header('پلەکان')}
        <View style={styles.sectionHero}><Text style={styles.sectionIcon}>🏆</Text>
          <Text style={styles.sectionHeading}>پلەبەندی</Text><Text style={styles.sectionCopy}>تەنها ئەنجامی ئەم مۆبایلە</Text></View>
        <View style={styles.modeCard}><View style={styles.modeIconBox}><Text style={styles.modeIcon}>🥇</Text></View>
          <View style={styles.modeBody}><Text style={styles.modeName}>{name || 'یاریزان'}</Text>
            <Text style={styles.modeDetail}>{wins} بردنەوە · {coins} کۆینی دیمۆ</Text></View>{badge('#١')}</View>
        {notice('پلەبەندی گشتی و یاریزانانی LIVE هێشتا پەیوەست نەکراون.')}</>}
      {screen === 'profile' && <>{header('هەژمار')}
        <View style={styles.profileHero}><KurdistanFlag width={72} height={48} />
          <Text style={styles.sectionHeading}>{name || 'یاریزان'}</Text>
          <Text style={styles.sectionCopy}>تەحەدی ژیانە 👑</Text></View>
        {title('ناوی یاریزان')}
        <TextInput style={styles.input} value={name} onChangeText={setName}
          placeholder="ناوی یاریزان" placeholderTextColor="#8895A9" maxLength={24} />
        <View style={styles.stats}><Text style={styles.stat}>🪙 {coins} کۆین</Text>
          <Text style={styles.stat}>🏆 {wins} بردنەوە</Text></View>
        {button('🪙 کۆین و دیارییەکان', () => setScreen('wallet'))}
        {notice('ئەم داتایە لەسەر هەمان ئایفۆنەکەت دەپارێزرێت؛ هەژماری ئۆنلاین هێشتا نییە.')}</>}
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
        {[['🌹', 'گوڵ', 'rose', 30], ['🏆', 'کۆپا', 'trophy', 60], ['👑', 'تاج', 'crown', 100],
          ['🦅', 'هەڵۆی زێڕین', 'eagle', 160], ['🏰', 'قەڵای زاگرۆس', 'zagros', 220]].map(([icon, label, key, price]) =>
          <View key={key} style={styles.giftCard}><Text style={styles.giftIcon}>{icon}</Text>
            <View style={styles.modeBody}><Text style={styles.modeName}>{label}</Text>
              <Text style={styles.modeDetail}>لە کۆگا: {inventory[key]} · {price} کۆین</Text></View>
            <TouchableOpacity accessibilityRole="button" style={styles.giftButton} onPress={() => collectGift(key, price, label)}>
              <Text style={styles.giftButtonText}>زیاد بکە</Text></TouchableOpacity></View>)}
        {notice('نرخەکان تەنها بۆ دیمۆن؛ ئەم دیارییانە لە کۆگای ناوخۆیی زیاد دەبن و ناتوانرێت ئۆنلاین بنێردرێن. کڕینی کۆین بە پارەی ڕاستەقینە نییە.')}
        {button('⚔️ بە تەحەدا کۆین کۆ بکەرەوە', () => begin('quiz'))}</>}
    </ScrollView>
    {['home', 'rooms', 'leaderboard', 'wallet', 'profile'].includes(screen) && nav}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  safeRooms: { backgroundColor: '#FAF7F4' },
  page: { padding: 18, paddingBottom: 112 },
  roomsHeader: { backgroundColor: '#FFE3D6', marginHorizontal: -18, marginTop: -18,
    paddingHorizontal: 18, paddingTop: 28, paddingBottom: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between' },
  roomsSearch: { color: '#28242D', fontSize: 31, width: 43, textAlign: 'center' },
  roomsHeadingBox: { flex: 1, alignItems: 'flex-end', marginRight: 13 },
  roomsEyebrow: { color: '#745F5F', fontSize: 12 },
  roomsHeading: { color: '#1D1C22', fontWeight: '900', fontSize: 25 },
  roomsBanner: { overflow: 'hidden', height: 123, borderRadius: 17, marginTop: 12 },
  roomsBannerImage: { borderRadius: 17 },
  roomsBannerShade: { flex: 1, backgroundColor: 'rgba(19,13,17,0.48)', alignItems: 'flex-end',
    justifyContent: 'flex-end', padding: 14 },
  roomsBannerTitle: { color: '#FFF8EF', fontSize: 22, fontWeight: '900', textAlign: 'right' },
  roomsBannerCopy: { color: '#F8E1C8', fontSize: 13, marginTop: 3, textAlign: 'right' },
  roomsGiftBanner: { backgroundColor: '#FFBE58', borderRadius: 18, flexDirection: 'row',
    alignItems: 'center', minHeight: 72, marginTop: 14, paddingHorizontal: 15 },
  roomsGiftIcon: { fontSize: 29 },
  roomsGiftText: { color: '#3A2730', fontSize: 16, fontWeight: '800', flex: 1,
    textAlign: 'right', marginHorizontal: 9 },
  roomsGiftArrow: { color: '#573B31', fontSize: 28 },
  roomsFilters: { flexDirection: 'row-reverse', paddingVertical: 14, alignItems: 'center' },
  roomsFilter: { backgroundColor: '#F0F1F3', borderRadius: 25, paddingHorizontal: 14,
    paddingVertical: 9, marginLeft: 7 },
  roomsFilterActive: { backgroundColor: '#FF875F' },
  roomsFilterText: { color: '#6F727A', fontWeight: '700', fontSize: 14 },
  roomsFilterTextActive: { color: '#FFFFFF' },
  previewRoomCard: { backgroundColor: '#FFFFFF', borderRadius: 18, minHeight: 94,
    padding: 11, flexDirection: 'row', alignItems: 'center', marginBottom: 10,
    shadowColor: '#452328', shadowOpacity: 0.05, shadowRadius: 7, elevation: 2 },
  previewRoomSide: { width: 58, justifyContent: 'space-between', minHeight: 57,
    alignItems: 'flex-start' },
  previewRoomNumber: { color: '#888A92', fontSize: 15, fontWeight: '700' },
  previewRoomBadge: { color: '#DC734F', fontSize: 11, fontWeight: '800' },
  previewRoomInfo: { flex: 1, paddingHorizontal: 8, alignItems: 'flex-end' },
  previewRoomTitle: { color: '#24232B', fontSize: 18, fontWeight: '900', textAlign: 'right' },
  previewRoomCaption: { color: '#7B7D85', fontSize: 13, textAlign: 'right', marginTop: 4 },
  previewRoomCategory: { color: '#D27953', fontSize: 11, textAlign: 'right', marginTop: 5 },
  previewRoomThumb: { width: 67, height: 67, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center' },
  previewRoomEmoji: { fontSize: 36 },
  roomsEmpty: { color: '#73737B', fontSize: 15, paddingVertical: 18, textAlign: 'right' },
  roomsSubheading: { color: '#25242A', fontWeight: '900', fontSize: 19, textAlign: 'right',
    marginVertical: 9 },
  roomsCreator: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15, marginTop: 6 },
  roomsModeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  roomsMode: { backgroundColor: '#F0F1F3', borderRadius: 12, paddingVertical: 9,
    alignItems: 'center', width: '24%' },
  roomsModeActive: { backgroundColor: '#FF875F' },
  roomsModeText: { color: '#73737B', fontWeight: '800', fontSize: 13 },
  roomsModeTextActive: { color: '#FFFFFF' },
  roomsInput: { borderWidth: 1, borderColor: '#DFD9D8', borderRadius: 13, color: '#24232B',
    padding: 13, marginVertical: 12, textAlign: 'right', fontSize: 16 },
  roomsCreateButton: { backgroundColor: '#FF875F', borderRadius: 12, padding: 14 },
  roomsCreateText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16, fontWeight: '900' },
  roomsFootnote: { color: '#777078', fontSize: 12, lineHeight: 19,
    textAlign: 'right', marginTop: 10 },
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
  hero: { backgroundColor: '#191719', borderRadius: 27, overflow: 'hidden', marginTop: 10,
    borderWidth: 1, borderColor: '#8A6629' },
  heroImage: { borderRadius: 27 },
  heroShade: { backgroundColor: 'rgba(7,8,13,0.55)', padding: 22, minHeight: 325,
    justifyContent: 'flex-end' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroCrown: { color: GOLD, fontSize: 48, textAlign: 'right' },
  heroSmall: { color: GOLD, fontSize: 14, textAlign: 'right', fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 29, textAlign: 'right', marginTop: 11,
    lineHeight: 38 },
  heroCopy: { color: '#C0B6A5', textAlign: 'right', marginVertical: 13, fontSize: 15 },
  heroCaption: { color: '#AF9C72', textAlign: 'center', marginTop: 6, fontSize: 12 },
  konkanBanner: { borderRadius: 21, overflow: 'hidden', marginVertical: 10, borderWidth: 1,
    borderColor: '#906B32' },
  konkanBannerShade: { minHeight: 142, backgroundColor: 'rgba(7,8,13,0.53)', padding: 14,
    alignItems: 'center', justifyContent: 'flex-end' },
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
  modeLarge: { color: '#FFF', fontSize: 19, fontWeight: '900', textAlign: 'right' },
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
  vs: { color: GOLD, textAlign: 'center', fontSize: 16, fontWeight: '900' },
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
  meldRow: { backgroundColor: '#254638', borderRadius: 12, borderWidth: 1, borderColor: '#8D713B',
    padding: 10, marginVertical: 3 },
  meldText: { color: '#F7E8BB', fontSize: 15, textAlign: 'center', fontWeight: '800' },
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
  navWarm: { backgroundColor: '#FFFFFF', borderTopColor: '#E9DDDC' },
  navItem: { alignItems: 'center', width: '20%' },
  navIcon: { color: '#898582', fontSize: 23 },
  navLabel: { color: '#898582', fontSize: 10 },
  navActive: { color: GOLD, fontWeight: '900' },
  navIconWarm: { color: '#858C96' },
  navLabelWarm: { color: '#858C96' },
  navActiveWarm: { color: '#FF875F', fontWeight: '900' },
});
