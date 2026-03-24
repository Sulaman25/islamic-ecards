export interface QuranVerse {
  ref: string;
  surahEn: string;
  surahAr: string;
  ayah: number;
  textAr: string;
  textEn: string;
  occasions: string[];
}

export const QURAN_VERSES: QuranVerse[] = [
  {
    ref: "2:286",
    surahEn: "Al-Baqarah",
    surahAr: "البقرة",
    ayah: 286,
    textAr: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    textEn: "Allah does not burden a soul beyond that it can bear.",
    occasions: ["general", "graduation", "nikah"],
  },
  {
    ref: "94:5",
    surahEn: "Ash-Sharh",
    surahAr: "الشرح",
    ayah: 5,
    textAr: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    textEn: "Verily, with hardship comes ease.",
    occasions: ["general", "graduation"],
  },
  {
    ref: "3:173",
    surahEn: "Ali Imran",
    surahAr: "آل عمران",
    ayah: 173,
    textAr: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    textEn: "Allah is sufficient for us, and He is the best disposer of affairs.",
    occasions: ["general", "hajj"],
  },
  {
    ref: "30:21",
    surahEn: "Ar-Rum",
    surahAr: "الروم",
    ayah: 21,
    textAr:
      "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
    textEn:
      "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.",
    occasions: ["nikah"],
  },
  {
    ref: "7:189",
    surahEn: "Al-A'raf",
    surahAr: "الأعراف",
    ayah: 189,
    textAr:
      "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    textEn:
      "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    occasions: ["nikah", "general"],
  },
  {
    ref: "76:9",
    surahEn: "Al-Insan",
    surahAr: "الإنسان",
    ayah: 9,
    textAr:
      "إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ لَا نُرِيدُ مِنكُمْ جَزَاءً وَلَا شُكُورًا",
    textEn:
      "We feed you only for the countenance of Allah. We wish not from you reward or gratitude.",
    occasions: ["ramadan", "general"],
  },
  {
    ref: "97:1-3",
    surahEn: "Al-Qadr",
    surahAr: "القدر",
    ayah: 1,
    textAr:
      "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ۝ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ۝ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
    textEn:
      "Indeed, We sent it down during the Night of Power. And what can make you know what is the Night of Power? The Night of Power is better than a thousand months.",
    occasions: ["laylatul-qadr", "ramadan"],
  },
  {
    ref: "2:185",
    surahEn: "Al-Baqarah",
    surahAr: "البقرة",
    ayah: 185,
    textAr:
      "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ",
    textEn:
      "The month of Ramadan is that in which the Quran was revealed as guidance for the people.",
    occasions: ["ramadan"],
  },
  {
    ref: "49:13",
    surahEn: "Al-Hujurat",
    surahAr: "الحجرات",
    ayah: 13,
    textAr:
      "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ",
    textEn:
      "Indeed, the most noble of you in the sight of Allah is the most righteous.",
    occasions: ["graduation", "general", "eid-ul-fitr", "eid-ul-adha"],
  },
  {
    ref: "3:37",
    surahEn: "Ali Imran",
    surahAr: "آل عمران",
    ayah: 37,
    textAr:
      "كُلَّمَا دَخَلَ عَلَيْهَا زَكَرِيَّا الْمِحْرَابَ وَجَدَ عِندَهَا رِزْقًا",
    textEn:
      "Every time Zakariya entered upon her in the prayer chamber, he found with her provision.",
    occasions: ["aqiqah", "general"],
  },
  {
    ref: "21:83",
    surahEn: "Al-Anbiya",
    surahAr: "الأنبياء",
    ayah: 83,
    textAr:
      "رَّبِّي إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
    textEn: "My Lord, adversity has touched me, and You are the Most Merciful of the merciful.",
    occasions: ["general"],
  },
  {
    ref: "22:27",
    surahEn: "Al-Hajj",
    surahAr: "الحج",
    ayah: 27,
    textAr:
      "وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ",
    textEn:
      "And proclaim to the people the Hajj; they will come to you on foot and on every lean camel.",
    occasions: ["hajj"],
  },
  {
    ref: "62:9",
    surahEn: "Al-Jumu'ah",
    surahAr: "الجمعة",
    ayah: 9,
    textAr:
      "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ",
    textEn:
      "O you who have believed, when the call to prayer is made on the day of Jumu'ah, then proceed to the remembrance of Allah.",
    occasions: ["jummah"],
  },
  {
    ref: "14:7",
    surahEn: "Ibrahim",
    surahAr: "إبراهيم",
    ayah: 7,
    textAr:
      "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    textEn: "If you are grateful, I will surely increase you in favor.",
    occasions: ["graduation", "eid-ul-fitr", "eid-ul-adha", "general"],
  },
];

export function getVersesForOccasion(occasion: string): QuranVerse[] {
  return QURAN_VERSES.filter((v) => v.occasions.includes(occasion));
}

export function searchVerses(query: string): QuranVerse[] {
  const q = query.toLowerCase();
  return QURAN_VERSES.filter(
    (v) =>
      v.textEn.toLowerCase().includes(q) ||
      v.surahEn.toLowerCase().includes(q) ||
      v.ref.includes(q)
  );
}
