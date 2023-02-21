(function() {
    let allpassfilterzplanecanvas = document.getElementById("allpasszplane");
    let allpassfilterzplanectx = allpassfilterzplanecanvas.getContext("2d");
    let w;
    let magnitude;
    let angle;
    let zeros = [];
    let poles = [];
    let library = [];
    let avalues = [];
    let allpassfilters = [];
    let flag = true;

    function combobox() {
        library.forEach(function(element, index) {
            $('#a-values').append(`<option value="${index}">${element}</option>`);
        });
    }
    $.ajax({
        url: '/updatelibrary',
        type: 'get',
        success: function(response) {
            library = response;
            combobox();
            drawfrequencyreposne([], [], [], 'allpassfrequencyresponse', 'magnitude', 'angle');
            drawPlane(allpassfilterzplanectx);
        }
    });

    function updataAllpassFilterFrequencyResponse() {
        $.ajax({
            url: '/sendallpassfilter',
            type: 'get',
            success: function(response) {
                data = response;
                zeros = data.zeros
                poles = data.poles
                magnitude = data.magnitude;
                w = data.w;
                angle = data.angle;
                library = data.library;
                allpassfilterzplanectx.clearRect(0, 0, cw, ch);
                drawAll(allpassfilterzplanectx, zeros, poles, '#91b233');
                drawfrequencyreposne(w, magnitude, angle, 'allpassfrequencyresponse', 'magnitude', 'angle');
                drawPlane(allpassfilterzplanectx);
            }
        });

    }
    $('#a-values').change(function() {
        let index = $(this).val();
        let js_index = JSON.stringify(index);
        $('#addFilterLoader').html('');
        $.ajax({
            url: '/getallpassfilter',
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: js_index,
            success: function() {
                updataAllpassFilterFrequencyResponse();
            }
        });
    });

    function addaValues() {
        let vals = [...document.getElementsByClassName('allpassfiltera')]
        vals.forEach(function(element) {
            avalues.push(element.value);
        });
    }

    function validate(arr) {
        if (arr[0] == '' || arr[1] == '') {
            $(".allpassfiltera").addClass("invalid");
            $(".allpassfiltera").removeClass("valid");
            $('#addfiltertolibrary').prop('disabled', true);
            avalues = [];
            return false;
        }
        if (arr[0] > 1.5 || arr[1] > 1.5 || arr[0] < -1.5 || arr[1] < -1.5) {
            $(".allpassfiltera").addClass("invalid");
            $(".allpassfiltera").removeClass("valid");
            $('#addfiltertolibrary').prop('disabled', true);
            avalues = [];
            return false;

        }
        $(".allpassfiltera").addClass("valid");
        $(".allpassfiltera").removeClass("invalid");
        $('#addfiltertolibrary').prop('disabled', false);
        avalues = [parseFloat(arr[0]), parseFloat(arr[1])];
        return true;
    }

    function updatelibrary() {
        $.ajax({
            url: '/updatelibrary',
            type: 'get',
            success: function(response) {
                library = response;
                $('#addFilterToLibraryLoader').html('<i class="fas fa-check"></i>');
                $('#a-values').append(`<option value="${library.length-1}" selected="selected">${library[library.length-1]}</option>`);
                allpassfilterzplanectx.clearRect(0, 0, cw, ch);
                drawAll(allpassfilterzplanectx, zeros, poles, '#91b233');
                drawfrequencyreposne(w, magnitude, angle, 'allpassfrequencyresponse', 'magnitude', 'angle');
                drawPlane(allpassfilterzplanectx);
            }
        });
    }

    $('.allpassfiltera').keyup(function() {
        avalues = [];
        addaValues();
        console.log(avalues);
        if (!validate(avalues)) {
            return;
        }
        let js_a = JSON.stringify(avalues);
        $.ajax({
            url: '/getallpassfilter',
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: js_a,
            success: function() {

                updataAllpassFilterFrequencyResponse();
            }
        });
    });

    function addtolibrary() {
        if (!validate(avalues)) {
            return;
        }
        let js_a = JSON.stringify(avalues);
        $.ajax({
            url: '/updatelibrary',
            type: 'post',
            contentType: 'application/json',
            dataType: 'json',
            data: js_a,
            success: function() {
                flag = true;
                updatelibrary();
            }
        });


    }

    function addallpassfiltertodesign() {
        if (!validate(avalues)) {
            return;
        }
        temp = document.getElementById("a-values").value;
        allpassfilters.push(temp);
        let value = library[temp];
        let index = $('input[name="allpassfilters"]').length;
        $('#addFilterLoader').html('<i class="fas fa-check"></i>');

        $('#filters').append(`<div class="d-flex"><input type="checkbox" name="allpassfilters" id="${index}" value="${index}"/><label for="${index}">${value}</label></div>`);
        $(`#${index}`).change(function() {
            temp = ($(this).val());
            let index = allpassfilters[temp]
            let js_index = JSON.stringify(index);
            $.ajax({
                url: '/activateordeactivateallpassfilter',
                type: 'post',
                contentType: 'application/json',
                dataType: 'json',
                data: js_index,
                success: function(response) {
                    allpassfilterszeros = response.allpassfilterzeros;
                    allpassfilterspoles = response.allpassfilterpoles;
                    updatefrequencyrespose();
                }
            });
        });
    }

    addfiltertolibrary.addEventListener("click", function() { addtolibrary(); });
    addfilter.addEventListener("click", function() {
        addallpassfiltertodesign();
    });


}());


