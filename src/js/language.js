var supportedLanguages = ['en', 'ja', 'ko'];
var savedLang = $.cookie('lang');
var localeLang = (window.navigator.languages && window.navigator.languages[0]) ||
    window.navigator.language ||
    window.navigator.userLanguage ||
    window.navigator.browserLanguage;

var paramLang;
var search = $(location).attr('search');
if (search.length > 1) {
    var query = search.substring(1);
    var parameters = query.split('&');
    for (var i = 0; i < parameters.length; i++) {
        var element = parameters[i].split('=');
        if (element[0] === 'lang') {
            paramLang = element[1];
        }
    }
}

console.log(location.href);
console.log($(location).attr('search'));
console.log(paramLang);
console.log(savedLang);
console.log(localeLang);
console.log(supportedLanguages.indexOf(savedLang));

// check language
var lang;
if (supportedLanguages.indexOf(paramLang) > -1) {
    lang = paramLang;
} else if (supportedLanguages.indexOf(savedLang) > -1) {
    lang = savedLang;
} else if (supportedLanguages.indexOf(localeLang) > -1) {
    lang = localeLang;
} else {
    lang = 'en';
}

// save language
$.cookie('lang', lang);

console.log(lang);