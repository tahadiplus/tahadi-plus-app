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

const GOLD = '#F6B73C';
const GOLD2 = '#FFCF66';
const NAVY = '#07111F';
const CARD = '#101C2D';
const CARD2 = '#16263C';
const MUTED = '#9AA7B8';
const WHITE = '#F8FAFC';

const questions = [
  { q: 'پایتەختی هەرێمی کوردستان کام شارە؟', a: ['هەولێر', 'سلێمانی', 'دهۆک', 'کەرکووک'], c: 0 },
  { q: 'لە یاری تۆپی پێدا هەر تیمێک چەند یاریزان لە مەیداندا هەیە؟', a: ['٩', '١٠', '١١', '١٢'], c: 2 },
  { q: 'کامەیان گەورەترین کیشوەری جیهانە؟', a: ['ئەفریقا', 'ئاسیا', 'ئەوروپا', 'ئۆسترالیا'], c: 1 },
  { q: '٢ + ٨ × ٢ چەندە؟', a: ['٢٠', '١٨', '١٦', '١٢'], c: 1 },
];

const rooms = [
  ['🎙️', 'گفتوگۆی دوستانە', '256', '58'],
  ['🔥', 'چالێنجی گشتی', '189', '72'],
  ['🎮', 'گروپی شادمانی', '120', '46'],
  ['💡', 'زانست و زانیاری', '98', '39'],
  ['🎵', 'گۆرانی و موزیک', '76', '63'],
];

const ranking = [
  ['1', 'Aras.KRD', '12,450'],
  ['2', 'Rojan', '10,980'],
  ['3', 'DilanK', '9,760'],
  ['4', 'HawkKrd', '8,540'],
  ['5', 'Sarin 77', '7,430'],
];

const packs = [
  ['500', '€0.99'], ['1,200', '€1.99'], ['3,000', '€4.99'],
  ['7,000', '€9.99'], ['15,000', '€19.99'], ['40,000', '€49.99'],
];

