$(function() {
    var $container = $('.g-container'),
        scale = $container.innerWidth() / 2479,
        $audio = $('#audio'),
        notation = new Notation({
            scale: scale,
            speed: 1
        });

    $container.width($(window).width());

    ko.applyBindings(notation);

    notation.init({
        sections: sections,
        notes: notes,
        times: times
    });

    $('.page').height(3508 * scale);

    $audio.on('timeupdate', function() {
        notation.currentTime($audio[0].currentTime);
    });
});
