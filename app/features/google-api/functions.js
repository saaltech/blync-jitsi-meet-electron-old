export function showEnableCookieTip(show) {
    let ele = document.getElementById("enableCookieTooltip");
    if(show) {
        ele.classList.remove("hide");
        ele.classList.add("show");
    }
    else {
        ele.classList.remove("show");
        ele.classList.add("hide");
    }  
}