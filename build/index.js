const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');

const DATA_DIR = './data';
const CACHE_DIR = './cache';
const DIST_DIR = './dist';

const statInkLocaleNames = {
  en: 'en_US',
  ja: 'ja_JP',
};
const supportedLanguages = ['en', 'ja'];
const requestDefaultOptions = {
  headers: {
    'User-Agent': 'splatoon2-constants <https://github.com/yukidaruma/splatoon2-constants>',
  },
  json: true,
  method: 'GET',
};

// const readJson = path => JSON.parse(fs.readFileSync(path));

const saveBuiltFile = (builtFilePath, data) => {
  fs.mkdirSync(path.dirname(builtFilePath), { recursive: true });
  fs.writeFileSync(builtFilePath, JSON.stringify(data));

  console.log(`Saved ${builtFilePath}`)
};

const cacheGetRequest = async (url, options = {}, cacheName) => {
  const cachePath = path.resolve(CACHE_DIR, cacheName);

  Object.assign(options, requestDefaultOptions);
  options.uri = url;

  if (fs.existsSync(cachePath)) {
    console.log(`Cache for ${url} is found. Skipping request.`);

    return JSON.parse(fs.readFileSync(cachePath));
  }
  return request(options)
    .then((res) => {
      fs.writeFileSync(cachePath, JSON.stringify(res));
    });
};

(async () => {
  const bosses = require(path.resolve(DATA_DIR, 'salmon-bosses.js'));
  const stages = require(path.resolve(DATA_DIR, 'salmon-stages.js'));
  const salmonWeapons = require(path.resolve(DATA_DIR, 'salmon-weapons.js'));
  const statInkWeapons = await cacheGetRequest(
    'https://stat.ink/api/v2/weapon',
    {},
    'stat-ink-weapon.json',
  );

  /*
   * Salmon run data
   */

  // Locales
  const generateBossLocs = (lang) => {
    const result = {};
    bosses.forEach((boss) => {
      result[boss.key] = boss.loc[lang];
    });
    return result;
  };
  const generateSpecialLocs = (lang, locale) => {
    const result = {};
    const salmonSpecialWeapons = [
      { id: 2, key: 'splashbomb_pitcher' },
      { id: 7, key: 'presser' },
      { id: 8, key: 'jetpack' },
      { id: 9, key: 'chakuchi' },
    ];
    salmonSpecialWeapons.forEach((special) => {
      result[special.key] = locale.weapon_specials[special.id].name;
    });
    return result;
  };
  const generateStageLocs = (lang) => {
    const result = {};
    stages.forEach((stage) => {
      result[stage.key] = stage.loc[lang];
    });
    return result;
  };
  const generateWeaponLoc = (lang) => {
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

  supportedLanguages.forEach(async (lang) => {
    const locale = await cacheGetRequest(`https://splatoon2.ink/data/locale/${lang}.json`, {}, `splatoon2-ink-locale-${lang}.json`);
    const specials = {};

    const salmonLocalePath = path.resolve(DIST_DIR, `salmon/locale/${lang}.json`);
    const salmonLocale = {
      bosses: generateBossLocs(lang),
      specials: generateSpecialLocs(lang, locale),
      stages: generateStageLocs(lang),
      weapons: generateWeaponLoc(lang),
    };
    saveBuiltFile(salmonLocalePath, salmonLocale);
  });

  console.log('Successfully completed generating files.');
})();
