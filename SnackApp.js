import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const questions = [
  {
    q: "پایتەختی هەرێمی کوردستان کام شارە؟",
    a: ["هەولێر", "سلێمانی", "دهۆک", "کەرکووک"],
    c: 0,
  },
  {
    q: "هەر تیمی تۆپی پێ چەند یاریزان هەیە؟",
    a: ["٩", "١٠", "١١", "١٢"],
    c: 2,
  },
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [score, setScore] = useState(120);
  const [pkYou, setPkYou] = useState(0);
  const [pkOpp, setPkOpp] = useState(0);
  const [q, setQ] = useState(0);

  const answer = (i) => {
    if (i === questions[q].c) {
      setScore(score + 10);
      if (screen === "pk") setPkYou(pkYou + 1);
    } else if (screen === "pk") {
      setPkOpp(pkOpp + 1);
    }
    setQ((q + 1) % questions.length);
  };

  if (screen === "home") {
    return (
      <SafeAreaView style={s.bg}>
        <Text style={s.title}>🔥 Tahadi Plus</Text>
        <Text style={s.score}>⭐ {score} خاڵ</Text>

        <TouchableOpacity style={s.btn} onPress={() => setScreen("pk")}>
          <Text style={s.btnText}>⚔️ PK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btn} onPress={() => setScreen("quiz")}>
          <Text style={s.btnText}>🔥 تەحەدی</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btn} onPress={() => setScreen("konkan")}>
          <Text style={s.btnText}>🏆 کۆنکان</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen === "konkan") {
    return (
      <SafeAreaView style={s.bg}>
        <TouchableOpacity onPress={() => setScreen("home")}>
          <Text style={s.back}>← گەڕانەوە</Text>
        </TouchableOpacity>
        <Text style={s.title}>🏆 کۆنکان</Text>
        <Text style={s.center}>بەشی کۆنکان ئامادەیە بۆ زیادکردنی گرووپ و پلەبەندی.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.bg}>
      <TouchableOpacity onPress={() => setScreen("home")}>
        <Text style={s.back}>← گەڕانەوە</Text>
      </TouchableOpacity>

      {screen === "pk" && (
        <View style={s.pkBox}>
          <Text style={s.pkScore}>تۆ {pkYou}</Text>
          <Text style={s.vs}>VS</Text>
          <Text style={s.pkScore}>ڕکابەر {pkOpp}</Text>
        </View>
      )}

      <Text style={s.q}>{questions[q].q}</Text>

      {questions[q].a.map((x, i) => (
        <TouchableOpacity key={i} style={s.answer} onPress={() => answer(i)}>
          <Text style={s.answerText}>{x}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#F7F8FC", padding: 20 },
  title: { fontSize: 30, fontWeight: "900", textAlign: "center", marginTop: 30 },
  score: { textAlign: "center", fontSize: 18, marginBottom: 30, color: "#5B3DF5" },
  btn: { backgroundColor: "#5B3DF5", padding: 18, borderRadius: 18, marginBottom: 14 },
  btnText: { color: "#fff", textAlign: "center", fontSize: 20, fontWeight: "800" },
  back: { color: "#5B3DF5", fontSize: 18, fontWeight: "700", marginBottom: 20 },
  pkBox: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", padding: 15, borderRadius: 20, marginBottom: 20 },
  pkScore: { fontSize: 22, fontWeight: "900" },
  vs: { fontSize: 18, color: "#5B3DF5", fontWeight: "900" },
  q: { fontSize: 24, fontWeight: "900", textAlign: "right", marginBottom: 25 },
  answer: { backgroundColor: "#fff", padding: 18, borderRadius: 16, marginBottom: 12 },
  answerText: { fontSize: 18, textAlign: "right" },
  center: { textAlign: "center", fontSize: 17, lineHeight: 28, marginTop: 30 },
});
