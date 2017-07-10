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
            ns: ['main'],
            defaultNS: 'main'
        }, function () {
            initLangButton();
            updateLanguage(lang);
        });

    i18next.on('languageChanged', () => {
        updateContent();
    });

    function initLangButton() {
        supportedLanguages.forEach(function (val) {
            $('#lang-' + val).click(function () {
                updateLanguage(val);
            });
        });

    }

    function updateLanguage(updateLang) {
        // set language class
        supportedLanguages.forEach(function (val) {
            $('#lang-' + val).removeClass('btn-primary').addClass('btn-default')
        });
        $('#lang-' + updateLang).addClass('btn-primary').removeClass('btn-default');

        // set cookie
        $.cookie('lang', updateLang);

        // set i18n lang
        i18next.changeLanguage(updateLang);
    }

    function updateContent() {
        jqueryI18next.init(i18next, $);
        $("[data-i18n]").localize();
    }

    // var contactForm = $("form#contact-form");
    // contactForm.submit(function(event){
    //     event.preventDefault();
    //
    //     // Change to your service ID, or keep using the default service
    //     var service_id = "default_service";
    //     var template_id = "allan_contact";
    //
    //     contactForm.find("button").text("Sending...");
    //     emailjs.sendForm(service_id,template_id,"contactForm")
    //         .then(function(){
    //             alert("Sent!");
    //             myform.find("button").text("Send");
    //         }, function(err) {
    //             alert("Send email failed!\r\n Response:\n " + JSON.stringify(err));
    //             myform.find("button").text("Send");
    //         });
    //     return false;
    // });

})(jQuery);
