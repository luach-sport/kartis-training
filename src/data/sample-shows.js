// הופעות לדוגמה — כולן דמיוניות (אמנים, מקומות ומחירים מומצאים), רק לאימון.
// התאריך נקבע ביחס ליום הטעינה, כך שההופעות תמיד בעתיד.

export const SAMPLE_SHOWS = [
  {
    id: 'blue-wave-tlv',
    title: 'ערב רוק על החוף',
    artist: 'להקת הגל הכחול',
    venue: 'במת החוף הדמיונית',
    city: 'תל אביב',
    daysFromNow: 9, hour: 21, minute: 0,
    emoji: '🎸',
    colors: ['#FF6B4A', '#7B2FF7'],
    description: 'שלוש שעות של רוק ישראלי מקורי מול הים, עם להקת חימום ומופע אורות. הופעה מדומה לצורכי אימון.',
    sections: {
      regular: { name: 'עמידה', price: 149, capacity: 400 },
      seats: { name: 'ישיבה', price: 219, capacity: 120 },
      vip: { name: 'VIP ליד הבמה', price: 390, capacity: 30 }
    }
  },
  {
    id: 'moon-orchestra-jlm',
    title: 'קלאסיקה לאור הירח',
    artist: 'תזמורת אור הירח',
    venue: 'אולם האורות',
    city: 'ירושלים',
    daysFromNow: 16, hour: 20, minute: 30,
    emoji: '🎻',
    colors: ['#3A7BD5', '#00D2FF'],
    description: 'ערב של יצירות קלאסיות ופסקולים מוכרים בעיבוד לתזמורת מלאה. הופעה מדומה לצורכי אימון.',
    sections: {
      balcony: { name: 'יציע', price: 120, capacity: 200 },
      hall: { name: 'אולם', price: 180, capacity: 300 }
    }
  },
  {
    id: 'cantors-haifa',
    title: 'ערב חזנות ושירה',
    artist: 'מקהלת קול הנגינה',
    venue: 'היכל הכרמל הדמיוני',
    city: 'חיפה',
    daysFromNow: 23, hour: 20, minute: 0,
    emoji: '🎶',
    colors: ['#C79A3B', '#5B2C06'],
    description: 'חזנות, פיוטים ושירי ארץ ישראל עם מקהלה גברית ותזמורת קאמרית. הופעה מדומה לצורכי אימון.',
    sections: {
      regular: { name: 'רגיל', price: 99, capacity: 250 },
      front: { name: 'שורות קדמיות', price: 160, capacity: 60 }
    }
  },
  {
    id: 'drum-circle-bs',
    title: 'מופע תופים אנרגטי',
    artist: 'אנסמבל הקצב',
    venue: 'אמפי העמק הדמיוני',
    city: 'באר שבע',
    daysFromNow: 30, hour: 19, minute: 30,
    emoji: '🥁',
    colors: ['#F7971E', '#E94057'],
    description: 'תופים מכל העולם, קצב שלא נגמר ומקום לכל המשפחה. הופעה מדומה לצורכי אימון.',
    sections: {
      family: { name: 'משפחתי', price: 79, capacity: 300 }
    }
  },
  {
    id: 'piano-intimate',
    title: 'פסנתר באינטימיות',
    artist: 'נגן הקלידים המסתורי',
    venue: 'מועדון הנר',
    city: 'צפת',
    daysFromNow: 12, hour: 21, minute: 30,
    emoji: '🎹',
    colors: ['#232526', '#7F8C8D'],
    description: 'רק 12 מקומות! ערב פסנתר קטן ואינטימי — מושלם לנסות מה קורה כשהכרטיסים אוזלים. הופעה מדומה לצורכי אימון.',
    sections: {
      table: { name: 'שולחן', price: 250, capacity: 12 }
    }
  }
];

export function sampleStartDate(sample, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + sample.daysFromNow);
  d.setHours(sample.hour, sample.minute, 0, 0);
  return d;
}
