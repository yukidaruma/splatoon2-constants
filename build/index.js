const request = require('request-promise-native');
const fs = require('fs');
const path = require('path');

const {
  generateBossLocs,
  generateSpecialLocs,
  generateStageLocs,
  generateWeaponLocs,
} = require('./generate-locale-object');

const CACHE_DIR = './cache';
const DIST_DIR = './dist';

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
  const statInkWeapons = await cacheGetRequest(
    'https://stat.ink/api/v2/weapon',
    {},
    'stat-ink-weapon.json',
  );

  /*
   * Salmon run data
   */

  // Locales
  supportedLanguages.forEach(async (lang) => {
    const locale = await cacheGetRequest(`https://splatoon2.ink/data/locale/${lang}.json`, {}, `splatoon2-ink-locale-${lang}.json`);
    const specials = {};

    const salmonLocalePath = path.resolve(DIST_DIR, `salmon/locale/${lang}.json`);
    const salmonLocale = {
      bosses: generateBossLocs(lang),
      specials: generateSpecialLocs(lang, locale),
      stages: generateStageLocs(lang, locale),
      weapons: generateWeaponLocs(lang, statInkWeapons),
    };
    saveBuiltFile(salmonLocalePath, salmonLocale);
  });

  console.log('Successfully completed generating files.');
})();
