$(function() {
    var $el = $('#pdf'),
        scale = $el.innerWidth() / 2479,
        $audio = $('#audio'),
        notation = new Notation({
            sections: sections,
            notes: notes,
            times: times
        }, {
            el: $el,
            scale: scale
        });

    $el.height(3508 * scale);
    ko.applyBindings(notation);

    $audio.on('timeupdate', function() {
        console.log($audio[0].currentTime);
    });

    notation.goToNext();
});
