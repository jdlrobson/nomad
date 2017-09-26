var assert = require( 'assert' );

import extractAirports from './../../../../libs/server/endpoints/voyager/extract-airports'

describe('extract-airports', function() {
  it('extract-airports', function() {
    const examples = [
      [
        '<p><b>Juan Santamaría Airport</b> (<b><a href="/wiki/San_Jos%C3%A9_(Costa_Rica)#By_plane" title="San José (Costa Rica)">SJO</a></b> <sup><small><a href="https://en.wikipedia.org/wiki/IATA_airport_code" class="extiw" title="w:IATA airport code">IATA</a></small></sup>) is located close to the cities <a href="/wiki/Alajuela" title="Alajuela">Alajuela</a> (3km), <a href="/wiki/Heredia" title="Heredia">Heredia</a> and the capital San José (25km).</p>',
        1,
        'Costa Rica'
      ],
      [
        '<p>The second largest  airport in Brazil is <b>Rio de Janeiro-Galeão International Airport</b>, (<b about="#mwt28" typeof="mw:Transclusion" data-mw="{&quot;parts&quot;:[{&quot;template&quot;:{&quot;target&quot;:{&quot;wt&quot;:&quot;IATA&quot;,&quot;href&quot;:&quot;./Template:IATA&quot;},&quot;params&quot;:{&quot;1&quot;:{&quot;wt&quot;:&quot;GIG&quot;}},&quot;i&quot;:0}}]}"><a href="./Rio_de_Janeiro–Galeão_International_Airport#By_plane" title="Rio de Janeiro–Galeão International Airport">GIG</a></b><sup about="#mwt28" id="mwAT8"><small><a rel="mw:ExtLink" href="https://en.wikipedia.org/wiki/IATA%20airport%20code" title="w:IATA airport code" class="external"> IATA</a></small></sup>) the home of <b><a rel="mw:ExtLink" href="https://www.voegol.com.br/en" class="external">Gol Transportes Aéreos</a></b>, which flies to many regional destinations including <a href="./Montevideo" title="Montevideo">Montevideo</a>, <a href="./Buenos_Aires" title="Buenos Aires">Buenos Aires</a> and <a href="./Asuncion" title="Asuncion" class="mw-redirect">Asuncion</a>. Other direct flights include:\nNorth America: Delta Air Lines flies to <a href="./Atlanta" title="Atlanta">Atlanta</a>, and <a href="./New_York_City" title="New York City">New York</a>, United Airlines to <a href="./Washington,_D.C." title="Washington, D.C.">Washington, D.C.</a>,  and <a href="./Houston" title="Houston">Houston</a> and American Airlines flies to <a href="./Charlotte" title="Charlotte">Charlotte</a>, <a href="./Miami" title="Miami">Miami</a>, <a href="./Dallas" title="Dallas">Dallas</a> and <a href="./New_York_City" title="New York City">New York City</a>.\nAfrica: Taag Angola to <a href="./Luanda" title="Luanda">Luanda</a> about 3 times a week.\nEurope: <a href="./Paris" title="Paris">Paris</a> by Air France, <a href="./Rome" title="Rome">Rome</a> by Alitalia, <a href="./London" title="London">London</a> by British Airways, <a href="./Madrid" title="Madrid">Madrid</a> by Iberia, <a href="./Amsterdam" title="Amsterdam">Amsterdam</a> by KLM, <a href="./Frankfurt" title="Frankfurt">Frankfurt</a> by Lufthansa, <a href="./Lisbon" title="Lisbon">Lisbon</a> and <a href="./Porto" title="Porto">Porto</a> by TAP Portugal.</p>',
        1,
        'Brazil'
      ],
      [
        '<p>Most intercontinental flights arrive at either <a href="/wiki/Narita_Airport" class="mw-redirect" title="Narita Airport">Narita Airport</a> (<b><a href="/wiki/Tokyo_Narita_Airport#By_plane" title="Tokyo Narita Airport">NRT</a></b> <sup><small><a href="https://en.wikipedia.org/wiki/IATA_airport_code" class="extiw" title="w:IATA airport code">IATA</a></small></sup>) near <a href="/wiki/Tokyo" title="Tokyo">Tokyo</a> or <a href="/wiki/Kansai_International_Airport" title="Kansai International Airport">Kansai Airport</a> (<b><a href="/wiki/Kansai_International_Airport#By_plane" title="Kansai International Airport">KIX</a></b> <sup><small><a href="https://en.wikipedia.org/wiki/IATA_airport_code" class="extiw" title="w:IATA airport code">IATA</a></small></sup>) near <a href="/wiki/Osaka" title="Osaka">Osaka</a>; a smaller number use <a href="/wiki/Chubu_International_Airport" class="mw-redirect" title="Chubu International Airport">Chubu International Airport</a> (<b><a href="/wiki/Chubu_Centrair_International_Airport#By_plane" title="Chubu Centrair International Airport">NGO</a></b> <sup><small><a href="https://en.wikipedia.org/wiki/IATA_airport_code" class="extiw" title="w:IATA airport code">IATA</a></small></sup>) near <a href="/wiki/Nagoya" title="Nagoya">Nagoya</a>. All three are significant distances from their respective city centers, but are linked to regional rail networks and also have numerous bus services to nearby destinations. Tokyo\'s other airport, <a href="/wiki/Haneda_Airport" class="mw-redirect" title="Haneda Airport">Haneda Airport</a> (<b><a href="/wiki/Tokyo_Haneda_Airport#By_plane" title="Tokyo Haneda Airport">HND</a></b> <sup><small><a href="https://en.wikipedia.org/wiki/IATA_airport_code" class="extiw" title="w:IATA airport code">IATA</a></small></sup>), is still primarily for domestic flights but has begun drawing an increasing number of international flights away from Narita.</p>',
        4,
        'Japan'
      ]
    ]
    examples.forEach( ( example ) => {
      const airports = extractAirports( example[0] );
      assert.strictEqual( airports.length, example[1], example[2] );
    });
  });
});