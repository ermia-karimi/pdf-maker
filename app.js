// ==================== app.js ====================
// Snap2PDF Ultimate: Multi-Worker + Fit / A4 / A5 / Letter + Zero Compression

const WORKER_COUNT = 4;
let pickedImages = [];

// DOM
const inputEl = document.getElementById("imagePicker");
const convertBtn = document.getElementById("convertBtn");
const statusEl = document.getElementById("hh11");
const sizeButtons = document.getElementById("sizeButtons");

function setStatus(t){ statusEl.innerText = t; }

inputEl.addEventListener("change", (e) => {
    pickedImages = Array.from(e.target.files || []);
    setStatus(`Selected ${pickedImages.length} images`);
});

sizeButtons.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".size-btn");
    if (!btn) return;
    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    pdfSize = btn.dataset.size || "a4";
});

// Worker Pool
function createWorkerPool(workerScript, size) {
    let workers = [];
    let queue = [];
    let busy = new Array(size).fill(false);
    for (let i = 0; i < size; i++) {
        const w = new Worker(workerScript);
        w.onmessage = (e) => {
            busy[i] = false;
            queue[i].resolve(e.data);
            queue[i] = null;
            runNext();
        };
        workers.push(w);
    }

    function runNext() {
        for (let i = 0; i < size; i++) {
            if (!busy[i] && tasks.length) {
                const task = tasks.shift();
                busy[i] = true;
                queue[i] = task;
                workers[i].postMessage(task.file);
            }
        }
    }

    let tasks = [];

    return function runTask(file) {
        return new Promise((resolve, reject) => {
            tasks.push({ file, resolve, reject });
            runNext();
        });
    };
}

const processWithWorker = createWorkerPool("worker-img.js", WORKER_COUNT);

// Helpers
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function loadImage(src){
    return new Promise((res, rej)=>{
        const img = new Image();
        img.onload = ()=>res(img);
        img.onerror=rej;
        img.src=src;
    });
}

// PDF Creation
convertBtn.addEventListener("click", async () => {
    if (!pickedImages.length){ alert("Select images first."); return; }

    setStatus("Processing...");
    const { jsPDF } = window.jspdf;
    let pdf;

    function getPageSize(size){
        switch(size){
            case "a4": return [595,842];
            case "a5": return [420,595];
            case "letter": return [612,792];
            case "fit": return "fit";
            default: return [595,842];
        }
    }

    const selectedSize = getPageSize(pdfSize);
    let pageW, pageH;

    if (selectedSize === "fit"){
        const firstPng = await processWithWorker(pickedImages[0]);
        const firstImg = await loadImage(firstPng);
        pageW = firstImg.width;
        pageH = firstImg.height;
        pdf = new jsPDF({ unit: "px", format: [pageW,pageH], compress:false });
        pdf.addImage(firstPng,"PNG",0,0,pageW,pageH);
    } else {
        pageW = selectedSize[0];
        pageH = selectedSize[1];
        pdf = new jsPDF({ unit:"px", format:selectedSize, compress:false });
    }

    let startIndex = (pdfSize === "fit") ? 1 : 0;
    let done = startIndex;

    for (let i=startIndex;i<pickedImages.length;i++){
        const pngDataURL = await processWithWorker(pickedImages[i]);
        const img = await loadImage(pngDataURL);
        const scale = Math.min(pageW/img.width,pageH/img.height,1);
        const w=img.width*scale;
        const h=img.height*scale;
        const x=(pageW-w)/2;
        const y=(pageH-h)/2;
        pdf.addPage([pageW,pageH]);
        pdf.addImage(pngDataURL,"PNG",x,y,w,h);
        done++;
        setStatus(`Processed ${done}/${pickedImages.length}`);
        await sleep(1);
    }

    const blob = pdf.output("blob");
    const file = new File([blob],"HighQuality.pdf",{type:"application/pdf"});
    if (navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:"PDF"});
    } else pdf.save("HighQuality.pdf");

    setStatus("Done.");
});

// Service Worker
if ('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js'));
}


