import cleanVCards from './../../../../libs/server/endpoints/voyager/clean-vcards';

var assert = require( 'assert' );

describe('clean-vcards', function() {
  it('Remove stray punctuation', function() {
    var html = '<div class="vcard">,<bdi class="adr listing-address street-address">Duong Nguyen Tat Thanh, District 4</bdi>.</div>';
    assert.strictEqual( cleanVCards(html),
      '<div class="vcard"><bdi class="adr listing-address street-address">Duong Nguyen Tat Thanh, District 4</bdi></div>' );
  });
});
