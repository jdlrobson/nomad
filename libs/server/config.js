const SPECIAL_PROJECTS = [ 'species', 'commons', 'meta' ]
const API_PATH = '/api/'
const APP_PORT = process.env.PORT || 3000

const GCM_SENDER_ID = process.env.GCM_SENDER_ID
const DEFAULT_PROJECT = process.env.PROJECT || 'wikipedia';
const EN_MESSAGE_PATH = './i18n/en.json';

const DUMMY_SESSION = process.env.DEV_DUMMY_USER ? { username: process.env.DEV_DUMMY_USER } : null

const ALL_PROJECTS = [ 'wikipedia', 'wikivoyage', 'wiktionary',
  'wikisource', 'wikiquote', 'wikinews', 'wikibooks', 'wikiversity' ].concat( SPECIAL_PROJECTS );

const SITE_ALLOW_FOREIGN_PROJECTS = Boolean( process.env.SITE_ALLOW_FOREIGN_PROJECTS );
const ALLOWED_PROJECTS = process.env.SITE_ALLOWED_PROJECTS ?
  process.env.SITE_ALLOWED_PROJECTS.split( '|' ) :  ALL_PROJECTS;

const SITE_WORDMARK_PATH = process.env.SITE_WORDMARK_PATH
const SITE_TITLE = process.env.SITE_TITLE || 'Weekipedia'
const CONSUMER_SECRET = process.env.MEDIAWIKI_CONSUMER_SECRET;
const CONSUMER_KEY = process.env.MEDIAWIKI_CONSUMER_KEY

const LANGUAGE_CODE = process.env.DEFAULT_LANGUAGE || 'en'
const SIGN_IN_SUPPORTED = DUMMY_SESSION ? true : ( CONSUMER_SECRET && CONSUMER_KEY )

const SITE_EXPAND_SECTIONS = process.env.SITE_EXPAND_SECTIONS ?
  Boolean( parseInt( process.env.SITE_EXPAND_SECTIONS, 10 ) ) : false;

const SITE_EXPAND_ARTICLE = process.env.SITE_EXPAND_ARTICLE ?
  Boolean( process.env.SITE_EXPAND_ARTICLE ) : SITE_EXPAND_SECTIONS;

const SERVER_SIDE_RENDERING = Boolean( process.env.SERVER_SIDE_RENDERING );

const USE_HTTPS = Boolean( process.env.USE_HTTPS );

const INCLUDE_SITE_BRANDING = Boolean( process.env.SITE_INCLUDE_BRANDING )

const SITE_HOME_PATH = process.env.HOME_PAGE_PATH || '/wiki/Main Page'

const SITE_PRIVACY_URL = process.env.SITE_PRIVACY_URL
const SITE_TERMS_OF_USE = process.env.SITE_TERMS_OF_USE
const OFFLINE_VERSION = process.env.OFFLINE_VERSION

const HOST_SUFFIX = process.env.HOST_SUFFIX || '.org'

export { SPECIAL_PROJECTS, API_PATH, DEFAULT_PROJECT, EN_MESSAGE_PATH,
  GCM_SENDER_ID, SITE_HOME_PATH,
  ALL_PROJECTS, SITE_ALLOW_FOREIGN_PROJECTS, ALLOWED_PROJECTS,
  SITE_WORDMARK_PATH, SITE_TITLE, LANGUAGE_CODE, SIGN_IN_SUPPORTED, INCLUDE_SITE_BRANDING,
  SITE_EXPAND_SECTIONS, SITE_EXPAND_ARTICLE,
  CONSUMER_SECRET, CONSUMER_KEY, DUMMY_SESSION,
  OFFLINE_VERSION, SITE_TERMS_OF_USE, SITE_PRIVACY_URL, HOST_SUFFIX,
  SERVER_SIDE_RENDERING, USE_HTTPS, APP_PORT
}
