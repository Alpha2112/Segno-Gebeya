"""Render and inspect M0/M1 DESIGN ARTIFACTS only using an isolated headless Chrome.
Requires already available Python websocket-client and Pillow; installs nothing.
Does not run native builds, application tests, provider calls or technical proofs.
"""
from pathlib import Path
import json, time, tempfile, subprocess, threading, http.server, urllib.request, base64, hashlib, re
import websocket
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/"docs/design/m0"
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
handler=lambda *a,**kw:QuietHandler(*a,directory=str(ROOT),**kw)
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}"
profile=Path(tempfile.mkdtemp(prefix="segno-m0-review-")).resolve()
chrome=Path("C:/Program Files/Google/Chrome/Application/chrome.exe")
proc=subprocess.Popen([str(chrome),"--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check","--disable-background-networking","--remote-debugging-port=0","--remote-allow-origins=*","--user-data-dir="+str(profile),"about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
report={"artifact_scope":"M0/M1 local design review only; no application/native/integration proofs","renders":[],"interaction_checks":[],"exceptions":[],"screenshots":[]}
seq=0;ws=None
def send(method,params=None):
    global seq
    seq+=1;ws.send(json.dumps({"id":seq,"method":method,"params":params or {}}))
    while True:
        msg=json.loads(ws.recv())
        if msg.get("method")=="Runtime.exceptionThrown":report["exceptions"].append(msg["params"]["exceptionDetails"].get("text","Runtime exception"))
        if msg.get("id")==seq:
            if "error" in msg:raise RuntimeError(msg["error"])
            return msg.get("result",{})
def ev(code):
    r=send("Runtime.evaluate",{"expression":code,"returnByValue":True,"awaitPromise":True})
    if "exceptionDetails" in r:raise RuntimeError(str(r["exceptionDetails"]))
    return r.get("result",{}).get("value")
def nav(url,width=1440,height=1100):
    send("Emulation.setDeviceMetricsOverride",{"width":width,"height":height,"deviceScaleFactor":1,"mobile":False})
    send("Page.navigate",{"url":url})
    for _ in range(100):
        try:
            if ev("document.readyState==='complete' && (document.querySelector('#stage h1')||document.querySelector('#app h1')) !== null"):break
        except Exception:pass
        time.sleep(.04)
    ev("document.fonts.ready.then(()=>true)")
    return ev("({title:document.title,heading:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,fontLoaded:document.fonts.check('16px Inter')&&document.fonts.check('16px \"Noto Sans Ethiopic\"'),buttons:document.querySelectorAll('button').length})")
def screenshot(rel,selector=None):
    params={"format":"png","captureBeyondViewport":True}
    if selector:
        box=ev("(()=>{let r=document.querySelector("+json.dumps(selector)+").getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()")
        params["clip"]=box
    else:
        metrics=send("Page.getLayoutMetrics")["cssContentSize"]
        params["clip"]={"x":0,"y":0,"width":metrics["width"],"height":metrics["height"],"scale":1}
    target=ROOT/rel;target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(base64.b64decode(send("Page.captureScreenshot",params)["data"]));report["screenshots"].append(rel)
def check(name,code):
    passed=bool(ev(code));report["interaction_checks"].append({"check":name,"passed":passed})
    print(("PASS " if passed else "FAIL ")+name,flush=True)
try:
    active=profile/"DevToolsActivePort"
    for _ in range(100):
        if active.exists():break
        time.sleep(.1)
    port=active.read_text().splitlines()[0]
    tabs=json.load(urllib.request.urlopen("http://127.0.0.1:"+port+"/json/list"))
    ws=websocket.create_connection(next(t["webSocketDebuggerUrl"] for t in tabs if t["type"]=="page"),timeout=30)
    send("Page.enable");send("Runtime.enable")
    scenes=json.loads((ROOT/"docs/design/m1/scenes.js").read_text(encoding="utf-8").removeprefix("window.SG_SCENES = ").strip().removesuffix(";"))
    for s in scenes:
        for state in s["states"]:
            result=nav(base+"/docs/design/m1/index.html?screen="+s["id"]+"&state="+state)
            report["renders"].append({"screen":s["id"],"state":state,"lang":"en","theme":"light","width":1440,**result})
        result=nav(base+"/docs/design/m1/index.html?screen="+s["id"]+"&lang=am&theme=dark",390,1100)
        report["renders"].append({"screen":s["id"],"state":"default","lang":"am","theme":"dark","width":390,**result})
        for narrow in [320,430]:
            result=nav(base+"/docs/design/m1/index.html?screen="+s["id"],narrow,1100)
            report["renders"].append({"screen":s["id"],"state":"default","lang":"en","theme":"light","width":narrow,**result})
        if s["platform"] in ["MW","AW"]:result=nav(base+"/docs/design/m1/index.html?screen="+s["id"],768,1100);report["renders"].append({"screen":s["id"],"state":"default","lang":"en","theme":"light","width":768,**result})
        nav(base+"/docs/design/m1/index.html?screen="+s["id"])
        screenshot("docs/design/m1/previews/"+s["id"]+".png",".phone" if s["platform"] in ["CM","MM","CM/MM"] else "#stage")
        print("Rendered "+s["id"],flush=True)
    for screen,state,lang,theme in [("register","validation","en","light"),("verify","expired","en","light"),("verify","rate-limited","en","light"),("application","error","en","light"),("application-status","pending","am","light"),("application-status","recovery","en","light"),("switch-mode","denied","en","light"),("admin-review","confirmation","en","light"),("admin-review","denied","en","light"),("signin","offline","en","light"),("signin","default","am","light"),("register","default","am","dark")]:
        nav(base+"/docs/design/m1/index.html?"+urllib.parse.urlencode({"screen":screen,"state":state,"lang":lang,"theme":theme}))
        screenshot("docs/design/m1/previews/"+screen+"--"+state+"--"+lang+"--"+theme+".png",None if state=="confirmation" else "#stage")
    nav(base+"/docs/design/m1/index.html?screen=register")
    ev("document.querySelector('#design-form').requestSubmit()")
    check("M1 registration rejects empty input and focuses a field","document.querySelector('[aria-invalid=true]')!==null && document.activeElement?.name==='contact'")
    nav(base+"/docs/design/m1/index.html?screen=verify")
    ev("document.querySelector('#code').value='000000';document.querySelector('#design-form').requestSubmit()")
    check("M1 wrong demo OTP shows validation","document.querySelector('#code').getAttribute('aria-invalid')==='true'")
    nav(base+"/docs/design/m1/index.html?screen=verify&state=expired")
    check("Expired verification cannot submit","document.querySelector('button[type=submit]').disabled===true")
    nav(base+"/docs/design/m1/index.html?screen=admin-review&state=pending")
    check("Pending review prevents duplicate decision controls","Array.from(document.querySelectorAll('.ops .actions button')).every(b=>b.disabled)")
    nav(base+"/docs/design/m1/index.html?screen=verify")
    ev("document.querySelector('#code').value='123456';document.querySelector('#design-form').requestSubmit()");time.sleep(.7)
    check("M1 valid fixture shows clearly simulated result","document.querySelector('.notice.success')?.textContent.includes('Simulated')")
    nav(base+"/docs/design/m1/index.html?screen=admin-review")
    ev("document.querySelector('[data-action=\"confirm:approve\"]').click()")
    check("Admin review requires a reason before confirmation","document.querySelector('#decision-error')!==null && document.querySelector('dialog[open]')===null")
    ev("document.querySelector('#review-note').value='Sample evidence reviewed';document.querySelector('[data-action=\"confirm:approve\"]').click()")
    check("Admin decision opens explicit confirmation","document.querySelector('dialog[open]')!==null")
    check("Confirmation has accessible name and initial focus inside","document.querySelector('dialog[open]').hasAttribute('aria-label') && document.activeElement.closest('dialog')!==null")
    ev("document.querySelector('dialog [data-action=\"close-dialog\"]').click()")
    check("Confirmation can be cancelled without success","document.querySelector('dialog[open]')===null && document.querySelector('.notice.success')===null")
    nav(base+"/docs/design/m1/index.html?screen=admin-review&state=denied")
    check("Denied reviewer cannot see document/detail workspace","document.querySelector('.review-grid').hidden===true")
    nav(base+"/docs/design/m1/index.html?screen=admin-review&state=empty")
    check("Empty review queue represented","document.querySelector('.notice')?.textContent.includes('No applications')")
    nav((ROOT/"docs/design/m1/index.html").as_uri()+"?screen=register")
    check("M1 review opens directly from a local file","document.querySelector('h1')?.textContent.includes('Create your account') && document.fonts.check('16px Inter')")
    nav((ROOT/"docs/design/m0/index.html").as_uri()+"?scenario=split")
    check("Walkthrough opens directly with a shared scenario URL","document.querySelector('#scenario').value==='split' && document.querySelector('[data-action=next]')!==null")
    # Walkthroughs are local design interactions; test every branch to avoid claiming a static mock is interactive.
    for scenario in ["standard","failure","unknown","split","offline"]:
        nav(base+"/docs/design/m0/index.html")
        ev("document.querySelector('#scenario').value="+json.dumps(scenario)+";document.querySelector('#scenario').dispatchEvent(new Event('change'))")
        ev("document.querySelector('[data-action=next]').click();document.querySelector('[data-action=next]').click()")
        check(scenario+": variant required before cart","document.querySelector('[data-action=next]').disabled===true")
        ev("document.querySelector('[data-action=natural]').click();document.querySelector('[data-action=next]').click()")
        screenshot("docs/design/m0/previews/"+scenario+"-cart.png",".phone")
        ev("document.querySelector('[data-action=next]').click()")
        if scenario=="offline":
            check("Offline checkout blocks purchase","document.querySelector('[data-action=reconnect]')!==null && document.querySelector('[data-action=next]')===null")
            ev("document.querySelector('[data-action=reconnect]').click()")
        ev("document.querySelector('[data-action=next]').click()")
        if scenario=="failure":
            ev("document.querySelector('[data-action=fail]').click()")
            check("Failed payment retains recovery without false no-charge claim","document.querySelector('.notice.error')?.textContent.includes('Reconcile')")
            screenshot("docs/design/m0/previews/payment-failure.png",".phone")
            ev("document.querySelector('[data-action=retry]').click()")
        if scenario=="unknown":
            ev("document.querySelector('[data-action=unknown]').click()")
            check("Unknown payment remains unconfirmed","document.querySelector('.notice.warning')?.textContent.includes('not yet known')")
            screenshot("docs/design/m0/previews/payment-unknown.png",".phone")
        ev("document.querySelector('[data-action=pay]').click()")
        if scenario=="split":
            check("One merchant payment cannot confirm both orders","document.querySelector('[data-action=next]')===null")
            screenshot("docs/design/m0/previews/partial-payment.png",".phone")
            ev("document.querySelector('[data-action=fail]').click();document.querySelector('[data-action=retry]').click();document.querySelector('[data-action=pay]').click()")
        check(scenario+": explicit simulated verification unlocks order","document.querySelector('[data-action=next]')!==null")
        ev("document.querySelector('[data-action=next]').click()")
        if scenario=="standard":screenshot("docs/design/m0/previews/order-confirmed.png",".phone")
        ev("document.querySelector('[data-action=next]').click()")
        check(scenario+": packing required before dispatch","document.querySelector('[data-action=dispatch]').disabled===true")
        ev("document.querySelector('#packed').checked=true;document.querySelector('#packed').dispatchEvent(new Event('change'));document.querySelector('[data-action=dispatch]').click()")
        if scenario=="standard":screenshot("docs/design/m0/previews/tracking.png",".phone")
        ev("document.querySelector('[data-action=next]').click()")
        check(scenario+": delivery is clearly a sample","document.querySelector('h1')?.textContent.includes('sample only')")
    nav(base+"/docs/design/m0/index.html")
    ev("document.querySelector('[data-action=next]').click()");screenshot("docs/design/m0/previews/discovery.png",".phone")
    # Representative export boards; individual PNGs remain full resolution.
    for name,ids,cols,width in [("mobile-overview",["register","signin","verify","recover","profile","language","application","application-status","switch-mode","sessions","permissions","account-actions"],4,340),("web-overview",["merchant-signin","admin-signin","admin-mfa","admin-review"],2,680)]:
        images=[]
        for sid in ids:
            im=Image.open(ROOT/("docs/design/m1/previews/"+sid+".png")).convert("RGB")
            im.thumbnail((width,800 if cols==4 else 620))
            images.append((sid,im))
        cellh=max(im.height for _,im in images)+60;board=Image.new("RGB",(cols*(width+30)+30,((len(images)+cols-1)//cols)*cellh+50),"#F5F5EF");d=ImageDraw.Draw(board);d.text((30,15),"SEGNO GEBEYA / M1 DESIGN REVIEW / UNAPPROVED",fill="#152B26")
        for n,(sid,im) in enumerate(images):
            x=30+(n%cols)*(width+30);y=50+(n//cols)*cellh;d.text((x,y),sid,fill="#152B26");board.paste(im,(x,y+25))
        board.save(ROOT/("docs/design/m1/"+name+".png"));report["screenshots"].append("docs/design/m1/"+name+".png")
    report["summary"]={"renders":len(report["renders"]),"overflow_failures":sum(bool(r["overflow"]) for r in report["renders"]),"missing_headings":sum(not r["heading"] for r in report["renders"]),"font_failures":sum(not r["fontLoaded"] for r in report["renders"]),"interaction_checks":len(report["interaction_checks"]),"interaction_failures":sum(not c["passed"] for c in report["interaction_checks"]),"exceptions":len(report["exceptions"])}
    (OUT/"QA_RESULTS.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report["summary"]),flush=True)
finally:
    if ws:
        try:send("Browser.close")
        except Exception:pass
        ws.close()
    try:proc.wait(timeout=10)
    except subprocess.TimeoutExpired:proc.terminate()
    server.shutdown()

