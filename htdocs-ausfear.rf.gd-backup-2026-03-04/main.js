var ready = (callback) => {
    if (document.readyState != "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}
ready(() => {
    document.querySelector(".header").style.height = window.innerHeight + "px";
})

document.addEventListener("DOMContentLoaded", function(){

el_autohide = document.querySelector('.autohide');
    
    if(el_autohide){
        var last_scroll_top = 0;
        window.addEventListener('scroll', function() {
            let scroll_top = window.scrollY;
            if(scroll_top < last_scroll_top) {
                el_autohide.classList.remove('scrolled-down');
                el_autohide.classList.add('scrolled-up');
            }
            else {
                el_autohide.classList.remove('scrolled-up');
                el_autohide.classList.add('scrolled-down');
            }
            last_scroll_top = scroll_top;
        }); 
        // window.addEventListener
    }
    // if

}); 

$(window).click(function(e) {

    if($(".navbar-collapse").hasClass("show")){
       $('.navbar-collapse').removeClass("show"); 
       e.preventDefault();
       }
});
 
$('.navbar-collapse').click(function(event){
      event.stopPropagation();
});

function startTime() {
    var today=new Date();
    var h=today.getHours();
    var m=today.getMinutes();
    var s=today.getSeconds();
    var ampm = "";
    m = checkTime(m);
    s = checkTime(s);

    if (h > 12) {
        h = h - 12;
        ampm = " PM";
    } else if (h == 12){
        h = 12;
        ampm = " PM";
    } else if (h < 12){
        ampm = " AM";
    } else {
        ampm = "PM";
    };

    if(h==0) {
    h=12;
    }

document.getElementById('display').innerHTML = h+":"+m+":"+s+ampm;
var t = setTimeout(function(){startTime()},500);
}
startTime();


function checkTime(i) {
    if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

function startDate() {
    var d = new Date();
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById("date").innerHTML = days[d.getDay()]+" | "+d.getDate()+" "+months[d.getMonth()]+" "+d.getFullYear();
  }
startDate();

// quote array

function genQuote() {
    var quotes = [
        "\"Dude, suckin' at something is the first step at being sorta good at something.\"<br>-  Jake <small><em>(Adventure Time)</em></small>", 
        "\"Either I will find a way, or I will make one.\"<br> - Philip Sidney", 
        "\"Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.\"<br>- Thomas A. Edison", 
        "\"You are never too old to set another goal or to dream a new dream.\"<br>- C.S Lewis", 
        "\"If you can dream it, you can do it.\"<br>- Walt Disney", 
        "\"Never give up, for that is just the place and time that the tide will turn.\"<br>- Harriet Beecher Stowe", 
        "\"I know where I'm going and I know the truth, and I don't have to be what you want me to be. I'm free to be what I want.\"<br>- Muhammad Ali", 
        "\"If you always put limit on everything you do, physical or anything else. It will spread into your work and into your life. There are no limits. There are only plateaus, and you must not stay there, you must go beyond them.\"<br>- Bruce Lee",
    ];   
    var randNum = Math.floor(Math.random() * quotes.length)
    document.getElementById('quote').innerHTML = quotes[randNum];
}
genQuote();

var scroll = window.requestAnimationFrame ||
             function(callback){ window.setTimeout(callback, 1000/60)};
var elementsToShow = document.querySelectorAll('.show-on-scroll'); 
var progressToShow = document.querySelectorAll('.show-on-scroll-progress')

function loop() {

    Array.prototype.forEach.call(elementsToShow, function(element){
      if (isElementInViewport(element)) {
        element.classList.add('is-visible');
      } else {
        element.classList.remove('is-visible');
      }
    });
    Array.prototype.forEach.call(progressToShow, function(element){
      if (isElementInViewport(element)) {
        element.classList.add('is-visible-progress');
      } else {
        element.classList.remove('is-visible-progress');
      }
    });

    scroll(loop);
}

loop();

function isElementInViewport(el) {
  if (typeof jQuery === "function" && el instanceof jQuery) {
    el = el[0];
  }
  var rect = el.getBoundingClientRect();
  return (
    (rect.top <= 0
      && rect.bottom >= 0)
    ||
    (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight))
      ||
      (rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
    );
  }

// const callback = function(entries) {
//     entries.forEach(entry => {
//       entry.target.classList.toggle("is-visible");
//     });
//   };
  
// const observer = new IntersectionObserver(callback);

// const targets = document.querySelectorAll(".show-on-scroll");
// targets.forEach(function(target) {
// observer.observe(target);
// });