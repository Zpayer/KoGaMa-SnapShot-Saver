// ==UserScript==
// @name         KoGaMa Game SnapShot Saver
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Game SnapShot Saver.
// @author       Zpayer.
// @match		 https://www.kogama.com/page/webgl-frame/*
// @match		 https://kogama.com.br/page/webgl-frame/*
// @match		 https://friends.kogama.com/page/webgl-frame/*
// @match        https://www.kogama.com/games/play/*
// @match        https://www.kogama.com/build/*
// @match        https://kogama.com.br/games/play/*
// @match        https://kogama.com.br/build/*
// @match        https://friends.kogama.com/games/play/*
// @match        https://friends.kogama.com/build/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kogama.com
// @grant        none
// ==/UserScript==

if (location.pathname.includes("build")||location.pathname.includes("play")) {
const log = console.log;
console.log = function (...args){
if (args[0] === "setupOptions") window.PageData = args[1];
log(...args);
}
} else {
function addModuleScript(scriptContent, f) {
    window.FXHUJCX = f;
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = scriptContent + `;window.FXHUJCX();window.FXHUJCX=null;`;
    document.body.appendChild(script);
}

function LoadScript() {
    const {
        Protocol16,
        StreamBuffer,
        EgMessageType
    } = window.Protocol16Imports;

    function GetKeyFromValue(object, value) {
        return Object.entries(object).filter(([_, __]) => __ == value)[0][0]
    }


    var GameSnapShotDataBuffer = [];


    let Deserialize = (data) => {
        try {
            let Protocol = new Protocol16(),
                SB = new StreamBuffer(data),
                Data = {};
            Data.MagicNumber = SB.ReadByte();
            Data.EgMessageType = GetKeyFromValue(EgMessageType, SB.ReadByte());
            if ([2, 6].includes(data[1])) Data.Data = Protocol.DeserializeOperationRequest(SB);
            else if ([3, 7].includes(data[1])) Data.Data = Protocol.DeserializeOperationResponse(SB);
            else if (data[1] == 4) Data.Data = Protocol.DeserializeEventData(SB);
            else Data.Data = data;
            return Data;
        } catch (e) {
            console.error(e);
            debugger
        }
    }

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
                        if (var01[2] == 62 && var01[1] == 4) {
                            let {
                                Data
                            } = Deserialize(var01);
                            GameSnapShotDataBuffer.push(...Data.Parameters[245].Value)
                            if (Data.Parameters[100]) Button.style.display = "block"
                        }
                        p0.call(ws, e);
                    };
                    ws.addEventListener('message', userOnMessage);
                }
            });
            return ws;
        }
    });
    const $ = (...e) => document.querySelector(...e);
    let UnityCanvasContainer = $("#unity-canvas-container");

    let Button = document.createElement("div");
    Button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12" stroke="#d9dad9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
    Button.style = `
    --h: 33px;
    height: var(--h);
    width: var(--h);
    bottom: 2px;
    position: absolute;
    z-index: 999;
    left: 32.8%;
    background: rgb(48, 72, 99);
    display: none;
    `
    Button.onclick = () => {
    const url = URL.createObjectURL(new Blob([new Uint8Array(GameSnapShotDataBuffer).buffer]));
    const l = document.createElement('a');
    l.href = url;
    l.download = (top?.PageData?.bootstrap?.object?.name || "snapshot") + ".kgm";
    l.click();
    URL.revokeObjectURL(url);
    }
    UnityCanvasContainer.appendChild(Button);



}




addModuleScript(`
import Protocol16 from 'https://cdn.jsdelivr.net/gh/RandomUser15456/WebUnityProtocols/Protocol16.js';
import StreamBuffer from 'https://cdn.jsdelivr.net/gh/RandomUser15456/WebUnityProtocols/StreamBuffer.js';
import EgMessageType from 'https://cdn.jsdelivr.net/gh/RandomUser15456/WebUnityProtocols/EgMessageType.js';

window.Protocol16Imports = {Protocol16,StreamBuffer,EgMessageType}
`, () => LoadScript())
}

