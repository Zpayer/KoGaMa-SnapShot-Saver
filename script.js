// ==UserScript==
// @name         KoGaMa Game SnapShot Saver
// @namespace    http://tampermonkey.net/
// @version      2025-06-11
// @description  try to take over the world!
// @author       Zpayer.
// @match		 https://www.kogama.com/page/webgl-frame/*
// @match		 https://kogama.com.br/page/webgl-frame/*
// @match		 https://friends.kogama.com/page/webgl-frame/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kogama.com
// @grant        none
// ==/UserScript==


let snapshot = top.snapshot = [];
function func01 (p0,p1) {
let i = 0, r;
Object.values(p1).forEach(num=>{
if (num == p0 && [...p1][i+1] == 120 ){
    let length = new Uint32Array(p1.slice(i+2,i+6).reverse().buffer)[0]
    r = p1.slice(i+6,i+6+length)
}
i++
})
return r
};

WebSocket = new Proxy(WebSocket, {
    construct(target, args) {
        const ws = new target(...args);

        let userOnMessage = null;
        Object.defineProperty(ws, 'onmessage', {
          get() {
            return userOnMessage;
          },
          set(p0) {
            userOnMessage = function(e) {
              let var01 = new Uint8Array(e.data);
              if (var01[2] == 62&&var01[1] == 4) (id("menu").style.display="flex",snapshot.push(...func01(245,var01)));
              p0.call(ws, e);
            };
            ws.addEventListener('message', userOnMessage);
          }
        });
        return ws;
    }
});


//   UI
const div = (...a) => `<div ${a[0]?"id="+a[0]:""} ${a[1]?"class="+a[1]:""}>${a[2]?a[2]:""}</div>`
const id = (a) => document.getElementById(a);
document.body.innerHTML += `
<style>
    #menu {
        color: white;
        height: 100px;
        width: 126px;
        background: #000000a1;
        position: absolute;
        top: 20%;
        left: 10px;
        z-index: 999;
        border-radius: 5px;
        backdrop-filter: blur(10px);
        user-select: none;
        display: none;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }

    #menu #title {
        font-family: sans-serif;
        font-weight: bolder;
        font-size: 10px;
    }

    #menu #button {
        transition: 1s ease;
        cursor: pointer;
        height: 30%;
        border: 1px solid #ffffff59;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        margin: 10px;
    }

    #menu #button:hover {
        transform: scale(0.9);
        border: 1px solid #ffffff8a;
    }
    #menu #loader {
    position: absolute;
    height: 100%;
    width: 100%;
    display: none;
    justify-content: center;
    align-items: center;
    background: #000000ba;
    }
    #menu #loader #loading {
        width: 48px;
        height: 48px;
        display: inline-block;
        position: relative;
    }

    #menu #loader #loading::after,
    #menu #loader #loading::before {
        content: '';
        box-sizing: border-box;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid #FFF;
        position: absolute;
        left: 0;
        top: 0;
        animation: animloader 2s linear infinite;
    }

    #menu #loader #loading::after {
        animation-delay: 1s;
    }

    @keyframes animloader {
        0% {
            transform: scale(0);
            opacity: 1;
        }

        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
</style>
${
div("menu",0,
    div("button",0,"Export") +
    div("title",0,atob("TWFkZSBieSBacGF5ZXI=")) +
    div("loader",0,
        div("loading")
       )
   )
}`
    let _ = [id("button"), id("loader")]
    _[0].onclick = a => {
        _[1].style.display = "flex";
        setTimeout(l=>_[1].style.display = "none",1e3)
        const url = URL.createObjectURL(new Blob([new Uint8Array(snapshot).buffer]));
        const l = document.createElement('a');
        l.href = url;
        l.download = (top.document.getElementsByClassName("game-title tool-tip")[0].textContent || "snapshot") + ".kgm";
        l.click();
        URL.revokeObjectURL(url);
    }


top.document.onkeydown = document.onkeydown = _ => _.key=="."?id("menu").style.display=id("menu").style.display=="flex"?"none":"flex":0


