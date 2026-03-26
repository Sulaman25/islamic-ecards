export interface PresetMessage {
  id: string;
  text: string;
}

export const PRESET_MESSAGES: Record<string, PresetMessage[]> = {
  "eid-ul-fitr": [
    { id: "eid-fitr-1", text: "Eid Mubarak! May Allah accept our fasts, forgive our sins, and fill your home with joy and barakah on this blessed day." },
    { id: "eid-fitr-2", text: "Taqabbal Allahu minna wa minkum. May Allah accept from us and from you. Wishing you a joyful Eid surrounded by loved ones." },
    { id: "eid-fitr-3", text: "May this Eid bring you peace, happiness, and the company of those you love. Eid Mubarak from our family to yours!" },
    { id: "eid-fitr-4", text: "As the month of Ramadan draws to a close, may Allah reward your patience and devotion. Have a blessed Eid ul-Fitr!" },
  ],
  "eid-ul-adha": [
    { id: "eid-adha-1", text: "Eid ul-Adha Mubarak! May Allah accept your sacrifice and bless you with His infinite mercy and grace." },
    { id: "eid-adha-2", text: "On this day of sacrifice and gratitude, may Allah bless you and your family with health, happiness, and prosperity." },
    { id: "eid-adha-3", text: "May the spirit of Ibrahim (AS) inspire us all to submit fully to Allah's will. Eid ul-Adha Mubarak!" },
    { id: "eid-adha-4", text: "Wishing you a blessed Eid ul-Adha. May your sacrifice be accepted and your du'as answered by Allah SWT." },
  ],
  ramadan: [
    { id: "ramadan-1", text: "Ramadan Mubarak! May this holy month bring you closer to Allah and fill your heart with peace, patience, and gratitude." },
    { id: "ramadan-2", text: "As the blessed month of Ramadan begins, may your fasts be accepted, your prayers answered, and your heart illuminated with iman." },
    { id: "ramadan-3", text: "May this Ramadan be a month of barakah, forgiveness, and spiritual renewal for you and your family. Ramadan Kareem!" },
    { id: "ramadan-4", text: "Wishing you a Ramadan filled with the blessings of Allah, the joy of worship, and the warmth of togetherness." },
  ],
  "laylatul-qadr": [
    { id: "qadr-1", text: "Laylatul Qadr Mubarak! May this night of a thousand months bring you forgiveness, mercy, and the fulfilment of your deepest du'as." },
    { id: "qadr-2", text: "On this blessed Night of Power, may Allah shower you with His mercy and grant you the best of this world and the next." },
    { id: "qadr-3", text: "May Allah accept all your ibadah this Laylatul Qadr and write you among those who are forgiven. Ameen." },
  ],
  nikah: [
    { id: "nikah-1", text: "Mabrook on your Nikah! May Allah bless your union with love, mercy, and everlasting happiness. Barakallahu lakuma!" },
    { id: "nikah-2", text: "Barakallahu lakuma wa baraka alaykuma wa jama'a baynakuma fi khayr. Congratulations on your blessed union!" },
    { id: "nikah-3", text: "May Allah fill your marriage with joy, understanding, and deep love. Wishing you a lifetime of happiness together." },
    { id: "nikah-4", text: "Mabrook! May your home be a place of peace, love, and the remembrance of Allah. Congratulations on your Nikah!" },
  ],
  aqiqah: [
    { id: "aqiqah-1", text: "Mabrook on the arrival of your little blessing! May Allah protect this child, grant them strong iman, and make them a source of joy for your family." },
    { id: "aqiqah-2", text: "Alhamdulillah for the beautiful gift of a new life. May Allah bless your child with health, happiness, and a heart full of taqwa." },
    { id: "aqiqah-3", text: "Congratulations on your new bundle of joy! May this child be a sadaqah jariyah for you and a light in your home. Ameen." },
  ],
  hajj: [
    { id: "hajj-1", text: "Hajj Mabroor! May Allah accept your pilgrimage, forgive all your sins, and return you safely to us blessed and renewed." },
    { id: "hajj-2", text: "May your Hajj be accepted by Allah, your sins be forgiven, and your du'as be answered. Taqabbal Allahu minna wa minkum." },
    { id: "hajj-3", text: "Wishing you a blessed Hajj journey. May you return home as pure as the day you were born, insha'Allah." },
    { id: "hajj-4", text: "May Allah grant you a Hajj Mabroor, a sa'y mashkoor, and a thanb maghfoor. Safe travels, and we await your blessed return." },
  ],
  graduation: [
    { id: "grad-1", text: "Mabrook on your graduation! May Allah bless the knowledge you have gained and grant you the ability to use it for the benefit of the ummah." },
    { id: "grad-2", text: "Congratulations on this wonderful achievement. May Allah open doors of opportunity for you and guide you to success in this world and the next." },
    { id: "grad-3", text: "Alhamdulillah for your achievement! Seeking knowledge is an act of worship — may Allah bless your journey and reward your hard work." },
  ],
  jummah: [
    { id: "jummah-1", text: "Jummah Mubarak! May this blessed Friday bring you peace, forgiveness, and the acceptance of your du'as. Ameen." },
    { id: "jummah-2", text: "May the barakah of this blessed day of Jummah fill your heart with tranquility and bring you closer to Allah SWT." },
    { id: "jummah-3", text: "Jummah Mubarak, dear friend. May Allah bless your day and accept your salah and du'as on this most beloved day of the week." },
  ],
  "islamic-new-year": [
    { id: "newyear-1", text: "Islamic New Year Mubarak! May Allah bless this new year with peace, prosperity, and countless opportunities to grow in iman." },
    { id: "newyear-2", text: "As we begin a new Hijri year, may Allah grant us the strength to be better Muslims and bring us closer to His pleasure." },
    { id: "newyear-3", text: "May this new year bring healing to the ummah and fill your life with blessings, joy, and the nearness of Allah." },
  ],
  mawlid: [
    { id: "mawlid-1", text: "Mawlid Mubarak! May the love of our beloved Prophet Muhammad ﷺ fill your heart and guide you on the straight path." },
    { id: "mawlid-2", text: "On this blessed occasion, may we renew our love for the Prophet ﷺ and strive to follow his blessed sunnah in all that we do." },
    { id: "mawlid-3", text: "May the light of the Prophet Muhammad ﷺ shine in your heart always. Mawlid an-Nabawi Mubarak!" },
  ],
  general: [
    { id: "general-1", text: "May Allah bless you with health, happiness, and a heart full of gratitude. You are in my du'as always." },
    { id: "general-2", text: "Sending you warm Islamic greetings and heartfelt du'as. May Allah keep you and your family under His protection always." },
    { id: "general-3", text: "Assalamu Alaikum wa Rahmatullahi wa Barakatuh. May peace, mercy, and blessings of Allah be upon you and your loved ones." },
    { id: "general-4", text: "May Allah bless every step you take, answer every du'a you make, and grant you success in this life and the hereafter." },
  ],
};

export function getMessagesForOccasion(occasionSlug: string): PresetMessage[] {
  return PRESET_MESSAGES[occasionSlug] ?? PRESET_MESSAGES["general"];
}