// ==================== worker-img.js ====================
self.onmessage = async (e) => {
    const file = e.data;
    const dataURL = await readFile(file);
    const img = await loadImage(dataURL);
    const canvas = new OffscreenCanvas(img.width,img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);
    const pngBlob = await canvas.convertToBlob({type:"image/png"});
    const pngDataURL = await blobToDataURL(pngBlob);
    self.postMessage(pngDataURL);
};

function readFile(file){
    return new Promise(res=>{
        const fr = new FileReader();
        fr.onload=()=>res(fr.result);
        fr.readAsDataURL(file);
    });
}

function blobToDataURL(blob){
    return new Promise(res=>{
        const fr = new FileReader();
        fr.onload=()=>res(fr.result);
        fr.readAsDataURL(blob);
    });
}

function loadImage(src){
    return new Promise((res,rej)=>{
        const img=new Image();
        img.onload=()=>res(img);
        img.onerror=rej;
        img.src=src;
    });
}






































// // Snap2Pdf - Maximum Quality + Fast Mode

// let pickedImages = [];
// let pdfSize = "a4";

// /* ---------- Toast ---------- */
// function showToast(msg = "", duration = 2000) {
//     const t = document.getElementById("toast");
//     t.innerText = msg;
//     t.classList.add("show");
//     clearTimeout(showToast._t);
//     showToast._t = setTimeout(() => t.classList.remove("show"), duration);
// }

// /* ---------- انتخاب عکس ---------- */
// document.getElementById("imagePicker").addEventListener("change", async (e) => {
//     showToast("Loading photos...");
//     pickedImages = Array.from(e.target.files || []);
//     await new Promise(r => setTimeout(r, 40));
//     showToast(`Selected: ${pickedImages.length} photos`, 1200);
// });

// /* ---------- انتخاب سایز ---------- */
// document.querySelectorAll(".size-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         document.querySelectorAll(".size-btn").forEach(x => x.classList.remove("active"));
//         btn.classList.add("active");
//         pdfSize = btn.dataset.size;
//     });
// });

// /* ---------- Base64 Reader ---------- */
// function fileToBase64(file) {
//     return new Promise(res => {
//         const reader = new FileReader();
//         reader.onload = () => res(reader.result);
//         reader.readAsDataURL(file);
//     });
// }

// /* ---------- Load Image ---------- */
// function loadImage(src) {
//     return new Promise((res, rej) => {
//         const img = new Image();
//         img.onload = () => res(img);
//         img.onerror = rej;
//         img.src = src;
//     });
// }

// /* ---------- PDF Generation (MAX QUALITY + FAST) ---------- */
// document.getElementById("convertBtn").addEventListener("click", async () => {
//     if (!pickedImages.length) {
//         showToast("Select images first.", 2000);
//         return;
//     }

//     showToast("Creating PDF...");

//     const { jsPDF } = window.jspdf;

//     const pdf = new jsPDF({
//         unit: "px",
//         format: pdfSize === "fit" ? "a4" : pdfSize,
//         compress: false          // ← بیشترین کیفیت، بدون فشرده‌سازی
//     });

//     const pageW = pdf.internal.pageSize.getWidth();
//     const pageH = pdf.internal.pageSize.getHeight();

//     const CHUNK = 8;
//     for (let i = 0; i < pickedImages.length; i++) {

//         if (i % CHUNK === 0) await new Promise(r => setTimeout(r, 25));

//         const base64 = await fileToBase64(pickedImages[i]);
//         const img = await loadImage(base64);

//         const maxW = pageW - 20;
//         const maxH = pageH - 20;
//         const scale = Math.min(maxW / img.width, maxH / img.height, 1);
//         const w = img.width * scale;
//         const h = img.height * scale;

//         const x = (pageW - w) / 2;
//         const y = (pageH - h) / 2;

//         if (i !== 0) pdf.addPage();

//         pdf.addImage(base64, "JPEG", x, y, w, h, undefined, "NONE", 1.0);
//     }

//     const blob = pdf.output("blob");
//     const pdfFile = new File([blob], "Snap2Pdf.pdf", { type: "application/pdf" });

//     showToast("PDF Ready!");

//     if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
//         try { await navigator.share({ files: [pdfFile] }); } catch { }
//     } else {
//         pdf.save("Snap2Pdf.pdf");
//     }
// });



