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

  supportedLanguages.forEach((lang) => {
    const salmonLocalePath = path.resolve(DIST_DIR, `salmon/${lang}.json`);
    const salmonLocale = {
      weapons: generateWeaponLoc(lang),
    };
    saveBuiltFile(salmonLocalePath, salmonLocale);
  });

  console.log('Successfully completed generating files.');
})();
