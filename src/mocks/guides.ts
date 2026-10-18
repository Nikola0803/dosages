export type Guide = {
  slug: string;
  title: string;
  summary: string;
};

export const guides: Guide[] = [
  {
    slug: "g-recon",
    title: "Mixing a vial, step by step",
    summary:
      "Which water to reach for, why you angle the needle at the glass instead of the powder, and how to work out the concentration you just made.",
  },
  {
    slug: "g-syringe",
    title: "Reading the numbers off a syringe",
    summary:
      "What a \"unit\" really measures, how U-100 syringes differ in size, and the mg / mcg / IU confusion that trips up almost everyone at least once.",
  },
  {
    slug: "g-storage",
    title: "Keeping a vial good",
    summary:
      "How long a vial lasts before and after mixing, the temperature it needs to sit at, and the handful of habits that quietly ruin one.",
  },
];

export type EquipmentItem = {
  name: string;
  spec: string;
  href: string;
  image: string;
};

export const equipment: EquipmentItem[] = [
  {
    name: "Syringes",
    spec: "U-100 insulin · 1 mL · 29–31G",
    href: "https://www.amazon.com/s?k=insulin+syringes+1ml+29g",
    image:
      "https://readdy.ai/api/search-image?query=Clean%20product%20photograph%20of%20a%20pack%20of%20U-100%20insulin%20syringes%20with%20fine%20needles%20arranged%20on%20a%20plain%20pale%20grey%20studio%20surface%2C%20soft%20even%20lighting%2C%20centered%20minimal%20e-commerce%20catalog%20composition%2C%20high%20detail&width=240&height=180&seq=equip-syringes&orientation=landscape",
  },
  {
    name: "Alcohol wipes",
    spec: "70% isopropyl prep pads",
    href: "https://www.amazon.com/s?k=alcohol+prep+pads+70+isopropyl",
    image:
      "https://readdy.ai/api/search-image?query=Clean%20product%20photograph%20of%20a%20stack%20of%20individually%20wrapped%2070%20percent%20isopropyl%20alcohol%20prep%20pads%20on%20a%20plain%20pale%20grey%20studio%20surface%2C%20soft%20even%20lighting%2C%20centered%20minimal%20e-commerce%20catalog%20composition%2C%20high%20detail&width=240&height=180&seq=equip-wipes&orientation=landscape",
  },
  {
    name: "Serum base — for topical mixes",
    spec: "Hyaluronic acid serum for mixing peptides into a serum",
    href: "https://www.amazon.com/s?k=hyaluronic+acid+serum",
    image:
      "https://readdy.ai/api/search-image?query=Clean%20product%20photograph%20of%20a%20small%20glass%20bottle%20of%20clear%20hyaluronic%20acid%20mixing%20serum%20with%20a%20dropper%20on%20a%20plain%20pale%20grey%20studio%20surface%2C%20soft%20even%20lighting%2C%20centered%20minimal%20e-commerce%20catalog%20composition%2C%20high%20detail&width=240&height=180&seq=equip-serum&orientation=landscape",
  },
  {
    name: "Electric cooler case",
    spec: "TSA-approved travel cooler — keeps mixed vials at fridge temperature",
    href: "https://www.amazon.com/s?k=electric+cooler+case+vials",
    image:
      "https://readdy.ai/api/search-image?query=Clean%20product%20photograph%20of%20a%20compact%20white%20electric%20travel%20cooler%20case%20for%20glass%20vials%20on%20a%20plain%20pale%20grey%20studio%20surface%2C%20soft%20even%20lighting%2C%20centered%20minimal%20e-commerce%20catalog%20composition%2C%20high%20detail&width=240&height=180&seq=equip-cooler&orientation=landscape",
  },
  {
    name: "Storage case",
    spec: "Hard carry case for vials",
    href: "https://www.amazon.com/s?k=hard+vial+storage+case",
    image:
      "https://readdy.ai/api/search-image?query=Clean%20product%20photograph%20of%20a%20small%20hard%20shell%20carry%20case%20for%20glass%20vials%20on%20a%20plain%20pale%20grey%20studio%20surface%2C%20soft%20even%20lighting%2C%20centered%20minimal%20e-commerce%20catalog%20composition%2C%20high%20detail&width=240&height=180&seq=equip-case&orientation=landscape",
  },
];