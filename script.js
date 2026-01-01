// ==UserScript==
// @name         KoGaMa Game SnapShot Saver (Fixed)
// @namespace    
// @version      0.1
// @description  Saves game snapshots.
// @author       Zpayer.
// @match        https://www.kogama.com/page/webgl-frame/*
// @match        https://kogama.com.br/page/webgl-frame/*
// @match        https://friends.kogama.com/page/webgl-frame/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kogama.com
// @grant        none
// ==/UserScript==


function addModuleScript(scriptContent, f) {
    window.FXHUJCX = f;
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = scriptContent + `;window.FXHUJCX();window.FXHUJCX=null;`;
    document.body.appendChild(script);
}

function LoadScript() {
    if (!window.Protocol16Imports) return;

    const { Protocol16, StreamBuffer, EgMessageType } = window.Protocol16Imports;

    function GetKeyFromValue(object, value) {
        const entry = Object.entries(object).find(([_, val]) => val == value);
        return entry ? entry[0] : null;
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
            // Silently fail to avoid console cluttering during normal gameplay
            return null;
        }
    }

    window.WebSocket = new Proxy(window.WebSocket, {
        construct(target, args) {
            const ws = new target(...args);
            let userOnMessage = null;

            Object.defineProperty(ws, 'onmessage', {
                get() { return userOnMessage; },
                set(callback) {
                    userOnMessage = function (e) {
                        if (e.data instanceof ArrayBuffer || ArrayBuffer.isView(e.data)) {
                            let var01 = new Uint8Array(e.data);
                            // Only process if it matches the Snapshot signature
                            if (var01[2] == 63 && var01[1] == 4) {
                                let result = Deserialize(var01);
                                if (result && result.Data && result.Data.Parameters) {
                                    const params = result.Data.Parameters;
                                    if (params[245] && params[245].Value) {
                                        GameSnapShotDataBuffer.push(...params[245].Value);
                                    }
                                    if (params[103]) Button.style.display = "block";
                                }
                            }
                        }
                        callback.call(ws, e);
                    };
                    ws.addEventListener('message', userOnMessage);
                }
            });
            return ws;
        }
    });

    const $ = (e) => document.querySelector(e);
    let UnityCanvasContainer = $("#unity-canvas-container");

    if (!UnityCanvasContainer) return;

    let Button = document.createElement("div");
    Button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;"><path d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12" stroke="#d9dad9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    Button.style = `
    height: 33px;
    width: 33px;
    bottom: 10px;
    position: absolute;
    z-index: 9999;
    left: 10px;
    background: rgb(31 50 74);
    display: block;
    cursor: pointer;
    border-radius: 4px;
            `;

    Button.onclick = () => {
        if (GameSnapShotDataBuffer.length === 0) return;
        const blob = new Blob([new Uint8Array(GameSnapShotDataBuffer)]);
        const url = URL.createObjectURL(blob);
        const l = document.createElement('a');
        l.href = url;
        l.download = (window.top?.PageData?.bootstrap?.object?.name || "snapshot") + ".kgm";
        l.click();
        URL.revokeObjectURL(url);
    };
    UnityCanvasContainer.appendChild(Button);
}

addModuleScript(`
            import Protocol16 from 'https://cdn.jsdelivr.net/gh/Zpayer/WebUnityProtocols/Protocol16.js';
            import StreamBuffer from 'https://cdn.jsdelivr.net/gh/Zpayer/WebUnityProtocols/StreamBuffer.js';
            import EgMessageType from 'https://cdn.jsdelivr.net/gh/Zpayer/WebUnityProtocols/EgMessageType.js';
            window.Protocol16Imports = {Protocol16, StreamBuffer, EgMessageType};
        `, () => LoadScript());
