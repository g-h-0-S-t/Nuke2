javascript: (function () {
    if (window.__tabNukePanel) { window.__tabNukePanel.remove(); }
    if (window.__tabNukeLog && !window.__tabNukeLog.closed) window.__tabNukeLog.close();

    var statData = { opened: 0, closed: 0, failed: 0, scrolls: 0, batch: 0, phase: 'Ready', progress: 0, total: 0, log: [], isPaused: false, runActive: false, startTime: Date.now() };
    var openedTabs = [];
    var logWindowId = 'tabnukelogwin';

    function addLog(msg, type) {
        var ts = new Date().toLocaleTimeString();
        statData.log.push({ msg: msg, type: type, ts: ts });
        if (statData.log.length > 350) statData.log = statData.log.slice(-180);
        updatePanel(); updateLog();
    }

    function setPhase(phase, pct) {
        statData.phase = phase;
        if (typeof pct === "number") statData.progress = pct;
        updatePanel(); updateLog();
    }

    function updatePanel() {
        ["opened", "closed", "failed", "scrolls"].forEach(function (k) {
            document.getElementById("stat-" + k).textContent = statData[k] || 0;
        });
        document.getElementById("statLabel").innerHTML = "Phase: <b>" + statData.phase + "</b>" + (typeof statData.progress === "number" ? " (" + statData.progress + "%)" : "");
    }
    function updateLog() {
        if (window.__tabNukeLog && !window.__tabNukeLog.closed) {
            var doc = window.__tabNukeLog.document;
            doc.getElementById("stat-opened").textContent = statData.opened;
            doc.getElementById("stat-closed").textContent = statData.closed;
            doc.getElementById("stat-failed").textContent = statData.failed;
            doc.getElementById("stat-scrolls").textContent = statData.scrolls;
            doc.getElementById("pbar").style.width = (statData.total > 0 ? 100 * ((statData.closed + statData.failed) / statData.total) : statData.progress || 0) + "%";
            var lbox = doc.getElementById("logBox");
            lbox.innerHTML = "";
            statData.log.slice(-95).forEach(function (l) {
                var div = doc.createElement("div");
                div.className = "logline " + (l.type || "info");
                div.innerHTML = '<span class="logts">' + l.ts + "</span>" + {
                    'succ': '<span class="logicon" style="color:#22c55e;">✓</span>',
                    'error': '<span class="logicon" style="color:#ef4444;">✗</span>',
                    'warn': '<span class="logicon" style="color:#f59e0b;">!</span>',
                    'cycle': '<span class="logicon" style="color:#a855f7;">↻</span>',
                    'info': '<span class="logicon" style="color:#3b82f6;">➜</span>'
                }[l.type || 'info'] + '<span class="logmsg">' + l.msg + '</span>';
                lbox.appendChild(div);
            });
            lbox.scrollTop = lbox.scrollHeight;
            doc.getElementById("pauseBtn").disabled = !statData.runActive || statData.isPaused;
            doc.getElementById("resumeBtn").disabled = !statData.runActive || !statData.isPaused;
            doc.getElementById("stopBtn").disabled = !statData.runActive;
        }
    }

    function closeAllOpenedTabs() {
        var closedNo = 0;
        for (var i = 0; i < openedTabs.length; i++) {
            try {
                if (openedTabs[i] && !openedTabs[i].closed) {
                    openedTabs[i].close();
                    closedNo++;
                }
            } catch (e) { }
        }
        addLog("Closed " + closedNo + " tabs on stop.", "warn");
        openedTabs = [];
    }

    function createPanel() {
        var panel = document.createElement("div");
        panel.id = "__tabNukePanel";
        panel.innerHTML =
            `<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap");
:root, .tabnuke-panel {
  --bg-primary:#1a1d29;--bg-secondary:#0f1419;--bg-card:rgba(255,255,255,0.03);--bg-card-hover:rgba(255,255,255,0.05);--border-color:rgba(255,255,255,0.13);
  --text-primary:#fff;--text-secondary:rgba(255,255,255,0.6);--text-tertiary:rgba(255,255,255,0.4);--accent-primary:#3b82f6;
}
.tabnuke-panel.light-mode {
  --bg-primary:#fff;--bg-secondary:#f9fafb;--bg-card:rgba(0,0,0,0.02);--bg-card-hover:rgba(0,0,0,0.04);--border-color:rgba(0,0,0,0.13);
  --text-primary:#111827;--text-secondary:rgba(0,0,0,0.6);--text-tertiary:rgba(0,0,0,0.4);--accent-primary:#2563eb;
}
.tabnuke-panel {
  font-family:Inter,Arial,sans-serif;background:linear-gradient(180deg,var(--bg-primary),var(--bg-secondary));
  box-shadow:4px 0 28px #101420b8;border-right:1.5px solid var(--border-color);width:368px;max-width:97vw;min-width:245px;height:100vh;
  position:fixed;left:0;top:0;z-index:2147483550;display:flex;flex-direction:column;align-items:stretch;}
.nuke-header{display:flex;align-items:center;justify-content:space-between;padding:11px;margin-bottom:21px;border-bottom:1px solid var(--border-color);background:linear-gradient(120deg,#22253b38 0%,#43508d10 100%);}
.nuke-title{font-weight:700;font-size:1.14em;color:var(--text-primary);letter-spacing:.4px;}
#nukeThemeBtn{background:var(--bg-card);border:1.3px solid var(--border-color);color:var(--text-secondary);border-radius:8px;font-size:17px;padding:7px 11px;cursor:pointer;}
.nuke-modegrp{display:flex;gap:17px;margin-top:11px;margin-bottom:22px;align-items:center;justify-content:center;}
.nuke-modegrp label{display:flex;align-items:center;gap:7px;font-size:14.8px;font-weight:600;color:var(--text-primary);}
.nuke-modegrp input[type=radio]{accent-color:var(--accent-primary);width:15px;height:15px;}
.nuke-modegrp input[type=checkbox]{accent-color:var(--accent-primary);width:16px;height:16px;}
.nuke-row{display:flex;align-items:center;justify-content:center;gap:13px;margin-bottom:14px;}
.nuke-row label{font-size:15px;color:var(--text-primary);font-weight:500;}
.nuke-btnrow{display:flex;justify-content:center;gap:15px;margin-bottom:10px;}
.nuke-launch{background:var(--accent-primary);color:#fff;border:none;padding:8px 22px;border-radius:7px;cursor:pointer;font-weight:600;font-size:13.2px;box-shadow:0 1px 2px #12376534;}
.nuke-logbtn{background:#222842;color:#e0eeff;;border:none;padding:8px 22px;border-radius:7px;cursor:pointer;font-weight:600;font-size:13px;}
.nuke-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 17px;padding:0 16px 9px 18px;}
.nuke-card{background:var(--bg-card);border:1.2px solid var(--border-color);border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:60px;padding:14px 2px;box-sizing:border-box;}
.nuke-statval{font-family:Inter,sans-serif;font-style:normal;font-weight:800;font-size:23px;color:var(--accent-primary);}
.nuke-statlbl{font-size:11.5px;color:var(--text-tertiary);margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.7px;}
.statln{padding:9px 0 4px;text-align:center;color:var(--text-secondary);font-size:13px;}
.nuke-small{font-size:12.1px;color:var(--text-tertiary);text-align:center;padding:12px 10px 6px;}
</style>
<div class="tabnuke-panel"><div class="nuke-header"><div class="nuke-title">Nuke v2.0</div><button id="nukeThemeBtn" title="Toggle theme">🌙</button></div>



<div class="nuke-cards">
<div class="nuke-card"><div class="nuke-statval" id="stat-opened">0</div><div class="nuke-statlbl">OPENED</div></div>
<div class="nuke-card"><div class="nuke-statval" id="stat-closed">0</div><div class="nuke-statlbl">CLOSED</div></div>
<div class="nuke-card"><div class="nuke-statval" id="stat-scrolls">0</div><div class="nuke-statlbl">SCROLLED</div></div>
<div class="nuke-card"><div class="nuke-statval" id="stat-failed">0</div><div class="nuke-statlbl">FAILED</div></div>
</div>

<div class="nuke-modegrp">
<label><input type="radio" name="mode" value="scroll" id="modeScroll" checked>Scroll-for-Views</label>
<label><input type="radio" name="mode" value="dos" id="modeDOS">DOS</label>
<label style="margin-left:.5em;"><input type="checkbox" id="infinite">Infinite</label>
</div>

<div class="nuke-row"><label>Tabs <input id="tabsPerUrl" type="number" min="1" max="999" value="5" style="width:3.3em;margin-left:5px;padding-left:11px;border-radius:6px;border:1px solid #283856;background:var(--bg-card);color:var(--text-primary);"></label></div>
<div class="nuke-btnrow"><button id="launchBtn" class="nuke-launch">Launch</button><button class="nuke-logbtn" id="showLogBtn" type="button">Log</button></div>

<div class="statln" id="statLabel">Ready</div>
<div class="nuke-small">Controls/statistics in Log window.</div>

</div>`;
        document.body.appendChild(panel);
        return panel.querySelector(".tabnuke-panel");
    }

    function createLogWindow() {
        if (window.__tabNukeLog && !window.__tabNukeLog.closed) { window.__tabNukeLog.focus(); return window.__tabNukeLog; }
        var w = window.open("", logWindowId, "width=690,height=640,resizable,scrollbars");
        window.__tabNukeLog = w;
        w.document.write('<!DOCTYPE html><html><head>' +
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap">' +
            '<style>' +
            ':root, body {' +
            '--bg-primary: #1a1d29; --bg-secondary: #0f1419; --bg-card: rgba(255,255,255,0.03); --bg-card-hover: rgba(255,255,255,0.05);' +
            '--border-color: rgba(255,255,255,0.13);--text-primary: #fff;--text-secondary: rgba(255,255,255,0.6);--text-tertiary: rgba(255,255,255,0.4);--accent-primary: #3b82f6;}' +
            'body.light-mode {' +
            '--bg-primary:#fff;--bg-secondary:#f9fafb;--bg-card:rgba(0,0,0,0.02);--bg-card-hover:rgba(0,0,0,0.04);--border-color:rgba(0,0,0,0.13);--text-primary:#111827;' +
            '--text-secondary:rgba(0,0,0,0.6);--text-tertiary:rgba(0,0,0,0.4);--accent-primary:#2563eb;}' +
            'body.light-mode #logTitle {' +
            'color:var(--text-primary);' +
            '}' +
            'body.light-mode .logmsg {' +
            'color:#e7e9fd;' +
            '}' +
            'body{font-family:Inter,Arial,sans-serif;background:var(--bg-primary);color:var(--text-primary);margin:0;}' +
            '.logcard{max-width:550px;margin:2em auto;background:var(--bg-card);border-radius:14px;padding:28px 18px 20px;box-shadow:0 7px 30px #090e208d;}' +
            '.logstats{display:grid;grid-template-columns:repeat(4,1fr);gap:18px 19px;margin-bottom:22px;}' +
            '.logcard .statbox{background:var(--bg-card,#232a40);border-radius:10px;border:1.2px solid var(--border-color);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:15px 0 13px 0;}' +
            '.statval{font-weight:800;font-size:22px;line-height:1.1;color:var(--accent-primary);font-family:Inter,sans-serif;}' +
            '.statlbl{font-size:11.1px;color:var(--text-tertiary);margin-top:4px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;}' +
            '.pbarwrap{margin:.9em 0 .1em 0;width:100%;height:13px;border-radius:7px;overflow:hidden;background:#202842;border:1px solid #232f48;}' +
            '.pbar{height:100%;background:linear-gradient(90deg,#3b82f6,#2563eb 70%);transition:width .36s;width:0%;}' +
            '.controls{display:flex;gap:12px;justify-content:center;margin:16px 0 8px 0;}' +
            '#pauseBtn,#resumeBtn,#stopBtn,#clrBtn,#exitBtn{background:var(--bg-card,#232a40);color:#b5d6fb;border:none;border-radius:8px;padding:8px 22px;font-weight:700;cursor:pointer;outline:none;}' +
            '#pauseBtn{background:#10b981;color:#022a1e;}#pauseBtn:disabled{opacity:.4;}#resumeBtn{background:#2563eb;color:#dcf1f8;}#resumeBtn:disabled{opacity:.4;}' +
            '#stopBtn{background:#ef4444;color:#fff;}#stopBtn:disabled{opacity:.6;}' +
            '#clrBtn{background:#2d3445;color:#b7d6f9;}#exitBtn{background:#23304a;color:#b7d6f9;}' +
            '.logbox{background:#161b28;border-radius:8px;min-height:90px;max-height:237px;overflow:auto;font-size:.99em;line-height:1.7;padding:.8em .98em;margin-top:.8em;}' +
            '.logline{margin-bottom:3px;padding:.12em .7em;border-radius:5px;display:flex;gap:13px;align-items:center;}' +
            '.succ{background:rgba(16,185,129,0.09);}' +
            '.warn{background:rgba(245,158,11,0.10);}' +
            '.error{background:rgba(239,68,68,0.09);}' +
            '.info{background:rgba(59,130,246,0.09);}' +
            '.cycle{background:rgba(168,85,247,0.10);}' +
            '.logts{color:#b2bfdc;font-size:10px;font-weight:400;min-width:62px;}' +
            '.logmsg{font-size:13px;flex:1;}' +
            '.logicon{font-size:14px;width:21px;text-align:center;}' +
            '</style></head>' +
            '<body><div class="logcard"><div id="logTitle" style="text-align:center;font-size:1.11em;font-weight:700;letter-spacing:.12em;margin-bottom:17px;">Nuke Logs</div>' +
            '<div class="logstats">' +
            '<div class="statbox"><div class="statval" id="stat-opened">0</div><div class="statlbl">OPENED</div></div>' +
            '<div class="statbox"><div class="statval" id="stat-closed">0</div><div class="statlbl">CLOSED</div></div>' +
            '<div class="statbox"><div class="statval" id="stat-scrolls">0</div><div class="statlbl">SCROLLED</div></div>' +
            '<div class="statbox"><div class="statval" id="stat-failed">0</div><div class="statlbl">FAILED</div></div>' +
            '</div>' +
            '<div class="pbarwrap"><div class="pbar" id="pbar"></div></div>' +
            '<div class="controls"><button id="pauseBtn">Pause</button><button id="resumeBtn" style="display:none;">Resume</button><button id="stopBtn">Stop</button><button id="clrBtn">Clear Logs</button><button id="exitBtn">Exit</button></div>' +
            '<div class="logbox" id="logBox"></div></div></body></html>');
        var wdoc = w.document;
        wdoc.close();
        wdoc.getElementById("pauseBtn").onclick = function () { statData.isPaused = true; updatePanel(); updateLog(); wdoc.getElementById("pauseBtn").style.display = "none"; wdoc.getElementById("resumeBtn").style.display = ""; };
        wdoc.getElementById("resumeBtn").onclick = function () { statData.isPaused = false; updatePanel(); updateLog(); wdoc.getElementById("pauseBtn").style.display = ""; wdoc.getElementById("resumeBtn").style.display = "none"; };
        wdoc.getElementById("stopBtn").onclick = function () {
            statData.runActive = false;
            closeAllOpenedTabs();
            updatePanel(); updateLog();
            addLog("Stopped by user and closed all opened tabs.", "warn");
            wdoc.getElementById("pbar").style.width = '100%';
        };
        wdoc.getElementById("clrBtn").onclick = function () { statData.log = []; updatePanel(); updateLog(); };
        wdoc.getElementById("exitBtn").onclick = function () { w.close(); };
        window.__tabNukeLog = w;
        return w;
    }

    function updateAll() { updatePanel(); updateLog(); }

    function mainRunScroll(n, infinite) {
        statData.runActive = true;
        var cycleNum = 0;
        (function runner() {
            if (!statData.runActive) return;
            statData.opened = statData.closed = statData.failed = statData.scrolls = 0;
            statData.total = infinite ? "∞" : n;
            statData.batch = cycleNum + 1;
            updateAll();

            var i = 0;
            function next() {
                if (!statData.runActive) return;
                if (statData.isPaused) { setTimeout(next, 170); return; }

                if (!infinite && i >= n) {
                    setPhase("Done", 100);
                    addLog("Scroll-Mode: COMPLETE.", "succ");
                    return;
                }

                var windowName = "tab_" + Date.now() + "_" + i;
                addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Opening: " + windowName, "info");

                var newTab = window.open(window.location.href, windowName);
                openedTabs.push(newTab);
                statData.opened++;
                updateAll();

                if (newTab) {
                    var tryCount = 0;
                    var maxTries = 10;


                    var loadCheck = setInterval(function () {
                        if (!statData.runActive || newTab.closed) {
                            clearInterval(loadCheck);
                            return;
                        }

                        try {

                            if (newTab.document && newTab.document.readyState === 'complete' &&
                                newTab.document.body && newTab.document.body.scrollHeight > 0) {

                                clearInterval(loadCheck);


                                try {
                                    newTab.focus();
                                    var scrollHeight = Math.max(
                                        newTab.document.body.scrollHeight,
                                        newTab.document.documentElement.scrollHeight
                                    );
                                    var clientHeight = Math.max(
                                        newTab.document.documentElement.clientHeight,
                                        newTab.document.body.clientHeight
                                    );
                                    var maxScroll = scrollHeight - clientHeight;


                                    newTab.scrollTo(0, scrollHeight);

                                    statData.scrolls++;
                                    addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Instantly scrolled to bottom: " + windowName, "succ");


                                    setTimeout(function () {
                                        try {
                                            if (!newTab.closed) {
                                                newTab.close();
                                                statData.closed++;
                                                addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Closed: " + windowName, "succ");
                                            }
                                        } catch (e) {
                                            statData.failed++;
                                            addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Close failed: " + e.message, "error");
                                        }
                                        updateAll();
                                        i++;
                                        next();
                                    }, 50);

                                } catch (e) {
                                    addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Scroll error: " + e.message, "error");

                                    try {
                                        if (!newTab.closed) {
                                            newTab.close();
                                            statData.closed++;
                                        }
                                    } catch {
                                        statData.failed++;
                                    }
                                    updateAll();
                                    i++;
                                    next();
                                }
                            }
                        } catch (e) {

                            tryCount++;
                            if (tryCount > maxTries) {
                                clearInterval(loadCheck);
                                addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Tab load timeout: " + windowName, "warn");
                                if (!newTab.closed) {
                                    try {
                                        newTab.close();
                                        statData.closed++;
                                    } catch {
                                        statData.failed++;
                                    }
                                }
                                updateAll();
                                i++;
                                next();
                            }
                        }
                    }, 100);

                } else {
                    addLog("[" + (i + 1) + (infinite ? "∞" : "/" + n) + "] Failed to open: " + windowName, "error");
                    statData.failed++;
                    updateAll();
                    i++;
                    next();
                }

                setPhase("Scroll for Views", !infinite ? Math.round(((i) / n) * 100) : 0);
                updateAll();
            }
            next();
        })();
    }

    function mainRunDos(n, infinite) {
        statData.runActive = true;
        var batch = 1, dwellTime = 1950, maxDwell = 34000;
        (function runner() {
            if (!statData.runActive) return;
            statData.opened = statData.closed = statData.failed = statData.scrolls = 0;
            statData.total = n; statData.batch = batch++; updateAll();
            var openTabs = [], openAt = [];
            for (var i = 0; i < n; i++) {
                if (!statData.runActive) return;
                var tabName = "tab_" + batch + "_" + i;
                var w = window.open(window.location.href, tabName); openTabs.push({ w: w, idx: i, closed: false }); openAt.push(Date.now());
                openedTabs.push(w);
                addLog("[" + tabName + "] Opened: " + window.location.href, "info");
                statData.opened++; updateAll();
            }
            var idx = 0;
            (function closeNext() {
                if (idx >= openTabs.length || (openTabs.length == 0) || !statData.runActive) { setPhase("DOS: Batch done", 100); addLog("[DOS batch] All tabs closed, next batch...", "info"); if (infinite && statData.runActive) { runner(); } else { setPhase("Done", 100); addLog("DOS-Mode: COMPLETE.", "succ"); } return; }
                if (statData.isPaused) { setTimeout(closeNext, 170); return; }
                var item = openTabs[idx], w = item.w, at = openAt[idx], dwell = dwellTime + Math.floor(Math.random() * 110), waited = 0, maxWait = Math.max(dwell, maxDwell);
                (function dwellWait() {
                    if (!statData.runActive) return;
                    if (statData.isPaused) { setTimeout(dwellWait, 100); return; }
                    waited += 97;
                    try {
                        if (!w || w.closed) { idx++; closeNext(); return; }
                        var loaded = w.document && w.document.readyState === "complete" && w.document.body;
                        if ((loaded && (Date.now() - at) > dwell) || (waited > maxWait)) {
                            var duration = Date.now() - at;
                            try { w.close(); statData.closed++; addLog("[DOS #" + (batch - 1) + "-" + idx + "] Closed after " + (duration / 1000).toFixed(2) + "s", "succ"); } catch { statData.failed++; addLog("[DOS #" + (batch - 1) + "-" + idx + "] Close failed: GC/Denied", "warn"); }
                            updateAll(); idx++; closeNext(); return;
                        }
                        setTimeout(dwellWait, 97);
                    } catch (e) { setTimeout(dwellWait, 97); }
                })();
            })();
        })();
    }

    var panel = createPanel(),
        showLogBtn = panel.querySelector("#showLogBtn"),
        launchBtn = panel.querySelector("#launchBtn"),
        modeScrollRadio = panel.querySelector("#modeScroll"),
        modeDOSRadio = panel.querySelector("#modeDOS"),
        infiniteChk = panel.querySelector("#infinite"),
        tabsInput = panel.querySelector("#tabsPerUrl"),
        themeBtn = panel.querySelector("#nukeThemeBtn");


    panel.classList.remove("light-mode");

    function updateTabsBox() {
        if (modeScrollRadio.checked && infiniteChk.checked) {
            tabsInput.disabled = true; tabsInput.style.opacity = .55;
        } else {
            tabsInput.disabled = false; tabsInput.style.opacity = '';
        }
    }
    modeScrollRadio.onchange = infiniteChk.onchange = modeDOSRadio.onchange = updateTabsBox;
    updateTabsBox();

    showLogBtn.onclick = function () {
        var logWin = createLogWindow();

        if (panel.classList.contains("light-mode")) logWin.document.body.classList.add("light-mode");
        else logWin.document.body.classList.remove("light-mode");
        updatePanel(); updateLog();
    };

    launchBtn.onclick = function () {
        var n = parseInt(panel.querySelector("#tabsPerUrl").value, 10),
            infinite = panel.querySelector("#infinite").checked,
            isDOS = panel.querySelector("#modeDOS").checked;

        if ((!infinite && (!n || n < 1 || n > 999)) || (infinite && isDOS && (!n || n < 1 || n > 999))) {
            alert("Tab count required and must be 1-999.");
            return;
        }

        statData.log = [];
        statData.startTime = Date.now();
        openedTabs = [];
        showLogBtn.click();
        addLog("== RUN STARTED (" + (isDOS ? "DOS" : "Scroll") + ") ==", "info");
        statData.runActive = true;
        statData.isPaused = false;


        if (isDOS) {
            mainRunDos(n, infinite);
        } else {
            mainRunScroll(n, infinite);
        }
    };

    themeBtn.onclick = function () {
        var lightOn = !panel.classList.contains("light-mode");
        panel.classList.toggle("light-mode", lightOn);
        themeBtn.textContent = lightOn ? "☀️" : "🌙";

        if (window.__tabNukeLog && !window.__tabNukeLog.closed) {
            var body = window.__tabNukeLog.document.body;
            if (lightOn) body.classList.add("light-mode");
            else body.classList.remove("light-mode");
        }
    };

})();
