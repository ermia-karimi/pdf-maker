// ==================== Snap2PDF with pdf-lib ====================
// Zero-compression, full original image quality, per-image page, multi-worker ready

import { PDFDocument } from 'pdf-lib';

let pickedImages = [];
const inputEl = document.getElementById("imagePicker");
const convertBtn = document.getElementById("convertBtn");
const statusEl = document.getElementById("hh11");

function setStatus(t){ statusEl.innerText = t; }

inputEl.addEventListener("change", (e) => {
    pickedImages = Array.from(e.target.files || []);
    setStatus(`Selected ${pickedImages.length} images`);
});

async function fileToArrayBuffer(file){
    return await file.arrayBuffer();
}

async function buildPDF(){
    if (!pickedImages.length){ alert("Select images first."); return; }
    setStatus("Creating PDF...");

    const pdfDoc = await PDFDocument.create();

    let done = 0;
    for(const file of pickedImages){
        const arrayBuffer = await fileToArrayBuffer(file);
        let img;
        if(file.type.includes('png')){
            img = await pdfDoc.embedPng(arrayBuffer);
        } else {
            img = await pdfDoc.embedJpg(arrayBuffer);
        }

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x:0, y:0, width: img.width, height: img.height });

        done++;
        setStatus(`Processed ${done}/${pickedImages.length}`);
        await new Promise(r=>setTimeout(r,1)); // yield to UI
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], {type: 'application/pdf'});
    const fileOut = new File([blob], 'Snap2Pdf_FullQuality.pdf', {type:'application/pdf'});

    if(navigator.canShare && navigator.canShare({files:[fileOut]})){
        await navigator.share({ files:[fileOut], title: 'PDF', text:'Your PDF is ready' });
    } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(fileOut);
        a.download = fileOut.name;
        a.click();
    }

    setStatus("Done.");
}

convertBtn.addEventListener("click", buildPDF);



































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



