export type Produce = {
  id: string;
  name_nb: string;
  foodId: string;
  category:
    | "grønnsaker"
    | "frukt og bær"
    | "urter og krydder"
    | "nøtter og frø"
    | "meierivarer"
    | "gårdsvarer";
};

export const produceList: Produce[] = [
  {
    id: "potet",
    name_nb: "Potet",
    foodId: "06.004",
    category: "grønnsaker",
  },
  {
    id: "gulrot",
    name_nb: "Gulrot",
    foodId: "06.036",
    category: "grønnsaker",
  },
  {
    id: "lok",
    name_nb: "Løk",
    foodId: "06.042",
    category: "grønnsaker",
  },
  {
    id: "hvitlok",
    name_nb: "Hvitløk",
    foodId: "06.038",
    category: "grønnsaker",
  },
  {
    id: "purre",
    name_nb: "Purre",
    foodId: "06.052",
    category: "grønnsaker",
  },
  {
    id: "hodekal",
    name_nb: "Hodekål",
    foodId: "06.037",
    category: "grønnsaker",
  },
  {
    id: "rodkal",
    name_nb: "Rødkål",
    foodId: "06.268",
    category: "grønnsaker",
  },
  {
    id: "blomkal",
    name_nb: "Blomkål",
    foodId: "06.852",
    category: "grønnsaker",
  },
  {
    id: "brokkoli",
    name_nb: "Brokkoli",
    foodId: "06.018",
    category: "grønnsaker",
  },
  {
    id: "rosenkal",
    name_nb: "Rosenkål",
    foodId: "06.055",
    category: "grønnsaker",
  },
  {
    id: "kinakal",
    name_nb: "Kinakål",
    foodId: "06.040",
    category: "grønnsaker",
  },
  {
    id: "kalrot",
    name_nb: "Kålrot",
    foodId: "06.041",
    category: "grønnsaker",
  },
  {
    id: "rodbete",
    name_nb: "Rødbete",
    foodId: "06.057",
    category: "grønnsaker",
  },
  {
    id: "knollselleri",
    name_nb: "Knollselleri",
    foodId: "06.060",
    category: "grønnsaker",
  },
  {
    id: "agurk",
    name_nb: "Agurk",
    foodId: "06.010",
    category: "grønnsaker",
  },
  {
    id: "tomat",
    name_nb: "Tomat",
    foodId: "06.069",
    category: "grønnsaker",
  },
  {
    id: "isbergsalat",
    name_nb: "Isbergsalat",
    foodId: "06.281",
    category: "grønnsaker",
  },
  {
    id: "salat",
    name_nb: "Salat",
    foodId: "06.097",
    category: "grønnsaker",
  },
  {
    id: "spinat",
    name_nb: "Spinat",
    foodId: "06.064",
    category: "grønnsaker",
  },
  {
    id: "gronnkal",
    name_nb: "Grønnkål",
    foodId: "06.035",
    category: "grønnsaker",
  },
  {
    id: "nepe",
    name_nb: "Nepe",
    foodId: "06.046",
    category: "grønnsaker",
  },
  {
    id: "eple",
    name_nb: "Eple",
    foodId: "06.758",
    category: "frukt og bær",
  },
  {
    id: "paere",
    name_nb: "Pære",
    foodId: "06.760",
    category: "frukt og bær",
  },
  {
    id: "plomme",
    name_nb: "Plomme",
    foodId: "06.544",
    category: "frukt og bær",
  },
  {
    id: "kirsebaer",
    name_nb: "Kirsebær",
    foodId: "06.506",
    category: "frukt og bær",
  },
  {
    id: "morell",
    name_nb: "Morell",
    foodId: "06.507",
    category: "frukt og bær",
  },
  {
    id: "jordbaer",
    name_nb: "Jordbær",
    foodId: "06.504",
    category: "frukt og bær",
  },
  {
    id: "bringebaer",
    name_nb: "Bringebær",
    foodId: "06.503",
    category: "frukt og bær",
  },
  {
    id: "solbaer",
    name_nb: "Solbær",
    foodId: "06.513",
    category: "frukt og bær",
  },
  {
    id: "rips",
    name_nb: "Rips",
    foodId: "06.512",
    category: "frukt og bær",
  },
  {
    id: "stikkelsbaer",
    name_nb: "Stikkelsbær",
    foodId: "06.514",
    category: "frukt og bær",
  },
  {
    id: "blabaer",
    name_nb: "Blåbær",
    foodId: "06.502",
    category: "frukt og bær",
  },
  {
    id: "tyttebaer",
    name_nb: "Tyttebær",
    foodId: "06.515",
    category: "frukt og bær",
  },
  {
    id: "bjornebaer",
    name_nb: "Bjørnebær",
    foodId: "06.501",
    category: "frukt og bær",
  },
  {
    id: "rabarbra",
    name_nb: "Rabarbra",
    foodId: "06.053",
    category: "frukt og bær",
  },
  {
    id: "persille",
    name_nb: "Persille",
    foodId: "06.050",
    category: "urter og krydder",
  },
  {
    id: "dill",
    name_nb: "Dill",
    foodId: "06.120",
    category: "urter og krydder",
  },
  {
    id: "gresslok",
    name_nb: "Gressløk",
    foodId: "06.034",
    category: "urter og krydder",
  },
  {
    id: "basilikum",
    name_nb: "Basilikum",
    foodId: "06.111",
    category: "urter og krydder",
  },
  {
    id: "mynte",
    name_nb: "Mynte",
    foodId: "06.259",
    category: "urter og krydder",
  },
  {
    id: "hasselnott",
    name_nb: "Hasselnøtt",
    foodId: "06.553",
    category: "nøtter og frø",
  },
  {
    id: "valnott",
    name_nb: "Valnøtt",
    foodId: "06.560",
    category: "nøtter og frø",
  },
  {
    id: "solsikkefro",
    name_nb: "Solsikkefrø",
    foodId: "05.126",
    category: "nøtter og frø",
  },
  {
    id: "linfro",
    name_nb: "Linfrø",
    foodId: "05.012",
    category: "nøtter og frø",
  },
  {
    id: "egg",
    name_nb: "Egg",
    foodId: "02.001",
    category: "gårdsvarer",
  },
  {
    id: "helmelk",
    name_nb: "Helmelk",
    foodId: "01.236",
    category: "meierivarer",
  },
  {
    id: "lettmelk",
    name_nb: "Lettmelk",
    foodId: "01.292",
    category: "meierivarer",
  },
  {
    id: "smor",
    name_nb: "Smør",
    foodId: "08.005",
    category: "meierivarer",
  },
  {
    id: "yoghurt",
    name_nb: "Yoghurt",
    foodId: "01.011",
    category: "meierivarer",
  },
  {
    id: "cottage_cheese",
    name_nb: "Cottage cheese",
    foodId: "01.028",
    category: "meierivarer",
  },
  {
    id: "hvitost",
    name_nb: "Hvitost",
    foodId: "01.185",
    category: "meierivarer",
  },
  {
    id: "geitost",
    name_nb: "Geitost",
    foodId: "01.251",
    category: "meierivarer",
  },
  {
    id: "honning",
    name_nb: "Honning",
    foodId: "09.003",
    category: "gårdsvarer",
  },
];