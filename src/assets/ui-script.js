var arg = new Object;
var pair=location.search.substring(1).split('&');
for(var i=0;pair[i];i++) {
    var kv = pair[i].split('=');
    arg[kv[0]]=kv[1];
}

$(window).on('load', async () => {
    let active_slide_num = -1
    const activateSlide = slide_num => {
        setSlideNum(slide_num)

        for(let idx = 0; idx < slides_top.length; idx++) {
            active_slide_num = slide_num;
            if(idx === slide_num) {
                $(`#slide${idx}`).addClass("active")
            } else deactivateSlide(idx)
        }

        console.log("activated")
    }

    $("html").append("<p id='slide-num'>#1</p>");

    const deactivateSlide = slide_num => {
        $(`#slide${slide_num}`).removeClass("active")
    }

    const moveToSlide = slide_num => {
        let escaped_slide_num = Math.max(slide_num, 0)
        escaped_slide_num = Math.min(escaped_slide_num, slides_top.length-1)
        $("html,body").animate({scrollTop:$(`#slide${escaped_slide_num}`).offset().top});
    }

    const setSlideNum = slide_num => {
        console.log("fuga")
        $("#slide-num").animate({
            opacity: 0.5
        }, {
            duration: 300,
            complete: () => {
                console.log(`#${slide_num}`)
                $("#slide-num").text(`#${slide_num+1}`)
                $("#slide-num").animate({opacity: 0.7}, {duration: 300})
            }
        })
    }

    const slides_top = []
    for(let idx = 0; idx < $(".slide").length; idx++) {
        const partation = $(".slide")[idx]
        partation.id = `slide${idx}`;
        const top = partation.getBoundingClientRect().top + window.pageYOffset
        slides_top.push(top)
    }

    // ?slide=Nでスライド番号を指定可能
    if(arg["slide"]) moveToSlide(arg["slide"]-1)

    // スクロール位置を見て画面内のスライドをアクティブ化する
    setInterval(() => {
        let slide_pointer = 0;
        const scroll_middle = $(window).scrollTop() + $(window).height() / 2

        for(let idx = 0; idx < slides_top.length; idx++) {
            const slide_top = slides_top[idx]
            // console.log(`idx: ${idx}, slide-top: ${slide_top}, slide-pointer: ${slide_pointer}`)
            if(slide_top <= scroll_middle && slide_pointer < idx) {
                slide_pointer = idx
            }
            if(idx === slides_top.length-1 && active_slide_num !== slide_pointer) {
                active_slide_num = slide_pointer
                activateSlide(slide_pointer)
            }
        }
    }, 10);

    $('html').keyup(e => {
        switch(e.which){
            case 37: // Key ←
                moveToSlide(active_slide_num-1)
                break;
            case 38: // Key ↑
                moveToSlide(active_slide_num-1)
                break;
            case 39: // Key →
                moveToSlide(active_slide_num+1)
                break;
            case 40: // Key ↓
                moveToSlide(active_slide_num+1)
                break;
            case 13: // Enter
                moveToSlide(active_slide_num+1)
                break;
        }
    })
})