const gifts = [
  ['🌹', 'گوڵی سوور', '20'],
  ['🏆', 'کۆپا', '100'],
  ['🦅', 'هەڵۆ', '500'],
  ['🏰', 'قەڵا', '1,500'],
  ['👑', 'تاج', '5,000'],
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [coins, setCoins] = useState(12450);
  const [score, setScore] = useState(120);
  const [q, setQ] = useState(0);
  const [pkYou, setPkYou] = useState(0);
  const [pkOpp, setPkOpp] = useState(0);
  const [teamSize, setTeamSize] = useState('4v4');

  const answer = (i) => {
    if (i === questions[q].c) {
      setScore((v) => v + 10);
      if (screen === 'pk') setPkYou((v) => v + 1);
    } else if (screen === 'pk') {
      setPkOpp((v) => v + 1);
    }
    setQ((v) => (v + 1) % questions.length);
  };

  const TopBar = ({ title = 'Tahadi Plus', back = false }) => (
    <View style={s.topBar}>
      {back ? (
        <TouchableOpacity style={s.circleBtn} onPress={() => setScreen('home')}>
          <Text style={s.circleText}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.avatar}><Text style={s.avatarText}>T+</Text></View>
      )}
      <View style={s.topTitleBox}>
        <Text style={s.topTitle}>{title}</Text>
        <Text style={s.topSub}>تەحەدی پڵەس</Text>
      </View>
      <TouchableOpacity style={s.coinPill} onPress={() => setScreen('shop')}>
        <Text style={s.coinText}>🪙 {coins.toLocaleString()}</Text>
        <Text style={s.plus}>＋</Text>
      </TouchableOpacity>
    </View>
  );

  const BottomNav = () => (
    <View style={s.bottomNav}>
      {[
        ['🎮', 'یاری', 'rooms'],
        ['👥', 'دوست', 'team'],
        ['🏠', 'ڕووم', 'home'],
        ['🏆', 'ڕیزبەندی', 'ranking'],
        ['👤', 'من', 'profile'],
      ].map(([icon, label, target]) => (
        <TouchableOpacity key={target} style={s.navItem} onPress={() => setScreen(target)}>
          <Text style={[s.navIcon, screen === target && s.navActive]}>{icon}</Text>
          <Text style={[s.navLabel, screen === target && s.navActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const Quiz = ({ pk = false }) => (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.page}>
        <TopBar title={pk ? 'PK' : 'تەحەدی'} back />
        {pk && (
          <View style={s.pkScoreBox}>
            <View><Text style={s.pkName}>تۆ</Text><Text style={s.pkScore}>{pkYou}</Text></View>
            <Text style={s.vs}>VS</Text>
            <View><Text style={s.pkName}>ڕکابەر</Text><Text style={s.pkScore}>{pkOpp}</Text></View>
          </View>
        )}
        <View style={s.progress}><View style={[s.progressFill, { width: `${((q + 1) / questions.length) * 100}%` }]} /></View>
        <Text style={s.counter}>پرسیار {q + 1}/{questions.length}   ⭐ {score}</Text>
        <View style={s.questionCard}><Text style={s.question}>{questions[q].q}</Text></View>
        {questions[q].a.map((x, i) => (
          <TouchableOpacity key={i} style={s.answer} onPress={() => answer(i)}>
            <Text style={s.answerText}>{x}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  if (screen === 'quiz') return <Quiz />;
  if (screen === 'pk') return <Quiz pk />;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.flex}>
        <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
          {screen === 'home' && (
            <>
              <TopBar />
              <View style={s.hero}>
                <Text style={s.heroCrown}>👑</Text>
                <Text style={s.heroTitle}>TAHADI PLUS</Text>
                <Text style={s.heroKurdish}>تەحەدی پڵەس</Text>
                <Text style={s.heroSub}>یاری بکە • ڕکابەری بکە • بەرەو سەرەوە بچۆ</Text>
                <TouchableOpacity style={s.playBtn} onPress={() => setScreen('pk')}>
                  <Text style={s.playText}>▶  یاری بکە</Text>
                </TouchableOpacity>
              </View>

              <View style={s.modeRow}>
                {['PK', '1v1', '4v4', '8v8', '12v12'].map((x) => (
                  <TouchableOpacity key={x} style={s.modeChip} onPress={() => x === 'PK' ? setScreen('pk') : (setTeamSize(x), setScreen('team'))}>
                    <Text style={s.modeChipText}>{x}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.quickRow}>
                <TouchableOpacity style={s.quickCard} onPress={() => setScreen('quiz')}>
                  <Text style={s.quickIcon}>🧠</Text><Text style={s.quickTitle}>تەحەدی</Text><Text style={s.quickSub}>پرسیار و وەڵام</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.quickCard} onPress={() => setScreen('team')}>
                  <Text style={s.quickIcon}>⚔️</Text><Text style={s.quickTitle}>کۆنکان</Text><Text style={s.quickSub}>یاری گرووپی</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.quickCard} onPress={() => setScreen('shop')}>
                  <Text style={s.quickIcon}>🛒</Text><Text style={s.quickTitle}>فرۆشگا</Text><Text style={s.quickSub}>کۆین و دیاری</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.sectionTitle}>ڕوومە چالاکەکان</Text>
              {rooms.slice(0, 3).map((r, i) => (
                <TouchableOpacity key={i} style={s.roomCard} onPress={() => setScreen('rooms')}>
                  <View style={s.roomIcon}><Text style={s.roomEmoji}>{r[0]}</Text></View>
                  <View style={s.roomCopy}><Text style={s.roomTitle}>{r[1]}</Text><Text style={s.roomSub}>🟢 ئەنلاین  •  👥 {r[2]}</Text></View>
                  <View style={s.levelPill}><Text style={s.levelText}>👑 {r[3]}</Text></View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {screen === 'rooms' && (
            <>
              <TopBar title="ڕوومەکان" back />
              <Text style={s.sectionTitle}>گفتوگۆ و یاری</Text>
              {rooms.map((r, i) => (
                <TouchableOpacity key={i} style={s.roomCard}>
                  <View style={s.roomIcon}><Text style={s.roomEmoji}>{r[0]}</Text></View>
                  <View style={s.roomCopy}><Text style={s.roomTitle}>{r[1]}</Text><Text style={s.roomSub}>👥 {r[2]} بەشداربوو</Text></View>
                  <View style={s.livePill}><Text style={s.liveText}>LIVE</Text></View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {screen === 'shop' && (
            <>
              <TopBar title="فرۆشگای تەحەدی" back />
              <View style={s.tabs}><View style={s.tabActive}><Text style={s.tabActiveText}>🪙 کۆین</Text></View><View style={s.tab}><Text style={s.tabText}>🎁 دیاری</Text></View><View style={s.tab}><Text style={s.tabText}>👑 VIP</Text></View></View>
              <Text style={s.sectionTitle}>پاکێجی کۆین</Text>
              <View style={s.packGrid}>
                {packs.map((p, i) => (
                  <TouchableOpacity key={i} style={s.packCard} onPress={() => setCoins((v) => v + Number(p[0].replace(',', '')))}>
                    <Text style={s.packIcon}>🪙</Text><Text style={s.packAmount}>{p[0]}</Text><Text style={s.packLabel}>کۆین</Text><View style={s.priceBtn}><Text style={s.priceText}>{p[1]}</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.sectionTitle}>دیارییە تایبەتەکان</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.giftRow}>
                {gifts.map((g, i) => <View key={i} style={s.giftCard}><Text style={s.giftIcon}>{g[0]}</Text><Text style={s.giftName}>{g[1]}</Text><Text style={s.giftPrice}>🪙 {g[2]}</Text></View>)}
              </ScrollView>
              <View style={s.vipCard}><Text style={s.vipBig}>👑 VIP</Text><View style={s.vipCopy}><Text style={s.vipTitle}>تەحەدی VIP</Text><Text style={s.vipSub}>نیشانی تایبەت، پڕۆفایلی زێڕین و تایبەتمەندی زیاتر</Text></View><View style={s.vipPrice}><Text style={s.vipPriceText}>€4.99</Text></View></View>
            </>
          )}

          {screen === 'ranking' && (
            <>
              <TopBar title="ڕیزبەندی" back />
              <View style={s.podium}><Text style={s.podiumEmoji}>🏆</Text><Text style={s.podiumTitle}>باشترین یاریزانەکان</Text><Text style={s.podiumSub}>Weekly Ranking</Text></View>
              {ranking.map((r, i) => (
                <View key={i} style={s.rankRow}><Text style={s.rankNo}>{r[0]}</Text><View style={s.rankAvatar}><Text>👤</Text></View><Text style={s.rankName}>{r[1]}</Text><Text style={s.rankCoins}>🪙 {r[2]}</Text></View>
              ))}
            </>
          )}

          {screen === 'profile' && (
            <>
              <TopBar title="پڕۆفایل" back />
              <View style={s.profileCard}><View style={s.profileAvatar}><Text style={s.profileEmoji}>👤</Text></View><Text style={s.profileName}>KurdPlayer</Text><Text style={s.profileTag}>Challenge is Life 👑</Text><View style={s.profileStats}><View><Text style={s.statNum}>{coins.toLocaleString()}</Text><Text style={s.statLabel}>کۆین</Text></View><View><Text style={s.statNum}>24</Text><Text style={s.statLabel}>بردنەوە</Text></View><View><Text style={s.statNum}>12</Text><Text style={s.statLabel}>ئاست</Text></View></View></View>
              {['📊 ئامارەکانم','👥 هاوڕێکان','🎨 جوانکاری پڕۆفایل','⚙️ ڕێکخستن','↪️ دەرچوون'].map((x,i)=><TouchableOpacity key={i} style={s.menuRow}><Text style={s.menuText}>{x}</Text><Text style={s.menuArrow}>‹</Text></TouchableOpacity>)}
            </>
          )}

          {screen === 'team' && (
            <>
              <TopBar title="شەڕی تیمەکان" back />
              <View style={s.teamBanner}><Text style={s.teamMode}>{teamSize}</Text><Text style={s.teamTitle}>تیمی خۆت ئامادە بکە</Text><Text style={s.teamSub}>هاوڕێکانت بانگ بکە و پێکەوە یاری بکەن</Text></View>
              <View style={s.teamsWrap}>
                <View style={[s.teamPanel, s.redPanel]}><Text style={s.redTitle}>🔴 تیمی سوور</Text>{['Aras.KRD','Sarin 77','DilanK','＋ یاریزان'].map((x,i)=><View key={i} style={s.playerRow}><Text style={s.playerDot}>{i<3?'✅':'➕'}</Text><Text style={s.playerName}>{x}</Text></View>)}</View>
                <View style={[s.teamPanel, s.bluePanel]}><Text style={s.blueTitle}>🔵 تیمی شین</Text>{['Rojan','Zagros.95','HawkKrd','＋ یاریزان'].map((x,i)=><View key={i} style={s.playerRow}><Text style={s.playerDot}>{i<3?'✅':'➕'}</Text><Text style={s.playerName}>{x}</Text></View>)}</View>
              </View>
              <Text style={s.sectionTitle}>هەڵبژاردنی کاراکتەر</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.characterRow}>{['🧔','👩','🧑‍💻','🥷','👩‍🎤','🧢','🤖'].map((x,i)=><View key={i} style={[s.character,i===0&&s.characterActive]}><Text style={s.characterEmoji}>{x}</Text></View>)}</ScrollView>
              <View style={s.voiceBox}><Text style={s.voiceTitle}>🎙️ دەنگی تیم</Text><View style={s.voiceControls}><Text style={s.voiceOn}>🎤 کراوە</Text><Text style={s.voiceOn}>🔊 تیم</Text><Text style={s.voiceOff}>👥 هەموو</Text></View></View>
              <TouchableOpacity style={s.readyBtn}><Text style={s.readyText}>ئامادەم</Text></TouchableOpacity>
            </>
          )}
        </ScrollView>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:NAVY}, flex:{flex:1}, page:{padding:16,paddingBottom:110},
  topBar:{flexDirection:'row',alignItems:'center',marginBottom:18,gap:10}, circleBtn:{width:44,height:44,borderRadius:22,backgroundColor:CARD2,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#334155'}, circleText:{color:GOLD2,fontSize:34,lineHeight:36,fontWeight:'700'},
  avatar:{width:46,height:46,borderRadius:23,backgroundColor:GOLD,alignItems:'center',justifyContent:'center'},avatarText:{color:NAVY,fontWeight:'900',fontSize:16},topTitleBox:{flex:1},topTitle:{color:WHITE,fontSize:20,fontWeight:'900',textAlign:'right'},topSub:{color:MUTED,fontSize:11,textAlign:'right'},coinPill:{flexDirection:'row',alignItems:'center',backgroundColor:CARD2,borderColor:'#5B4520',borderWidth:1,paddingVertical:8,paddingHorizontal:10,borderRadius:18,gap:5},coinText:{color:GOLD2,fontWeight:'800'},plus:{color:NAVY,backgroundColor:GOLD,width:22,height:22,borderRadius:11,textAlign:'center',fontWeight:'900'},
  hero:{backgroundColor:'#101827',borderRadius:28,borderWidth:1,borderColor:'#604411',padding:24,alignItems:'center',marginBottom:16,shadowColor:GOLD,shadowOpacity:.18,shadowRadius:18},heroCrown:{fontSize:46},heroTitle:{color:GOLD2,fontSize:30,fontWeight:'900',letterSpacing:1.5},heroKurdish:{color:WHITE,fontSize:25,fontWeight:'900',marginTop:2},heroSub:{color:MUTED,fontSize:12,marginTop:8,textAlign:'center'},playBtn:{marginTop:20,backgroundColor:GOLD,paddingVertical:15,paddingHorizontal:34,borderRadius:17,width:'100%'},playText:{textAlign:'center',color:NAVY,fontSize:20,fontWeight:'900'},
  modeRow:{flexDirection:'row-reverse',gap:8,marginBottom:14},modeChip:{flex:1,backgroundColor:CARD,paddingVertical:11,borderRadius:14,borderWidth:1,borderColor:'#25364D'},modeChipText:{color:WHITE,textAlign:'center',fontWeight:'800'},quickRow:{flexDirection:'row-reverse',gap:10,marginBottom:18},quickCard:{flex:1,backgroundColor:CARD,borderRadius:18,padding:13,alignItems:'center',borderWidth:1,borderColor:'#27364B'},quickIcon:{fontSize:28},quickTitle:{color:WHITE,fontWeight:'900',fontSize:15,marginTop:5},quickSub:{color:MUTED,fontSize:10,marginTop:2},sectionTitle:{color:WHITE,fontSize:20,fontWeight:'900',textAlign:'right',marginTop:10,marginBottom:12},
  roomCard:{flexDirection:'row-reverse',alignItems:'center',backgroundColor:CARD,marginBottom:10,borderRadius:19,padding:12,borderWidth:1,borderColor:'#22334A'},roomIcon:{width:52,height:52,borderRadius:16,backgroundColor:'#1D2C42',alignItems:'center',justifyContent:'center'},roomEmoji:{fontSize:26},roomCopy:{flex:1,paddingHorizontal:12},roomTitle:{color:WHITE,textAlign:'right',fontWeight:'900',fontSize:16},roomSub:{color:MUTED,textAlign:'right',fontSize:11,marginTop:4},levelPill:{backgroundColor:'#412557',paddingHorizontal:10,paddingVertical:6,borderRadius:12},levelText:{color:'#E9C7FF',fontWeight:'800'},livePill:{backgroundColor:'#183B31',paddingHorizontal:10,paddingVertical:6,borderRadius:12},liveText:{color:'#51E6A8',fontWeight:'900',fontSize:11},
  progress:{height:8,backgroundColor:'#1F2B3D',borderRadius:8,overflow:'hidden',marginTop:8},progressFill:{height:'100%',backgroundColor:GOLD,borderRadius:8},counter:{color:MUTED,textAlign:'right',marginVertical:12,fontWeight:'700'},questionCard:{backgroundColor:WHITE,borderRadius:22,padding:24,marginBottom:16},question:{color:NAVY,fontWeight:'900',fontSize:23,textAlign:'right',lineHeight:36},answer:{backgroundColor:CARD,padding:17,borderRadius:16,marginBottom:10,borderWidth:1,borderColor:'#2A3A52'},answerText:{color:WHITE,textAlign:'right',fontSize:18,fontWeight:'800'},pkScoreBox:{flexDirection:'row',justifyContent:'space-around',alignItems:'center',backgroundColor:CARD,borderRadius:22,padding:18,borderWidth:1,borderColor:'#5D451A'},pkName:{color:MUTED,textAlign:'center'},pkScore:{color:WHITE,fontSize:34,fontWeight:'900',textAlign:'center'},vs:{color:GOLD,fontSize:23,fontWeight:'900'},
  tabs:{flexDirection:'row-reverse',backgroundColor:CARD,borderRadius:18,padding:5,marginBottom:14},tabActive:{flex:1,backgroundColor:GOLD,borderRadius:14,padding:11},tabActiveText:{color:NAVY,textAlign:'center',fontWeight:'900'},tab:{flex:1,padding:11},tabText:{color:MUTED,textAlign:'center',fontWeight:'800'},packGrid:{flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'space-between'},packCard:{width:'48.5%',backgroundColor:CARD,borderRadius:20,padding:16,alignItems:'center',marginBottom:12,borderWidth:1,borderColor:'#5B4520'},packIcon:{fontSize:34},packAmount:{color:GOLD2,fontSize:22,fontWeight:'900'},packLabel:{color:MUTED,fontSize:12},priceBtn:{backgroundColor:GOLD,marginTop:10,paddingVertical:8,paddingHorizontal:24,borderRadius:14},priceText:{color:NAVY,fontWeight:'900'},giftRow:{gap:10,paddingBottom:8},giftCard:{width:110,backgroundColor:CARD,borderRadius:18,padding:13,alignItems:'center'},giftIcon:{fontSize:35},giftName:{color:WHITE,fontWeight:'800',marginTop:6,fontSize:12},giftPrice:{color:GOLD2,fontWeight:'800',fontSize:11,marginTop:5},vipCard:{flexDirection:'row-reverse',alignItems:'center',backgroundColor:'#151D28',borderWidth:1,borderColor:GOLD,borderRadius:22,padding:15,marginTop:18},vipBig:{color:GOLD2,fontSize:24,fontWeight:'900'},vipCopy:{flex:1,paddingHorizontal:12},vipTitle:{color:WHITE,textAlign:'right',fontWeight:'900'},vipSub:{color:MUTED,textAlign:'right',fontSize:10,marginTop:3},vipPrice:{backgroundColor:GOLD,borderRadius:12,padding:9},vipPriceText:{color:NAVY,fontWeight:'900'},
  podium:{alignItems:'center',backgroundColor:CARD,borderRadius:24,padding:22,marginBottom:14,borderWidth:1,borderColor:'#5B4520'},podiumEmoji:{fontSize:52},podiumTitle:{color:WHITE,fontSize:22,fontWeight:'900'},podiumSub:{color:GOLD2,marginTop:4},rankRow:{flexDirection:'row',alignItems:'center',backgroundColor:CARD,marginBottom:9,borderRadius:16,padding:12},rankNo:{width:30,color:GOLD2,fontSize:18,fontWeight:'900'},rankAvatar:{width:38,height:38,borderRadius:19,backgroundColor:'#24344A',alignItems:'center',justifyContent:'center'},rankName:{flex:1,color:WHITE,fontWeight:'800',marginLeft:10},rankCoins:{color:GOLD2,fontWeight:'800'},
  profileCard:{backgroundColor:CARD,borderRadius:26,padding:22,alignItems:'center',borderWidth:1,borderColor:'#5B4520',marginBottom:16},profileAvatar:{width:92,height:92,borderRadius:46,backgroundColor:'#27364B',alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:GOLD},profileEmoji:{fontSize:48},profileName:{color:WHITE,fontSize:25,fontWeight:'900',marginTop:10},profileTag:{color:MUTED,marginTop:3},profileStats:{flexDirection:'row-reverse',justifyContent:'space-around',width:'100%',marginTop:20},statNum:{color:GOLD2,fontSize:20,fontWeight:'900',textAlign:'center'},statLabel:{color:MUTED,fontSize:11,textAlign:'center'},menuRow:{flexDirection:'row-reverse',alignItems:'center',backgroundColor:CARD,borderRadius:15,padding:15,marginBottom:8},menuText:{color:WHITE,flex:1,textAlign:'right',fontWeight:'800'},menuArrow:{color:GOLD2,fontSize:26},
  teamBanner:{backgroundColor:CARD,borderRadius:24,padding:20,alignItems:'center',borderWidth:1,borderColor:'#5B4520',marginBottom:14},teamMode:{color:GOLD2,fontSize:28,fontWeight:'900'},teamTitle:{color:WHITE,fontSize:22,fontWeight:'900',marginTop:4},teamSub:{color:MUTED,fontSize:11,marginTop:5},teamsWrap:{flexDirection:'row',gap:10},teamPanel:{flex:1,borderRadius:20,padding:12,borderWidth:1},redPanel:{backgroundColor:'#29131A',borderColor:'#793343'},bluePanel:{backgroundColor:'#10243B',borderColor:'#285A86'},redTitle:{color:'#FF718D',fontWeight:'900',textAlign:'center',marginBottom:8},blueTitle:{color:'#64B5FF',fontWeight:'900',textAlign:'center',marginBottom:8},playerRow:{flexDirection:'row',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#ffffff12'},playerDot:{fontSize:12},playerName:{color:WHITE,fontSize:11,fontWeight:'700',marginLeft:5,flex:1},characterRow:{gap:9,paddingBottom:8},character:{width:60,height:60,borderRadius:16,backgroundColor:CARD,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#32435B'},characterActive:{borderColor:GOLD,borderWidth:2},characterEmoji:{fontSize:31},voiceBox:{backgroundColor:CARD,borderRadius:20,padding:14,marginTop:12},voiceTitle:{color:WHITE,fontWeight:'900',textAlign:'right',marginBottom:10},voiceControls:{flexDirection:'row-reverse',gap:8},voiceOn:{flex:1,backgroundColor:'#14382E',color:'#55E0A6',padding:10,borderRadius:12,textAlign:'center',fontWeight:'800'},voiceOff:{flex:1,backgroundColor:'#263344',color:MUTED,padding:10,borderRadius:12,textAlign:'center',fontWeight:'800'},readyBtn:{backgroundColor:GOLD,borderRadius:18,padding:17,marginTop:16},readyText:{color:NAVY,fontSize:23,fontWeight:'900',textAlign:'center'},
  bottomNav:{position:'absolute',bottom:0,left:0,right:0,height:82,backgroundColor:'#0B1625',borderTopWidth:1,borderTopColor:'#24344A',flexDirection:'row',justifyContent:'space-around',paddingTop:9,paddingBottom:8},navItem:{alignItems:'center',justifyContent:'center',minWidth:58},navIcon:{fontSize:22,opacity:.65},navLabel:{color:MUTED,fontSize:10,marginTop:3},navActive:{color:GOLD2,opacity:1,fontWeight:'900'},
});