const carousel = document.querySelector(".carousel"),
    firstImg = carousel.querySelectorAll("img")[0],
    arrowIcons = document.querySelectorAll(".wrapper i");

let isDragStart = false,
    isDragging = false,
    prevPageX, prevScrollLeft, positionDiff;

const showHideIcons = () => {
    // showing and hiding prev/next icon according to carousel scroll left value
    let scrollWidth = carousel.scrollWidth - carousel.clientWidth; // getting max scrollable width
    arrowIcons[0].style.display = carousel.scrollLeft == 0 ? "none" : "block";
    arrowIcons[1].style.display = carousel.scrollLeft == scrollWidth ? "none" : "block";
}

arrowIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        let firstImgWidth = firstImg.clientWidth + 14; // getting first img width & adding 14 margin value
        // if clicked icon is left, reduce width value from the carousel scroll left else add to it
        carousel.scrollLeft += icon.id == "left" ? -firstImgWidth : firstImgWidth;
        setTimeout(() => showHideIcons(), 60); // calling showHideIcons after 60ms
    });
});

const autoSlide = () => {
    // if there is no image left to scroll then return from here
    if (carousel.scrollLeft - (carousel.scrollWidth - carousel.clientWidth) > -1 || carousel.scrollLeft <= 0) return;

    positionDiff = Math.abs(positionDiff); // making positionDiff value to positive
    let firstImgWidth = firstImg.clientWidth + 14;
    // getting difference value that needs to add or reduce from carousel left to take middle img center
    let valDifference = firstImgWidth - positionDiff;

    if (carousel.scrollLeft > prevScrollLeft) { // if user is scrolling to the right
        return carousel.scrollLeft += positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
    }
    // if user is scrolling to the left
    carousel.scrollLeft -= positionDiff > firstImgWidth / 3 ? valDifference : -positionDiff;
}

const dragStart = (e) => {
    // updatating global variables value on mouse down event
    isDragStart = true;
    prevPageX = e.pageX || e.touches[0].pageX;
    prevScrollLeft = carousel.scrollLeft;
}

const dragging = (e) => {
    // scrolling images/carousel to left according to mouse pointer
    if (!isDragStart) return;
    e.preventDefault();
    isDragging = true;
    carousel.classList.add("dragging");
    positionDiff = (e.pageX || e.touches[0].pageX) - prevPageX;
    carousel.scrollLeft = prevScrollLeft - positionDiff;
    showHideIcons();
}

const dragStop = () => {
    isDragStart = false;
    carousel.classList.remove("dragging");

    if (!isDragging) return;
    isDragging = false;
    autoSlide();
}

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("touchstart", dragStart);

document.addEventListener("mousemove", dragging);
carousel.addEventListener("touchmove", dragging);

document.addEventListener("mouseup", dragStop);
carousel.addEventListener("touchend", dragStop);