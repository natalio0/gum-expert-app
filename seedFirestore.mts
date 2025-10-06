import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// PERHATIAN: Ganti dengan konfigurasi Firebase Anda yang sebenarnya
const firebaseConfig = {
  apiKey: "AIzaSyA35uu4aJxo4sdlUswUyWPqze6P8VIoJEI",
  authDomain: "dental-scope.firebaseapp.com",
  projectId: "dental-scope",
  storageBucket: "dental-scope.firebasestorage.app",
  messagingSenderId: "1044017407223",
  appId: "1:1044017407223:web:aba3681baf9197e4021ff2",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data rules pakar (35 kasus)
const rules = [
  {
    gejala: ["G01", "G04"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis marginalis kronis RB",
    perawatan: ["PR01", "PR04", "PR03"],
    perawatan_desc: ["Scaling RA RB", "Medikasi Obat Kumur", "DHE & KIE"],
  },
  {
    gejala: ["G02"],
    diagnosis: "P02",
    diagnosis_name: "Gingival Recession",
    perawatan: ["PR01", "PR02", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Obat Kumur Antiseptik",
      "Edukasi teknik sikat gigi",
      "Perawatan Bedah Gusi",
    ],
  },
  {
    gejala: ["G03"],
    diagnosis: "P03",
    diagnosis_name: "Inflammatory Gingival Enlargement gigi 41,42,43",
    perawatan: ["PR01", "PR02", "PR05", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Obat Kumur Antiseptik",
      "Eksisi hiperplasi gingiva",
      "Edukasi kebersihan mulut",
    ],
  },
  {
    gejala: ["G04"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis kronis RB",
    perawatan: ["PR01", "PR03", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Edukasi & KIE",
      "Ekstraksi gigi 38/48 impaksi",
    ],
  },
  {
    gejala: ["G05"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis kronis anterior RB",
    perawatan: ["PR01", "PR03"],
    perawatan_desc: ["Scaling RA RB + Splinting anterior", "Edukasi & KIE"],
  },
  {
    gejala: ["G06"],
    diagnosis: "P02",
    diagnosis_name: "Acute Periodontitis RB",
    perawatan: ["PR01", "PR02", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Drainase abses",
      "Antibiotik sistemik",
      "Bedah periodontal",
    ],
  },
  {
    gejala: ["G07"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis kronis anterior RB",
    perawatan: ["PR01", "PR04", "PR03"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Edukasi pola hidup sehat",
    ],
  },
  {
    gejala: ["G08"],
    diagnosis: "P02",
    diagnosis_name: "Acute Periodontitis anterior RA",
    perawatan: ["PR01", "PR02", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Drainase abses",
      "Antibiotik sistemik",
      "Bedah periodontal",
    ],
  },
  {
    gejala: ["G09"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis kronis anterior RA",
    perawatan: ["PR01", "PR03", "PR05"],
    perawatan_desc: ["Scaling RA RB", "Edukasi & KIE", "Ortodonsia cekat"],
  },
  {
    gejala: ["G10"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis Agressive RA & RB",
    perawatan: ["PR01", "PR04", "PR03", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Edukasi pola hidup sehat",
      "Bedah tulang alveolar",
    ],
  },
  {
    gejala: ["G11"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis Aggressive RB",
    perawatan: ["PR01", "PR04", "PR03"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Edukasi pola hidup sehat",
    ],
  },
  {
    gejala: ["G12"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis kronis gigi 46",
    perawatan: ["PR01", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Ekstraksi gigi 46",
    ],
  },
  {
    gejala: ["G13"],
    diagnosis: "P03",
    diagnosis_name: "Gingival Enlargement (Antikonvulsan)",
    perawatan: ["PR01", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Pengurangan gusi pasca obat",
    ],
  },
  {
    gejala: ["G14"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis oleh Malnutrisi Vitamin C",
    perawatan: ["PR03"],
    perawatan_desc: ["Edukasi makanan vitamin C"],
  },
  {
    gejala: ["G15"],
    diagnosis: "P03",
    diagnosis_name: "Gingival Enlargement (Calcium Channel Blockers)",
    perawatan: ["PR01", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Pengurangan gusi pasca obat",
    ],
  },
  {
    gejala: ["G16"],
    diagnosis: "P02",
    diagnosis_name: "Gingival recession gigi 31,32,41,42",
    perawatan: ["PR01", "PR02", "PR03", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Desensitisasi",
      "Edukasi & KIE",
      "Bedah mulut ekstraksi gigi 36,47",
    ],
  },
  {
    gejala: ["G17"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis kronis anterior RB",
    perawatan: ["PR02", "PR03"],
    perawatan_desc: ["Kuretase", "Edukasi & KIE"],
  },
  {
    gejala: ["G18"],
    diagnosis: "P04",
    diagnosis_name: "Epulis fibromatosa gigi 21,22",
    perawatan: ["PR05", "PR03"],
    perawatan_desc: ["Gingivektomi", "Edukasi & KIE"],
  },
  {
    gejala: ["G19"],
    diagnosis: "P03",
    diagnosis_name: "Gingival Enlargement (Immunosuppresan)",
    perawatan: ["PR01", "PR04", "PR05"],
    perawatan_desc: [
      "Scaling RA RB",
      "Obat kumur antiseptik",
      "Pengurangan gusi pasca obat",
    ],
  },
  {
    gejala: ["G20"],
    diagnosis: "P01",
    diagnosis_name: "Pregnancy Gingivitis",
    perawatan: ["PR01", "PR03"],
    perawatan_desc: ["Pembersihan gigi", "Edukasi selama hamil"],
  },
  {
    gejala: ["G21"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis Kronis Anterior RA",
    perawatan: ["PR01", "PR02", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Splinting dengan gigi tiruan",
      "Edukasi & KIE",
    ],
  },
  {
    gejala: ["G22"],
    diagnosis: "P04",
    diagnosis_name: "Epulis fibromatosa gingiva 44",
    perawatan: ["PR05", "PR03"],
    perawatan_desc: ["Gingivektomi gingiva 44", "Edukasi & KIE"],
  },
  {
    gejala: ["G23"],
    diagnosis: "P03",
    diagnosis_name: "Hiperpigmentasi gingiva RA RB",
    perawatan: ["PR01", "PR02", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Edukasi pola hidup sehat",
      "Gingival scraping",
    ],
  },
  {
    gejala: ["G24"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis kronis gigi 31,32,33,34,41,42,44",
    perawatan: ["PR01", "PR02", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Edukasi & KIE",
      "Pembuatan gigi tiruan",
    ],
  },
  {
    gejala: ["G25"],
    diagnosis: "P05",
    diagnosis_name: "Trauma From Occlusion gigi 31,32",
    perawatan: ["PR01", "PR02", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Splinting anterior",
      "Edukasi & KIE",
    ],
  },
  {
    gejala: ["G26"],
    diagnosis: "P04",
    diagnosis_name: "Epulis Gravidarum gigi 43,44",
    perawatan: ["PR05", "PR03"],
    perawatan_desc: ["Insisi jaringan berlebih", "Edukasi & KIE"],
  },
  {
    gejala: ["G27"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis kronis gigi 25",
    perawatan: ["PR01", "PR04", "PR03"],
    perawatan_desc: ["Scaling RA RB", "Salep triamcinolone", "Edukasi & KIE"],
  },
  {
    gejala: ["G28"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis Kronis Anterior RB",
    perawatan: ["PR01", "PR02", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Splinting dengan gigi tiruan",
      "Edukasi & KIE",
    ],
  },
  {
    gejala: ["G29"],
    diagnosis: "P03",
    diagnosis_name: "Gingival enlargement gigi 32,33",
    perawatan: ["PR01", "PR03"],
    perawatan_desc: ["Scaling RA RB", "Edukasi peningkatan oral hygiene"],
  },
  {
    gejala: ["G30"],
    diagnosis: "P05",
    diagnosis_name: "Trauma From Occlusion Anterior RA & RB",
    perawatan: ["PR05", "PR03"],
    perawatan_desc: ["Selective grinding", "Edukasi & KIE"],
  },
  {
    gejala: ["G31"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis dental plaque only gigi 14-17",
    perawatan: ["PR02", "PR03"],
    perawatan_desc: ["Scaling & Root Planing", "Edukasi mengunyah 2 sisi"],
  },
  {
    gejala: ["G32"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis dental plaque only",
    perawatan: ["PR02", "PR03"],
    perawatan_desc: ["Scaling & Root Planing", "Edukasi & KIE"],
  },
  {
    gejala: ["G33"],
    diagnosis: "P01",
    diagnosis_name: "Gingivitis marginalis kronis anterior RA",
    perawatan: ["PR02", "PR03"],
    perawatan_desc: ["Scaling & Root Planing", "Kuretase gigi anterior"],
  },
  {
    gejala: ["G34"],
    diagnosis: "P02",
    diagnosis_name: "Periodontitis kronis anterior RB",
    perawatan: ["PR01", "PR02", "PR03"],
    perawatan_desc: [
      "Scaling & Root Planing",
      "Bedah flap periodontal",
      "Edukasi efek samping obat",
    ],
  },
  {
    gejala: ["G35"],
    diagnosis: "P05",
    diagnosis_name: "Trauma Oklusi",
    perawatan: ["PR05", "PR03"],
    perawatan_desc: ["Selective grinding", "Pembuatan gigi tiruan"],
  },
];

// Fungsi untuk seeding Firestore
async function seedFirestore() {
  console.log("Memulai proses seeding Firestore...");
  try {
    const rulesCollection = collection(db, "rules");

    for (let i = 0; i < rules.length; i++) {
      await addDoc(rulesCollection, rules[i]);
      console.log(
        `✅ Rule #${i + 1} untuk ${
          rules[i].diagnosis_name
        } berhasil ditambahkan`
      );
    }
    console.log("------------------------------------------");
    console.log("🔥 SEMUA 35 RULES BERHASIL DIMASUKKAN KE FIRESTORE!");
    console.log("------------------------------------------");
  } catch (error) {
    console.error("❌ Gagal seed Firestore:", error);
  }
}

seedFirestore();
