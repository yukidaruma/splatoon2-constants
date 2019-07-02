const path = require('path');

const DATA_DIR = './data';

const statInkLocaleNames = {
  en: 'en_US',
  ja: 'ja_JP',
};

const bosses = require(path.resolve(DATA_DIR, 'salmon-bosses.js'));
const stages = require(path.resolve(DATA_DIR, 'salmon-stages.js'));
const salmonWaterLevels = require(path.resolve(DATA_DIR, 'salmon-water-levels.js'));
const salmonEvents = require(path.resolve(DATA_DIR, 'salmon-events.js'));
const salmonWeapons = require(path.resolve(DATA_DIR, 'salmon-weapons.js'));
const salmonSpecialWeapons = [
  { id: 2, key: 'splashbomb_pitcher' },
  { id: 7, key: 'presser' },
  { id: 8, key: 'jetpack' },
  { id: 9, key: 'chakuchi' },
];

const generateBossLocs = (lang) => {
  const result = {};
  bosses.forEach((boss) => {
    result[boss.key] = boss.loc[lang];
  });
  return result;
};
const generateEventLocs = (lang) => {
  const result = {};
  salmonEvents.forEach((event) => {
    result[event.key] = event.loc[lang];
  });
  return result;
};
const generateSpecialLocs = (lang, locale) => {
  const result = {};
  salmonSpecialWeapons.forEach((special) => {
    result[special.key] = locale.weapon_specials[special.id].name;
  });
  return result;
};
const generateStageLocs = (lang, locale) => {
  const result = {};
  stages.forEach((stage) => {
    result[stage.key] = locale.coop_stages[stage.splatoon2ink].name;
  });
  return result;
};
const generateWaterLevelLocs = (lang) => {
  const result = {};
  salmonWaterLevels.forEach((waterLevel) => {
    result[waterLevel.key] = waterLevel.loc[lang];
  });
  return result;
};
const generateWeaponLocs = (lang, statInkWeapons) => {
  const result = {};
  const salmonMainWeapons = statInkWeapons.filter(weapon =>
    weapon.key === 'splatscope' ||
    weapon.key === 'liter4k_scope' ||
    weapon.main_ref === weapon.key
  );
  const statInkLocaleName = statInkLocaleNames[lang];

  statInkWeapons.forEach((weapon) => {
    result[weapon.key] = weapon.name[statInkLocaleName];
  });

  salmonWeapons.forEach((weapon) => {
    result[weapon.key] = weapon.loc[lang];
  })

  return result;
};

module.exports = {
  generateBossLocs,
  generateEventLocs,
  generateSpecialLocs,
  generateStageLocs,
  generateWaterLevelLocs,
  generateWeaponLocs,
};
