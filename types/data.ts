// types/data.ts

export type Rule = {
  gejala: string[];
  diagnosis: string;
  diagnosis_name: string;
  perawatan: string[];
  perawatan_desc: string[];
};

export type Gejala = {
  id: string;
  desc: string;
  category:
    | "Plak & Peradangan"
    | "Kerusakan Jaringan/Tulang"
    | "Pembesaran"
    | "Trauma & Maloklusi"
    | "Faktor Sistemik/Obat";
};

export const GejalaList: Gejala[] = [
  // Kategori: Plak & Peradangan (P01)
  {
    id: "G01",
    desc: "Gusi sering berdarah saat menyikat gigi atau spontan.",
    category: "Plak & Peradangan",
  },
  {
    id: "G04",
    desc: "Adanya karang gigi tebal (kalkulus) di permukaan gigi.",
    category: "Plak & Peradangan",
  },
  {
    id: "G09",
    desc: "Gigi berjejal atau tidak rata (maloklusi).",
    category: "Plak & Peradangan",
  },
  {
    id: "G14",
    desc: "Pola makan kurang buah dan sayuran (defisiensi Vit C).",
    category: "Faktor Sistemik/Obat",
  },
  {
    id: "G17",
    desc: "Perdarahan gusi yang terlokalisir.",
    category: "Plak & Peradangan",
  },
  {
    id: "G20",
    desc: "Sedang dalam masa kehamilan.",
    category: "Faktor Sistemik/Obat",
  },
  {
    id: "G31",
    desc: "Gingivitis pada gigi geraham atas (hanya plak).",
    category: "Plak & Peradangan",
  },
  {
    id: "G32",
    desc: "Gingivitis umum akibat plak.",
    category: "Plak & Peradangan",
  },
  {
    id: "G33",
    desc: "Gingivitis pada gigi depan atas.",
    category: "Plak & Peradangan",
  },

  // Kategori: Kerusakan Jaringan/Tulang (P02)
  {
    id: "G02",
    desc: "Gusi terlihat turun atau mengalami resesi.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G05",
    desc: "Gigi terasa goyang atau mobilitas abnormal.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G06",
    desc: "Adanya nanah (abses) pada gusi.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G07",
    desc: "Bau mulut tidak sedap (halitosis) yang persisten.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G08",
    desc: "Nyeri hebat pada gusi atau gigi.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G10",
    desc: "Penurunan tulang alveolar yang cepat (pada foto rontgen).",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G11",
    desc: "Pelebaran ruang ligamen periodontal.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G12",
    desc: "Ada lubang besar/kerusakan pada gigi geraham.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G16",
    desc: "Resesi gusi pada gigi depan bawah.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G21",
    desc: "Gigi depan atas goyang.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G24",
    desc: "Gigi depan bawah goyang dan banyak karang gigi.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G27",
    desc: "Peradangan gusi di sekitar gigi 25.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G28",
    desc: "Periodontitis kronis pada gigi depan bawah.",
    category: "Kerusakan Jaringan/Tulang",
  },
  {
    id: "G34",
    desc: "Periodontitis kronis pada gigi depan bawah dengan riwayat obat tertentu.",
    category: "Kerusakan Jaringan/Tulang",
  },

  // Kategori: Pembesaran (P03, P04)
  {
    id: "G03",
    desc: "Gusi bengkak dan membesar (enlargement) pada beberapa gigi.",
    category: "Pembesaran",
  },
  {
    id: "G13",
    desc: "Sedang mengonsumsi obat antikonvulsan (misal: Fenitoin).",
    category: "Faktor Sistemik/Obat",
  },
  {
    id: "G15",
    desc: "Sedang mengonsumsi obat Calcium Channel Blockers.",
    category: "Faktor Sistemik/Obat",
  },
  {
    id: "G18",
    desc: "Benjolan fibrosa pada gusi (epulis).",
    category: "Pembesaran",
  },
  {
    id: "G19",
    desc: "Sedang mengonsumsi obat Immunosuppresan.",
    category: "Faktor Sistemik/Obat",
  },
  {
    id: "G22",
    desc: "Benjolan fibrosa pada gusi gigi 44.",
    category: "Pembesaran",
  },
  {
    id: "G23",
    desc: "Warna gusi lebih gelap dari normal (hiperpigmentasi).",
    category: "Pembesaran",
  },
  {
    id: "G26",
    desc: "Benjolan gusi yang muncul saat hamil.",
    category: "Pembesaran",
  },
  {
    id: "G29",
    desc: "Pembesaran gusi pada gigi 32, 33.",
    category: "Pembesaran",
  },

  // Kategori: Trauma & Maloklusi (P05)
  {
    id: "G25",
    desc: "Gigi depan bawah terasa sakit saat menggigit.",
    category: "Trauma & Maloklusi",
  },
  {
    id: "G30",
    desc: "Gigi depan atas dan bawah terasa sakit saat menggigit.",
    category: "Trauma & Maloklusi",
  },
  {
    id: "G35",
    desc: "Trauma karena gigitan (oklusi) yang tidak normal.",
    category: "Trauma & Maloklusi",
  },
];
