const NODE_ENV = process.env.NODE_ENV
const SPECIAL_PROJECTS = [ 'species', 'commons', 'meta' ]
const API_PATH = process.env.API_PATH || '/api/voyager/'
const APP_PORT = process.env.PORT || 3000

const GCM_SENDER_ID = process.env.GCM_SENDER_ID
const DEFAULT_LANGUAGE = process.env.LANGUAGE || 'en';
const DEFAULT_PROJECT = process.env.PROJECT || 'wikivoyage';
const EN_MESSAGE_PATH = './i18n/en.json';

const ENABLE_COLLECTIONS = true;
const COLLECTIONS_INCLUDE_WATCHLIST = false;

const ENABLE_NEARBY = false;
const DISABLE_SETTINGS = true;

const SHOW_TALK_ANONS = Boolean( process.env.SHOW_TALK_ANONS );

const IS_DEV_MODE = NODE_ENV !== 'production'

const DUMMY_SESSION = process.env.DEV_DUMMY_USER ? { dummy: true,
  displayName: process.env.DEV_DUMMY_USER } : null;

const ALL_PROJECTS = [ 'wikipedia', 'wikivoyage', 'wiktionary',
  'wikisource', 'wikiquote', 'wikinews', 'wikibooks', 'wikiversity' ].concat( SPECIAL_PROJECTS );

const SITE_ALLOW_FOREIGN_PROJECTS = Boolean( process.env.SITE_ALLOW_FOREIGN_PROJECTS );
const ALLOWED_PROJECTS = process.env.SITE_ALLOWED_PROJECTS ?
  process.env.SITE_ALLOWED_PROJECTS.split( '|' ) :  ALL_PROJECTS;

const SITE_WORDMARK_PATH = '/images/someday-brown.png';
const SITE_TITLE = 'Someday';
const CONSUMER_SECRET = process.env.MEDIAWIKI_CONSUMER_SECRET || 'a';
const CONSUMER_KEY = process.env.MEDIAWIKI_CONSUMER_KEY || 'a'

const LANGUAGE_CODE = process.env.DEFAULT_LANGUAGE || 'en'
const SIGN_IN_SUPPORTED = DUMMY_SESSION ? true : ( CONSUMER_SECRET && CONSUMER_KEY )

const SITE_EXPAND_SECTIONS = false;

const SITE_EXPAND_SECTIONS_TABLET = false;

const SITE_EXPAND_ARTICLE = true;

const SERVER_SIDE_RENDERING = Boolean( process.env.SERVER_SIDE_RENDERING );

const USE_HTTPS = Boolean( process.env.USE_HTTPS );

const SITE_HOME = process.env.SITE_HOME || 'Special:NomadHome'

const SITE_HOME_PATH = process.env.HOME_PAGE_PATH ? process.env.HOME_PAGE_PATH
  : ( '/' + DEFAULT_LANGUAGE + '.' + DEFAULT_PROJECT + '/' + SITE_HOME );

const SITE_PRIVACY_URL = process.env.SITE_PRIVACY_URL
const SITE_TERMS_OF_USE = process.env.SITE_TERMS_OF_USE
const OFFLINE_VERSION = process.env.OFFLINE_VERSION

const HOST_SUFFIX = process.env.HOST_SUFFIX || '.org'

const TABLE_OF_CONTENTS = Boolean( process.env.TABLE_OF_CONTENTS )

const MEDIAWIKI_COMPATIBILITY_MODE = Boolean( process.env.MEDIAWIKI_COMPATIBILITY_MODE );

const OFFLINE_STRATEGY = process.env.OFFLINE_STRATEGY || 'shell';

export { SPECIAL_PROJECTS, API_PATH, DEFAULT_PROJECT, EN_MESSAGE_PATH,
  GCM_SENDER_ID, SITE_HOME_PATH, IS_DEV_MODE,
  MEDIAWIKI_COMPATIBILITY_MODE,
  ALL_PROJECTS, SITE_ALLOW_FOREIGN_PROJECTS, ALLOWED_PROJECTS,
  SITE_WORDMARK_PATH, SITE_TITLE, LANGUAGE_CODE, SIGN_IN_SUPPORTED,
  SITE_EXPAND_SECTIONS, SITE_EXPAND_ARTICLE, SITE_EXPAND_SECTIONS_TABLET,
  TABLE_OF_CONTENTS, SITE_HOME, SHOW_TALK_ANONS,
  CONSUMER_SECRET, CONSUMER_KEY, DUMMY_SESSION,
  OFFLINE_VERSION, OFFLINE_STRATEGY,
  DISABLE_SETTINGS,
  ENABLE_COLLECTIONS, ENABLE_NEARBY, COLLECTIONS_INCLUDE_WATCHLIST,
  SITE_TERMS_OF_USE, SITE_PRIVACY_URL, HOST_SUFFIX,
  SERVER_SIDE_RENDERING, USE_HTTPS, APP_PORT
}
