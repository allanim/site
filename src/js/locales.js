(function ($) {
    "use strict";
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

    // init i18n
    i18next
        .use(i18nextXHRBackend)
        .init({
            lng: lang,
            defaultLng: 'en',
            fallbackLng: 'en',
            ns: ['main', 'about', 'resume'],
            defaultNS: 'main'
        }, function () {
            initLangButton();
            updateLanguage(lang);
        })
        .on('languageChanged', function () {
            updateContent();
        });

    function initLangButton() {
        supportedLanguages.forEach(function (val) {
            $('.lang-' + val).click(function () {
                updateLanguage(val);
            });
        });
    }

    function updateLanguage(updateLang) {
        // set language class
        supportedLanguages.forEach(function (val) {
            $('.lang-' + val).removeClass('lang-button-select');
        });
        $('.lang-' + updateLang).addClass('lang-button-select');

        // set cookie
        $.cookie('lang', updateLang, {expires: 365});

        // set html lang
        $("html").attr("lang", updateLang);

        // set i18n lang
        i18next.changeLanguage(updateLang);

        lang = updateLang;
    }

    function updateContent() {
        jqueryI18next.init(i18next, $);
        $("[data-i18n]").localize();
    }

    $('a.linkedInLang').on('click',function() {

        var orgUrl = $(this).data('orgLink');
        if (!orgUrl) {
            orgUrl = $(this).attr('href');
            $(this).data('orgLink', orgUrl);
        }

        if (lang !== 'en') {
            $(this).attr('href', orgUrl + '/' + lang);
        } else {
            $(this).attr('href', orgUrl);
        }
    });

})(jQuery);
